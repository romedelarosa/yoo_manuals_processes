"use client";

import { useState } from "react";
import { FileQuestion, Network, Plus, Save, Trash2 } from "lucide-react";
import { businesses, employeeRoles } from "@/lib/mock-data";
import type { ManualModule, QuizQuestion } from "@/lib/types";
import { Badge, Card, FieldLabel, SelectInput, TextArea, TextInput } from "./ui";

export function ModuleEditor({
  action,
  module,
  submitLabel,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  module?: ManualModule;
  submitLabel?: string;
}) {
  const [published, setPublished] = useState(false);
  const [blueprintEnabled, setBlueprintEnabled] = useState(Boolean(module?.blueprint));
  const [quizRequired, setQuizRequired] = useState(Boolean(module?.quiz));
  const [checkpointOpen, setCheckpointOpen] = useState(
    module?.quiz?.accessEnabled ?? false,
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    module?.quiz?.questions ?? [],
  );
  const [blueprintSteps, setBlueprintSteps] = useState(
    module?.blueprint?.steps ?? [
      {
        id: "step-1",
        title: "",
        description: "",
        ownerRoleId: "front-desk" as const,
        escalation: "",
      },
    ],
  );

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel>Title</FieldLabel>
          <TextInput
            name="title"
            defaultValue={module?.title ?? ""}
            placeholder="Module title"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <FieldLabel>Category</FieldLabel>
            <SelectInput name="category" defaultValue={module?.category ?? "Company-wide"}>
              <option>Company-wide</option>
              <option>Conduct</option>
              <option>Privacy</option>
              <option>Operations</option>
              <option>Safety</option>
              <option>Role SOP</option>
              <option>Blueprint</option>
              <option>Acknowledgment</option>
            </SelectInput>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Version</FieldLabel>
            <TextInput name="version" defaultValue={module?.version ?? "1.0.0"} />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Estimated minutes</FieldLabel>
            <TextInput
              name="estimatedMinutes"
              defaultValue={module?.estimatedMinutes ?? 10}
              min={1}
              type="number"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Description</FieldLabel>
          <TextArea
            name="description"
            defaultValue={module?.description ?? ""}
            placeholder="Short summary employees will see before opening the module"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Lesson content</FieldLabel>
          <TextArea
            name="lessonContent"
            defaultValue={module?.sections[0]?.body ?? ""}
            placeholder="First lesson section content"
            required
          />
        </div>

        <Card className="border-[#d7ddd2] bg-[#fbfcf8] p-5 shadow-none">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Business assignment
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Employees only see modules assigned to their business.
              </p>
              <div className="mt-3 grid gap-2">
                {businesses.map((business) => (
                  <label
                    key={business.id}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-white px-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="businessIds"
                      value={business.id}
                      defaultChecked={
                        module ? module.businessIds.includes(business.id) : true
                      }
                    />
                    {business.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">
                Role assignment
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Select every operational role that should receive this module.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {employeeRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-white px-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="employeeRoleIds"
                      value={role.id}
                      defaultChecked={
                        module
                          ? module.employeeRoleIds.includes(role.id)
                          : role.id === "general-staff" || role.id === "manager"
                      }
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
            <input
              type="checkbox"
              name="required"
              defaultChecked={module?.required ?? true}
            />
            Required module
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
            <input
              type="checkbox"
              name="quizRequired"
              checked={quizRequired}
              onChange={(event) => setQuizRequired(event.target.checked)}
            />
            Requires quiz
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
            <input
              type="checkbox"
              name="acknowledgmentRequired"
              defaultChecked={module?.acknowledgmentRequired ?? true}
            />
            Requires acknowledgment
          </label>
        </div>

        {quizRequired ? (
          <Card className="border-[#efd09a] bg-[#fff8e7] p-5 shadow-none">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Checkpoint access
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Keep the checkpoint closed while employees review the module,
                  then open it when ready.
                </p>
              </div>
              <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-white px-4 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="checkpointOpen"
                  checked={checkpointOpen}
                  onChange={(event) => setCheckpointOpen(event.target.checked)}
                />
                {checkpointOpen ? "Open to employees" : "Closed to employees"}
              </label>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="flex flex-col gap-2">
                <FieldLabel>Passing score</FieldLabel>
                <TextInput
                  name="passingScore"
                  defaultValue={module?.quiz?.passingScore ?? 80}
                  type="number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Time limit</FieldLabel>
                <TextInput
                  name="timeLimitMinutes"
                  defaultValue={module?.quiz?.timeLimitMinutes ?? 10}
                  type="number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Max attempts</FieldLabel>
                <TextInput
                  name="maxAttempts"
                  defaultValue={module?.quiz?.maxAttempts ?? 2}
                  type="number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Mode</FieldLabel>
                <SelectInput
                  name="assessmentMode"
                  defaultValue={module?.quiz?.assessmentMode ?? "closed_reference"}
                >
                  <option value="closed_reference">Closed-reference</option>
                  <option value="open_reference">Open-reference</option>
                </SelectInput>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-[#efd09a] bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#fff8e7] text-warning">
                    <FileQuestion />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Manual question bank
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Add approved questions manually for now. This structure can
                      support AI-drafted questions later.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((current) => [
                      ...current,
                      {
                        id: `question-${current.length + 1}`,
                        question: "",
                        options: ["", "", ""],
                        answer: "",
                        explanation: "",
                        difficulty: "easy",
                        topicTag: "",
                        active: true,
                        source: "manual",
                      },
                    ])
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-primary"
                >
                  <Plus />
                  Add question
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <input type="hidden" name="questionCount" value={questions.length} />
                {questions.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-[#fbfcf8] p-4 text-sm text-muted">
                    No questions yet. You can create the module now and add
                    questions later.
                  </div>
                ) : null}

                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-border bg-[#fbfcf8] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        Question {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((current) =>
                            current.filter((item) => item.id !== question.id),
                          )
                        }
                        className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted transition hover:border-accent hover:text-accent"
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <Trash2 />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <FieldLabel>Question</FieldLabel>
                      <TextArea
                        name={`question_${index}`}
                        defaultValue={question.question}
                        placeholder="What should an employee do when..."
                      />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={`${question.id}-${optionIndex}`}
                          className="flex flex-col gap-2"
                        >
                          <FieldLabel>Option {optionIndex + 1}</FieldLabel>
                          <TextInput
                            name={`question_${index}_option_${optionIndex}`}
                            defaultValue={option}
                            placeholder={`Answer choice ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="flex flex-col gap-2">
                        <FieldLabel>Correct answer</FieldLabel>
                        <TextInput
                          name={`question_${index}_answer`}
                          defaultValue={question.answer}
                          placeholder="Must match one answer choice"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel>Difficulty</FieldLabel>
                        <SelectInput
                          name={`question_${index}_difficulty`}
                          defaultValue={question.difficulty ?? "easy"}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </SelectInput>
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel>Topic tag</FieldLabel>
                        <TextInput
                          name={`question_${index}_topicTag`}
                          defaultValue={question.topicTag ?? ""}
                          placeholder="Privacy, escalation, conduct"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
                      <div className="flex flex-col gap-2">
                        <FieldLabel>Explanation</FieldLabel>
                        <TextArea
                          name={`question_${index}_explanation`}
                          defaultValue={question.explanation ?? ""}
                          placeholder="Shown in review reports or future learning feedback."
                        />
                      </div>
                      <label className="flex min-h-12 items-center gap-3 self-end rounded-md border border-border bg-white px-3 text-sm">
                        <input
                          type="checkbox"
                          name={`question_${index}_active`}
                          defaultChecked={question.active ?? true}
                        />
                        Active in random pool
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="border-[#c7decf] bg-[#f8fbf6] p-5 shadow-none">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Network />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Process blueprint builder
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Build a service flowchart employees can view inside the
                    module.
                  </p>
                </div>
              </div>
              <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="blueprintEnabled"
                  checked={blueprintEnabled}
                  onChange={(event) => setBlueprintEnabled(event.target.checked)}
                />
                Enable blueprint
              </label>
            </div>

            {blueprintEnabled ? (
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Blueprint title</FieldLabel>
                    <TextInput
                      name="blueprintTitle"
                      defaultValue={module?.blueprint?.title ?? ""}
                      placeholder="Inquiry to completed visit"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Blueprint description</FieldLabel>
                    <TextInput
                      name="blueprintDescription"
                      defaultValue={module?.blueprint?.description ?? ""}
                      placeholder="Short description of the process"
                    />
                  </div>
                </div>

                <input
                  type="hidden"
                  name="blueprintStepCount"
                  value={blueprintSteps.length}
                />
                <div className="flex flex-col gap-3">
                  {blueprintSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="rounded-lg border border-border bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          Step {index + 1}
                        </p>
                        {blueprintSteps.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setBlueprintSteps((current) =>
                                current.filter((item) => item.id !== step.id),
                              )
                            }
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted transition hover:border-accent hover:text-accent"
                            aria-label={`Remove step ${index + 1}`}
                          >
                            <Trash2 />
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Step title</FieldLabel>
                          <TextInput
                            name={`blueprintStep_${index}_title`}
                            defaultValue={step.title}
                            placeholder="Book appointment"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Responsible role</FieldLabel>
                          <SelectInput
                            name={`blueprintStep_${index}_role`}
                            defaultValue={step.ownerRoleId}
                          >
                            {employeeRoles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </SelectInput>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Step description</FieldLabel>
                          <TextArea
                            name={`blueprintStep_${index}_description`}
                            defaultValue={step.description}
                            placeholder="What should happen in this step?"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Escalation note</FieldLabel>
                          <TextArea
                            name={`blueprintStep_${index}_escalation`}
                            defaultValue={step.escalation ?? ""}
                            placeholder="When should this step be escalated?"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setBlueprintSteps((current) => [
                      ...current,
                      {
                        id: `step-${current.length + 1}`,
                        title: "",
                        description: "",
                        ownerRoleId: "front-desk",
                        escalation: "",
                      },
                    ])
                  }
                  className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-primary"
                >
                  <Plus />
                  Add blueprint step
                </button>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="rounded-md border border-dashed border-border bg-surface-muted p-4 text-sm leading-6 text-muted">
          Photo and document upload storage will be wired through Supabase
          Storage next. For now, create the module first, then attach files once
          the storage flow is enabled.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type={action ? "submit" : "button"}
            onClick={() => {
              if (!action) setPublished(true);
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#0b4d3c]"
          >
            <Save />
            {action ? (submitLabel ?? "Create module") : "Save draft"}
          </button>
          {published ? <Badge tone="success">Draft saved locally</Badge> : null}
        </div>
      </form>
    </Card>
  );
}
