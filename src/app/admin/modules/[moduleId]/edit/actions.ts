"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateModuleAction(moduleId: string, formData: FormData) {
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
    redirect(
      `/admin/modules/${moduleId}/edit?message=Title, description, and lesson content are required.`,
    );
  }

  if (businessSlugs.length === 0 || roleSlugs.length === 0) {
    redirect(
      `/admin/modules/${moduleId}/edit?message=Select at least one business and one employee role.`,
    );
  }

  const { error: moduleError } = await supabase
    .from("modules")
    .update({
      title,
      description,
      category,
      current_version: currentVersion,
      estimated_minutes: estimatedMinutes,
      required,
      acknowledgment_required: acknowledgmentRequired,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId);

  if (moduleError) {
    redirect(
      `/admin/modules/${moduleId}/edit?message=${encodeURIComponent(moduleError.message)}`,
    );
  }

  const [{ data: businessRows }, { data: roleRows }] = await Promise.all([
    supabase.from("businesses").select("id,slug").in("slug", businessSlugs),
    supabase.from("employee_roles").select("id,slug").in("slug", roleSlugs),
  ]);

  await Promise.all([
    supabase.from("module_businesses").delete().eq("module_id", moduleId),
    supabase.from("module_roles").delete().eq("module_id", moduleId),
    supabase.from("module_sections").delete().eq("module_id", moduleId),
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
    supabase.from("policy_versions").upsert(
      {
        module_id: moduleId,
        version: currentVersion,
        change_notes: "Module updated",
        published_by: profile?.id,
        requires_reacknowledgment: acknowledgmentRequired,
      },
      { onConflict: "module_id,version" },
    ),
  ]);

  await replaceQuiz(moduleId, formData);
  await replaceBlueprint(moduleId, title, formData);

  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath(`/admin/modules/${moduleId}/edit`);
  revalidatePath("/dashboard");
  revalidatePath(`/modules/${moduleId}`);
  redirect("/admin/modules");
}

async function replaceQuiz(moduleId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (formData.get("quizRequired") !== "on") {
    await supabase.from("quizzes").delete().eq("module_id", moduleId);
    return;
  }

  const { data: existingQuiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("module_id", moduleId)
    .maybeSingle();

  const payload = {
    module_id: moduleId,
    passing_score: readNumber(formData, "passingScore", 80),
    is_required: true,
    access_enabled: formData.get("checkpointOpen") === "on",
    assessment_mode: readString(formData, "assessmentMode") || "closed_reference",
    time_limit_minutes: readNumber(formData, "timeLimitMinutes", 10),
    max_attempts: readNumber(formData, "maxAttempts", 2),
    randomize_questions: true,
    unlock_requires_sections_read: true,
  };

  const { data: quizRow } = existingQuiz?.id
    ? await supabase
        .from("quizzes")
        .update(payload)
        .eq("id", existingQuiz.id)
        .select("id")
        .single()
    : await supabase.from("quizzes").insert(payload).select("id").single();

  if (!quizRow?.id) return;

  await supabase.from("quiz_questions").delete().eq("quiz_id", quizRow.id);
  const questions = readQuestions(formData, String(quizRow.id));
  if (questions.length > 0) {
    await supabase.from("quiz_questions").insert(questions);
  }
}

async function replaceBlueprint(moduleId: string, title: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  await supabase.from("process_blueprints").delete().eq("module_id", moduleId);

  if (formData.get("blueprintEnabled") !== "on") {
    return;
  }

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

  const steps: Array<{
    blueprint_id: string;
    title: string;
    description: string;
    owner_role_id: string | null;
    escalation: string;
    sort_order: number;
  }> = [];

  for (let index = 0; index < count; index += 1) {
    const stepTitle = readString(formData, `blueprintStep_${index}_title`);
    const description = readString(formData, `blueprintStep_${index}_description`);
    const roleSlug = readString(formData, `blueprintStep_${index}_role`);

    if (!stepTitle || !description) continue;

    steps.push({
      blueprint_id: blueprintId,
      title: stepTitle,
      description,
      owner_role_id: roleIdBySlug.get(roleSlug) ?? null,
      escalation: readString(formData, `blueprintStep_${index}_escalation`),
      sort_order: index + 1,
    });
  }

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
