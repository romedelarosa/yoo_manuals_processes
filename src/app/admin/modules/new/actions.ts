"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createModuleAction(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const title = readString(formData, "title");
  const category = readString(formData, "category") || "Company-wide";
  const currentVersion = readString(formData, "version") || "1.0.0";
  const estimatedMinutes = Math.max(readNumber(formData, "estimatedMinutes", 10), 1);
  const description = readString(formData, "description");
  const lessonContent = readString(formData, "lessonContent");
  const businessSlugs = formData.getAll("businessIds").map(String).filter(Boolean);
  const roleSlugs = formData.getAll("employeeRoleIds").map(String).filter(Boolean);
  const required = formData.get("required") === "on";
  const acknowledgmentRequired = formData.get("acknowledgmentRequired") === "on";

  if (!title || !description || !lessonContent) {
    redirect("/admin/modules/new?message=Title, description, and lesson content are required.");
  }

  if (businessSlugs.length === 0 || roleSlugs.length === 0) {
    redirect("/admin/modules/new?message=Select at least one business and one employee role.");
  }

  const { data: moduleRow, error: moduleError } = await supabase
    .from("modules")
    .insert({
      title,
      description,
      category,
      current_version: currentVersion,
      estimated_minutes: estimatedMinutes,
      required,
      acknowledgment_required: acknowledgmentRequired,
      is_active: true,
      created_by: profile?.id,
    })
    .select("id")
    .single();

  if (moduleError || !moduleRow?.id) {
    redirect(
      `/admin/modules/new?message=${encodeURIComponent(moduleError?.message ?? "Could not create module.")}`,
    );
  }

  const moduleId = moduleRow.id as string;

  const [{ data: businessRows }, { data: roleRows }] = await Promise.all([
    supabase.from("businesses").select("id,slug").in("slug", businessSlugs),
    supabase.from("employee_roles").select("id,slug").in("slug", roleSlugs),
  ]);

  await Promise.all([
    businessRows?.length
      ? supabase.from("module_businesses").insert(
          businessRows.map((business) => ({
            module_id: moduleId,
            business_id: business.id,
          })),
        )
      : Promise.resolve(),
    roleRows?.length
      ? supabase.from("module_roles").insert(
          roleRows.map((role) => ({
            module_id: moduleId,
            employee_role_id: role.id,
          })),
        )
      : Promise.resolve(),
    supabase.from("module_sections").insert({
      module_id: moduleId,
      title: "Lesson",
      content: lessonContent,
      sort_order: 1,
    }),
    supabase.from("policy_versions").insert({
      module_id: moduleId,
      version: currentVersion,
      change_notes: "Initial module version",
      published_by: profile?.id,
      requires_reacknowledgment: acknowledgmentRequired,
    }),
  ]);

  if (formData.get("quizRequired") === "on") {
    const { data: quizRow } = await supabase
      .from("quizzes")
      .insert({
        module_id: moduleId,
        passing_score: readNumber(formData, "passingScore", 80),
        is_required: true,
        access_enabled: formData.get("checkpointOpen") === "on",
        assessment_mode: readString(formData, "assessmentMode") || "closed_reference",
        time_limit_minutes: readNumber(formData, "timeLimitMinutes", 10),
        max_attempts: readNumber(formData, "maxAttempts", 2),
        randomize_questions: true,
        unlock_requires_sections_read: true,
      })
      .select("id")
      .single();

    if (quizRow?.id) {
      const questions = readQuestions(formData, String(quizRow.id));
      if (questions.length > 0) {
        await supabase.from("quiz_questions").insert(questions);
      }
    }
  }

  if (formData.get("blueprintEnabled") === "on") {
    const blueprintTitle = readString(formData, "blueprintTitle") || `${title} Blueprint`;
    const blueprintDescription = readString(formData, "blueprintDescription");
    const { data: blueprintRow } = await supabase
      .from("process_blueprints")
      .insert({
        module_id: moduleId,
        title: blueprintTitle,
        description: blueprintDescription,
      })
      .select("id")
      .single();

    if (blueprintRow?.id) {
      await insertBlueprintSteps(formData, String(blueprintRow.id));
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath("/dashboard");
  redirect("/admin/modules");
}

function readQuestions(formData: FormData, quizId: string) {
  const count = readNumber(formData, "questionCount", 0);
  const questions = [];

  for (let index = 0; index < count; index += 1) {
    const question = readString(formData, `question_${index}`);
    const options = [0, 1, 2]
      .map((optionIndex) => readString(formData, `question_${index}_option_${optionIndex}`))
      .filter(Boolean);
    const answer = readString(formData, `question_${index}_answer`);

    if (!question || options.length === 0 || !answer) continue;

    questions.push({
      quiz_id: quizId,
      question,
      options,
      correct_answer: { answer },
      explanation: readString(formData, `question_${index}_explanation`),
      difficulty: readString(formData, `question_${index}_difficulty`) || "easy",
      topic_tag: readString(formData, `question_${index}_topicTag`),
      source: "manual",
      is_active: formData.get(`question_${index}_active`) === "on",
    });
  }

  return questions;
}

async function insertBlueprintSteps(formData: FormData, blueprintId: string) {
  const supabase = await createSupabaseServerClient();
  const count = readNumber(formData, "blueprintStepCount", 0);
  const roleSlugs = Array.from(
    new Set(
      Array.from({ length: count }, (_, index) =>
        readString(formData, `blueprintStep_${index}_role`),
      ).filter(Boolean),
    ),
  );
  const { data: roles } = roleSlugs.length
    ? await supabase.from("employee_roles").select("id,slug").in("slug", roleSlugs)
    : { data: [] };
  const roleIdBySlug = new Map((roles ?? []).map((role) => [role.slug, role.id]));

  const steps = Array.from({ length: count }, (_, index) => {
    const title = readString(formData, `blueprintStep_${index}_title`);
    const description = readString(formData, `blueprintStep_${index}_description`);
    const roleSlug = readString(formData, `blueprintStep_${index}_role`);

    if (!title || !description) return null;

    return {
      blueprint_id: blueprintId,
      title,
      description,
      owner_role_id: roleIdBySlug.get(roleSlug) ?? null,
      escalation: readString(formData, `blueprintStep_${index}_escalation`),
      sort_order: index + 1,
    };
  }).filter((step): step is NonNullable<typeof step> => Boolean(step));

  if (steps.length > 0) {
    await supabase.from("process_steps").insert(steps);
  }
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNumber(formData: FormData, key: string, fallback: number) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}
