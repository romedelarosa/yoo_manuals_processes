import { businesses as fallbackBusinesses, employeeRoles, employees, modules, systemRoles } from "./mock-data";
import { createSupabaseServerClient, isSupabaseConfigured } from "./supabase/server";
import type {
  Business,
  BusinessId,
  EmployeeProfile,
  EmployeeRoleId,
  ManualModule,
  ModuleAttachment,
  ModuleCategory,
  ModuleSection,
  ProcessBlueprint,
  QuizQuestion,
  SystemRoleId,
} from "./types";

type AnyRecord = Record<string, unknown>;

export type AdminDashboardMetrics = {
  activeEmployees: number;
  publishedModules: number;
  requiredModules: number;
  optionalModules: number;
  acknowledgmentRate: number;
  acknowledgmentCompleted: number;
  acknowledgmentTotal: number;
  pendingRequired: number;
};

export type CompletionReportRow = {
  employeeId: string;
  employee: string;
  business: string;
  assigned: number;
  completed: number;
  acknowledged: number;
  pendingRequired: number;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  if (!isSupabaseConfigured()) {
    const requiredModules = modules.filter((module) => module.required).length;
    const optionalModules = modules.filter((module) => !module.required).length;

    return {
      activeEmployees: employees.filter((employee) => employee.status === "active").length,
      publishedModules: modules.filter((module) => module.active).length,
      requiredModules,
      optionalModules,
      acknowledgmentRate: 0,
      acknowledgmentCompleted: 0,
      acknowledgmentTotal: 0,
      pendingRequired: 0,
    };
  }

  const supabase = await createSupabaseServerClient();
  const [profilesResult, modulesResult, progressResult, acknowledgmentsResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          `
          id,
          status,
          user_businesses(businesses(slug)),
          user_employee_roles(employee_roles(slug))
        `,
        )
        .eq("status", "active"),
      supabase
        .from("modules")
        .select(
          `
          id,
          required,
          acknowledgment_required,
          is_active,
          current_version,
          module_businesses(businesses(slug)),
          module_roles(employee_roles(slug))
        `,
        )
        .eq("is_active", true),
      supabase.from("progress").select("user_id,module_id,status"),
      supabase.from("acknowledgments").select("user_id,module_id,module_version"),
    ]);

  const activeProfiles = ((profilesResult.data ?? []) as AnyRecord[]).map((profile) => ({
    id: asString(profile.id),
    businessIds: uniqueSlugs(profile.user_businesses, "businesses"),
    roleIds: uniqueSlugs(profile.user_employee_roles, "employee_roles"),
  }));

  const activeModules = ((modulesResult.data ?? []) as AnyRecord[]).map((module) => ({
    id: asString(module.id),
    required: Boolean(module.required),
    acknowledgmentRequired: Boolean(module.acknowledgment_required),
    version: asString(module.current_version, "1.0.0"),
    businessIds: uniqueSlugs(module.module_businesses, "businesses"),
    roleIds: uniqueSlugs(module.module_roles, "employee_roles"),
  }));

  const completedProgress = new Set(
    ((progressResult.data ?? []) as AnyRecord[])
      .filter((record) => record.status === "completed")
      .map((record) => `${asString(record.user_id)}:${asString(record.module_id)}`),
  );
  const acknowledgments = new Set(
    ((acknowledgmentsResult.data ?? []) as AnyRecord[]).map(
      (record) =>
        `${asString(record.user_id)}:${asString(record.module_id)}:${asString(record.module_version)}`,
    ),
  );

  const assignedPairs = activeProfiles.flatMap((profile) =>
    activeModules
      .filter((module) => moduleMatchesProfile(module, profile))
      .map((module) => ({ profile, module })),
  );
  const requiredPairs = assignedPairs.filter(({ module }) => module.required);
  const acknowledgmentPairs = assignedPairs.filter(
    ({ module }) => module.acknowledgmentRequired,
  );
  const acknowledgmentCompleted = acknowledgmentPairs.filter(({ profile, module }) =>
    acknowledgments.has(`${profile.id}:${module.id}:${module.version}`),
  ).length;
  const acknowledgmentTotal = acknowledgmentPairs.length;

  return {
    activeEmployees: activeProfiles.length,
    publishedModules: activeModules.length,
    requiredModules: activeModules.filter((module) => module.required).length,
    optionalModules: activeModules.filter((module) => !module.required).length,
    acknowledgmentRate:
      acknowledgmentTotal > 0
        ? Math.round((acknowledgmentCompleted / acknowledgmentTotal) * 100)
        : 0,
    acknowledgmentCompleted,
    acknowledgmentTotal,
    pendingRequired: requiredPairs.filter(
      ({ profile, module }) => !completedProgress.has(`${profile.id}:${module.id}`),
    ).length,
  };
}

export async function getCompletionReportRows(): Promise<CompletionReportRow[]> {
  const [employeeRows, moduleRows] = await Promise.all([getEmployees(), getModules()]);

  if (!isSupabaseConfigured()) {
    return employeeRows.map((employee) => ({
      employeeId: employee.id,
      employee: employee.fullName,
      business: formatBusinessList(employee.businessIds),
      assigned: moduleRows.filter((module) =>
        moduleMatchesProfile(
          { businessIds: module.businessIds, roleIds: module.employeeRoleIds },
          { businessIds: employee.businessIds, roleIds: employee.employeeRoleIds },
        ),
      ).length,
      completed: 0,
      acknowledged: 0,
      pendingRequired: 0,
    }));
  }

  const supabase = await createSupabaseServerClient();
  const [progressResult, acknowledgmentsResult] = await Promise.all([
    supabase.from("progress").select("user_id,module_id,status"),
    supabase.from("acknowledgments").select("user_id,module_id,module_version"),
  ]);

  const completedProgress = new Set(
    ((progressResult.data ?? []) as AnyRecord[])
      .filter((record) => record.status === "completed")
      .map((record) => `${asString(record.user_id)}:${asString(record.module_id)}`),
  );
  const acknowledgments = new Set(
    ((acknowledgmentsResult.data ?? []) as AnyRecord[]).map(
      (record) =>
        `${asString(record.user_id)}:${asString(record.module_id)}:${asString(record.module_version)}`,
    ),
  );

  return employeeRows.map((employee) => {
    const assignedModules = moduleRows.filter((module) =>
      moduleMatchesProfile(
        { businessIds: module.businessIds, roleIds: module.employeeRoleIds },
        { businessIds: employee.businessIds, roleIds: employee.employeeRoleIds },
      ),
    );

    const completed = assignedModules.filter((module) =>
      completedProgress.has(`${employee.id}:${module.id}`),
    ).length;
    const acknowledged = assignedModules.filter((module) =>
      acknowledgments.has(`${employee.id}:${module.id}:${module.version}`),
    ).length;
    const pendingRequired = assignedModules.filter(
      (module) =>
        module.required && !completedProgress.has(`${employee.id}:${module.id}`),
    ).length;

    return {
      employeeId: employee.id,
      employee: employee.fullName || employee.email,
      business: formatBusinessList(employee.businessIds),
      assigned: assignedModules.length,
      completed,
      acknowledged,
      pendingRequired,
    };
  });
}

export async function getBusinesses(): Promise<Business[]> {
  if (!isSupabaseConfigured()) {
    return fallbackBusinesses;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("slug,name")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return fallbackBusinesses;
  }

  if (!data?.length) {
    return [];
  }

  return data.map((business) => ({
    id: business.slug as BusinessId,
    name: business.name,
    shortName: business.name.includes("YOO") ? "YOO" : "ORI",
  }));
}

export async function getRoleDefinitions() {
  if (!isSupabaseConfigured()) {
    return { systemRoles, employeeRoles };
  }

  const supabase = await createSupabaseServerClient();
  const [systemResult, employeeResult] = await Promise.all([
    supabase.from("system_roles").select("slug,name,permissions").order("name"),
    supabase.from("employee_roles").select("slug,name,description").order("name"),
  ]);

  return {
    systemRoles:
      systemResult.data?.map((role) => ({
        id: role.slug as SystemRoleId,
        name: role.name,
        description: JSON.stringify(role.permissions ?? {}),
      })) ?? systemRoles,
    employeeRoles:
      employeeResult.data?.map((role) => ({
        id: role.slug as EmployeeRoleId,
        name: role.name,
        description: role.description ?? "",
      })) ?? employeeRoles,
  };
}

export async function getEmployees(): Promise<EmployeeProfile[]> {
  if (!isSupabaseConfigured()) {
    return employees;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      job_title,
      status,
      user_businesses(businesses(slug)),
      user_system_roles(system_roles(slug)),
      user_employee_roles(employee_roles(slug))
    `,
    )
    .eq("status", "active")
    .order("full_name");

  if (error) {
    return employees;
  }

  if (!data?.length) {
    return [];
  }

  return data.map((profile: AnyRecord) => ({
    id: asString(profile.id),
    fullName: asString(profile.full_name),
    email: asString(profile.email),
    jobTitle: asString(profile.job_title, "Employee"),
    businessIds: uniqueSlugs(profile.user_businesses, "businesses") as BusinessId[],
    employeeRoleIds: uniqueSlugs(profile.user_employee_roles, "employee_roles") as EmployeeRoleId[],
    systemRoleIds: uniqueSlugs(profile.user_system_roles, "system_roles") as SystemRoleId[],
    status: asString(profile.status, "active") as EmployeeProfile["status"],
  }));
}

export async function getModules(): Promise<ManualModule[]> {
  if (!isSupabaseConfigured()) {
    return modules;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("modules")
    .select(
      `
      *,
      module_sections(*),
      module_businesses(businesses(slug)),
      module_roles(employee_roles(slug)),
      module_attachments(*),
      quizzes(*, quiz_questions(*)),
      process_blueprints(*, process_steps(*, employee_roles(slug)), process_step_connections(*))
    `,
    )
    .eq("is_active", true)
    .order("title");

  if (error) {
    return modules;
  }

  if (!data?.length) {
    return [];
  }

  return data.map(mapModuleRow);
}

export async function getModule(moduleId: string): Promise<ManualModule | undefined> {
  const allModules = await getModules();
  return allModules.find((manualModule) => manualModule.id === moduleId);
}

function mapModuleRow(row: AnyRecord): ManualModule {
  const sections = ((row.module_sections ?? []) as AnyRecord[])
    .toSorted((a, b) => asNumber(a.sort_order, 0) - asNumber(b.sort_order, 0))
    .map(
      (section): ModuleSection => ({
        id: asString(section.id),
        title: asString(section.title),
        body: asString(section.content),
      }),
    );

  const quizRow = Array.isArray(row.quizzes) ? row.quizzes[0] : row.quizzes;
  const blueprintRow = Array.isArray(row.process_blueprints)
    ? row.process_blueprints[0]
    : row.process_blueprints;

  return {
    id: asString(row.id),
    title: asString(row.title),
    description: asString(row.description),
    category: asString(row.category, "Company-wide") as ModuleCategory,
    businessIds: uniqueSlugs(row.module_businesses, "businesses") as BusinessId[],
    employeeRoleIds: uniqueSlugs(row.module_roles, "employee_roles") as EmployeeRoleId[],
    required: Boolean(row.required),
    acknowledgmentRequired: Boolean(row.acknowledgment_required),
    active: Boolean(row.is_active),
    version: asString(row.current_version, "1.0.0"),
    estimatedMinutes: asNumber(row.estimated_minutes, 10),
    sections,
    attachments: ((row.module_attachments ?? []) as AnyRecord[]).map(
      (attachment): ModuleAttachment => ({
        id: asString(attachment.id),
        title: asString(attachment.title),
        description: optionalString(attachment.description),
        fileName: asString(attachment.file_name),
        fileType: asString(attachment.file_type, "document") as ModuleAttachment["fileType"],
        mimeType: asString(attachment.mime_type),
        storagePath: asString(attachment.storage_path),
        sizeLabel: formatBytes(asNumber(attachment.file_size_bytes, 0)),
        downloadable: Boolean(attachment.downloadable),
        visibleToEmployees: Boolean(attachment.visible_to_employees),
      }),
    ),
    quiz: quizRow
      ? {
          passingScore: asNumber(quizRow.passing_score, 80),
          accessEnabled: Boolean(quizRow.access_enabled),
          assessmentMode: asString(quizRow.assessment_mode, "closed_reference") as "closed_reference",
          timeLimitMinutes: asNumber(quizRow.time_limit_minutes, 10),
          randomizeQuestions: Boolean(quizRow.randomize_questions),
          maxAttempts: asNumber(quizRow.max_attempts, 2),
          unlockRequiresSectionsRead: Boolean(quizRow.unlock_requires_sections_read),
          questions: ((quizRow.quiz_questions ?? []) as AnyRecord[])
            .filter((question) => question.is_active)
            .map(
              (question): QuizQuestion => ({
                id: asString(question.id),
                question: asString(question.question),
                options: Array.isArray(question.options) ? question.options.map((option) => asString(option)) : [],
                answer: readCorrectAnswer(question.correct_answer),
                explanation: optionalString(question.explanation),
                difficulty: asString(question.difficulty, "easy") as QuizQuestion["difficulty"],
                topicTag: optionalString(question.topic_tag),
                relatedSectionId: optionalString(question.module_section_id),
                active: Boolean(question.is_active),
                source: asString(question.source, "manual") as QuizQuestion["source"],
              }),
            ),
        }
      : undefined,
    blueprint: blueprintRow
      ? mapBlueprintRow(blueprintRow)
      : undefined,
  };
}

function mapBlueprintRow(row: AnyRecord): ProcessBlueprint {
  return {
    title: asString(row.title),
    description: asString(row.description),
    steps: ((row.process_steps ?? []) as AnyRecord[])
      .toSorted((a, b) => asNumber(a.sort_order, 0) - asNumber(b.sort_order, 0))
      .map((step) => ({
        id: asString(step.id),
        title: asString(step.title),
        description: asString(step.description),
        ownerRoleId: readRelationSlug(step.employee_roles, "general-staff") as EmployeeRoleId,
        escalation: optionalString(step.escalation),
      })),
    connections: ((row.process_step_connections ?? []) as AnyRecord[]).map(
      (connection) => ({
        from: asString(connection.from_step_id),
        to: asString(connection.to_step_id),
        label: optionalString(connection.label),
      }),
    ),
  };
}

function uniqueSlugs(rows: unknown, relationName: string) {
  if (!Array.isArray(rows)) return [];

  return Array.from(
    new Set(
      rows
        .map((row: AnyRecord) => {
          const relation = row[relationName] as AnyRecord | undefined;
          return relation?.slug;
        })
        .filter((slug): slug is string => Boolean(slug)),
    ),
  );
}

function moduleMatchesProfile(
  module: { businessIds: string[]; roleIds: string[] },
  profile: { businessIds: string[]; roleIds: string[] },
) {
  const businessMatch =
    module.businessIds.length === 0 ||
    module.businessIds.some((businessId) => profile.businessIds.includes(businessId));
  const roleMatch =
    module.roleIds.length === 0 ||
    module.roleIds.some((roleId) => profile.roleIds.includes(roleId));

  return businessMatch && roleMatch;
}

function formatBusinessList(businessIds: BusinessId[]) {
  if (businessIds.length === 0) return "Unassigned";
  return businessIds.map((businessId) => getBusinessDisplayName(businessId)).join(" + ");
}

function getBusinessDisplayName(businessId: BusinessId) {
  return (
    fallbackBusinesses.find((business) => business.id === businessId)?.name ??
    businessId
  );
}

function readRelationSlug(value: unknown, fallback = "") {
  if (!value || typeof value !== "object") return fallback;
  return asString((value as { slug?: unknown }).slug, fallback);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" ? value : fallback;
}

function readCorrectAnswer(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "answer" in value) {
    return asString((value as { answer?: unknown }).answer);
  }
  return "";
}
