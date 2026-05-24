"use client";

import { useState } from "react";
import { CheckCircle2, PenLine } from "lucide-react";
import type { ManualModule } from "@/lib/types";
import { ButtonLink, Card, FieldLabel, TextInput } from "./ui";

export function AcknowledgmentForm({ module }: { module: ManualModule }) {
  const [signed, setSigned] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary">
          {signed ? <CheckCircle2 /> : <PenLine />}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Policy acknowledgment
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Confirm that you have read and understood {module.title}, version{" "}
            {module.version}. In production, this record is stored with a
            timestamp, module version, user ID, and optional IP address.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <p className="text-sm leading-6 text-foreground">
            I acknowledge that I have read, understood, and agree to follow this
            policy or process as assigned to my role and business.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel>Employee name</FieldLabel>
            <TextInput defaultValue="Signed-in employee" />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Date</FieldLabel>
            <TextInput defaultValue={today} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSigned(true)}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Sign acknowledgment
          </button>
          <ButtonLink href="/progress" variant="secondary">
            View progress
          </ButtonLink>
        </div>

        {signed ? (
          <div className="rounded-md border border-[#b6dec5] bg-[#e7f6eb] px-4 py-3 text-sm text-success">
            Acknowledgment captured for this session. Supabase persistence will
            store the signed-in user, module version, and timestamp.
          </div>
        ) : null}
      </div>
    </Card>
  );
}
