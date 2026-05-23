"use client";

import { useState } from "react";
import {
  FileQuestion,
  FileText,
  Image as ImageIcon,
  Network,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { employeeRoles } from "@/lib/mock-data";
import type { ManualModule, ModuleAttachment, QuizQuestion } from "@/lib/types";
import { Badge, Card, FieldLabel, SelectInput, TextArea, TextInput } from "./ui";

export function ModuleEditor({ module }: { module?: ManualModule }) {
  const [published, setPublished] = useState(false);
  const [blueprintEnabled, setBlueprintEnabled] = useState(Boolean(module?.blueprint));
  const [quizRequired, setQuizRequired] = useState(Boolean(module?.quiz));
  const [checkpointOpen, setCheckpointOpen] = useState(
    module?.quiz?.accessEnabled ?? false,
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    module?.quiz?.questions ?? [],
  );
  const [attachments, setAttachments] = useState<ModuleAttachment[]>(
    module?.attachments ?? [],
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
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel>Title</FieldLabel>
          <TextInput defaultValue={module?.title ?? ""} placeholder="Module title" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <FieldLabel>Category</FieldLabel>
            <SelectInput defaultValue={module?.category ?? "Company-wide"}>
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
            <TextInput defaultValue={module?.version ?? "1.0.0"} />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Estimated minutes</FieldLabel>
            <TextInput
              defaultValue={module?.estimatedMinutes ?? 10}
              min={1}
              type="number"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Description</FieldLabel>
          <TextArea
            defaultValue={module?.description ?? ""}
            placeholder="Short summary employees will see before opening the module"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Lesson content</FieldLabel>
          <TextArea
            defaultValue={module?.sections[0]?.body ?? ""}
            placeholder="First lesson section content"
          />
        </div>

        <Card className="border-[#d7ddd2] bg-[#fbfcf8] p-5 shadow-none">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary">
                  <Upload />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Attachment manager
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Add visual guides for module comprehension or controlled
                    document downloads for forms, contracts, invoices, and
                    templates.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAttachments((current) => [
                    ...current,
                    {
                      id: `attachment-${current.length + 1}`,
                      title: "",
                      description: "",
                      fileName: "",
                      fileType: "image",
                      mimeType: "image/jpeg",
                      storagePath: "",
                      sizeLabel: "0 MB",
                      downloadable: false,
                      visibleToEmployees: true,
                    },
                  ])
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                <Plus />
                Add attachment
              </button>
            </div>

            <div className="grid gap-3">
              {attachments.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-white p-4 text-sm text-muted">
                  No attachments yet. Keep uploads limited to compressed images
                  and necessary downloadable documents.
                </div>
              ) : null}

              {attachments.map((attachment, index) => (
                <div
                  key={attachment.id}
                  className="rounded-lg border border-border bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-md bg-surface-muted text-primary">
                        {attachment.fileType === "image" ? <ImageIcon /> : <FileText />}
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Attachment {index + 1}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((item) => item.id !== attachment.id),
                        )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted transition hover:border-accent hover:text-accent"
                      aria-label={`Remove attachment ${index + 1}`}
                    >
                      <Trash2 />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <FieldLabel>Attachment title</FieldLabel>
                      <TextInput
                        defaultValue={attachment.title}
                        placeholder="Treatment room setup visual guide"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <FieldLabel>File type</FieldLabel>
                      <SelectInput defaultValue={attachment.fileType}>
                        <option value="image">Image / photo guide</option>
                        <option value="pdf">PDF document</option>
                        <option value="document">Document template</option>
                        <option value="spreadsheet">Spreadsheet</option>
                      </SelectInput>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <FieldLabel>File</FieldLabel>
                      <input
                        type="file"
                        className="min-h-11 rounded-md border border-border bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-foreground"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <FieldLabel>Description</FieldLabel>
                      <TextInput
                        defaultValue={attachment.description ?? ""}
                        placeholder="How employees should use this attachment"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
                      <input
                        type="checkbox"
                        defaultChecked={attachment.visibleToEmployees}
                      />
                      Visible to assigned employees
                    </label>
                    <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
                      <input
                        type="checkbox"
                        defaultChecked={attachment.downloadable}
                      />
                      Allow download
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
            <input type="checkbox" defaultChecked={module?.required ?? true} />
            Required module
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
            <input
              type="checkbox"
              checked={quizRequired}
              onChange={(event) => setQuizRequired(event.target.checked)}
            />
            Requires quiz
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm">
            <input
              type="checkbox"
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
                  Business managers can keep a checkpoint closed while employees
                  review the module, then open it when they are ready to assess
                  comprehension.
                </p>
              </div>
              <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-white px-4 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={checkpointOpen}
                  onChange={(event) => setCheckpointOpen(event.target.checked)}
                />
                {checkpointOpen ? "Open to employees" : "Closed to employees"}
              </label>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="flex flex-col gap-2">
                <FieldLabel>Passing score</FieldLabel>
                <TextInput defaultValue={module?.quiz?.passingScore ?? 80} type="number" />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Time limit</FieldLabel>
                <TextInput
                  defaultValue={module?.quiz?.timeLimitMinutes ?? 10}
                  type="number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Max attempts</FieldLabel>
                <TextInput defaultValue={module?.quiz?.maxAttempts ?? 2} type="number" />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>Mode</FieldLabel>
                <SelectInput defaultValue={module?.quiz?.assessmentMode ?? "closed_reference"}>
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
                      Build approved questions manually for now. Later, AI can
                      create draft questions with the same fields, but employees
                      should only receive active, admin-approved questions.
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
                        relatedSectionId: module?.sections[0]?.id,
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
                {questions.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-[#fbfcf8] p-4 text-sm text-muted">
                    No questions yet. Add manual questions to create a
                    randomized approved pool for this checkpoint.
                  </div>
                ) : null}

                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-border bg-[#fbfcf8] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Question {index + 1}
                        </p>
                        <span className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-muted">
                          {question.source === "manual"
                            ? "Manual"
                            : question.source === "ai_approved"
                              ? "AI approved"
                              : "AI draft"}
                        </span>
                      </div>
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
                        defaultValue={question.question}
                        placeholder="What should an employee do when..."
                      />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {question.options.map((option, optionIndex) => (
                        <div key={`${question.id}-${optionIndex}`} className="flex flex-col gap-2">
                          <FieldLabel>Option {optionIndex + 1}</FieldLabel>
                          <TextInput
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
                          defaultValue={question.answer}
                          placeholder="Must match one answer choice"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel>Difficulty</FieldLabel>
                        <SelectInput defaultValue={question.difficulty ?? "easy"}>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </SelectInput>
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel>Topic tag</FieldLabel>
                        <TextInput
                          defaultValue={question.topicTag ?? ""}
                          placeholder="Privacy, escalation, conduct"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
                      <div className="flex flex-col gap-2">
                        <FieldLabel>Explanation</FieldLabel>
                        <TextArea
                          defaultValue={question.explanation ?? ""}
                          placeholder="Shown in review reports or future learning feedback."
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Related section</FieldLabel>
                          <SelectInput defaultValue={question.relatedSectionId ?? ""}>
                            <option value="">No section selected</option>
                            {module?.sections.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.title}
                              </option>
                            ))}
                          </SelectInput>
                        </div>
                        <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-white px-3 text-sm">
                          <input type="checkbox" defaultChecked={question.active ?? true} />
                          Active in random pool
                        </label>
                      </div>
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
                    module. Use it for appointment handling, treatment flow,
                    cash handling, incident escalation, or role handoffs.
                  </p>
                </div>
              </div>
              <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium">
                <input
                  type="checkbox"
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
                      defaultValue={module?.blueprint?.title ?? ""}
                      placeholder="Inquiry to completed visit"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Blueprint description</FieldLabel>
                    <TextInput
                      defaultValue={module?.blueprint?.description ?? ""}
                      placeholder="Short description of the process"
                    />
                  </div>
                </div>

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
                            defaultValue={step.title}
                            placeholder="Book appointment"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Responsible role</FieldLabel>
                          <SelectInput defaultValue={step.ownerRoleId}>
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
                            defaultValue={step.description}
                            placeholder="What should happen in this step?"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Escalation note</FieldLabel>
                          <TextArea
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPublished(true)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#0b4d3c]"
          >
            <Save />
            Save draft
          </button>
          {published ? <Badge tone="success">Draft saved in demo state</Badge> : null}
        </div>
      </div>
    </Card>
  );
}
