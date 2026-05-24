"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, XCircle } from "lucide-react";
import type { ManualModule } from "@/lib/types";
import { Badge, ButtonLink, Card } from "./ui";

export function QuizForm({ module }: { module: ManualModule }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const quiz = module.quiz;
  const score = useMemo(() => {
    if (!quiz) return 0;

    const activeQuestions = quiz.questions.filter(
      (question) => question.active ?? true,
    );
    const correct = activeQuestions.filter(
      (question) => answers[question.id] === question.answer,
    ).length;

    return Math.round((correct / activeQuestions.length) * 100);
  }, [answers, quiz]);

  if (!quiz) {
    return (
      <Card className="p-6">
        <h1 className="text-xl font-semibold">No checkpoint required</h1>
        <p className="mt-2 text-sm text-muted">
          This module can be completed by reading the lesson and signing any
          required acknowledgment.
        </p>
      </Card>
    );
  }

  const passed = score >= quiz.passingScore;

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {module.title} checkpoint
            </h1>
            <p className="mt-1 text-sm text-muted">
              Passing score: {quiz.passingScore} percent
            </p>
          </div>
          {submitted ? (
            <Badge tone={passed ? "success" : "warning"}>Score: {score}%</Badge>
          ) : null}
        </div>
      </Card>

      <Card className="border-[#efd09a] bg-[#fff8e7] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-warning">
            <LockKeyhole />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Assessment mode
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              This checkpoint is designed as a closed-reference comprehension
              check. In production, the quiz should unlock only after required
              sections are marked read, run in a focused screen, randomize
              questions, limit attempts, and record the result.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="warning">
                {quiz.assessmentMode === "open_reference"
                  ? "Open-reference"
                  : "Closed-reference"}
              </Badge>
              <Badge>{quiz.timeLimitMinutes ?? 10} min limit</Badge>
              <Badge>{quiz.maxAttempts ?? 2} attempts</Badge>
              {quiz.randomizeQuestions ? <Badge>Randomized</Badge> : null}
            </div>
          </div>
        </div>
      </Card>

      {quiz.questions
        .filter((question) => question.active ?? true)
        .map((question, index) => (
        <Card key={question.id} className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Question {index + 1}
          </p>
          <h2 className="mt-2 text-base font-semibold text-foreground">
            {question.question}
          </h2>
          <div className="mt-4 grid gap-2">
            {question.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white px-3 py-3 text-sm transition hover:border-primary"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() =>
                    setAnswers((current) => ({ ...current, [question.id]: option }))
                  }
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </Card>
        ))}

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Submit checkpoint
          </button>

          {submitted ? (
            <div className="flex items-center gap-3 text-sm">
              {passed ? (
                <>
                  <CheckCircle2 className="text-success" />
                  <span>Passed. Continue to acknowledgment.</span>
                  <ButtonLink href={`/modules/${module.id}/acknowledgment`}>
                    Sign
                  </ButtonLink>
                </>
              ) : (
                <>
                  <XCircle className="text-warning" />
                  <span>Review the module and try again.</span>
                </>
              )}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
