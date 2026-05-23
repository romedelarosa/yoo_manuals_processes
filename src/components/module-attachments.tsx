import { Download, FileText, Image as ImageIcon, LockKeyhole } from "lucide-react";
import Image from "next/image";
import type { ModuleAttachment } from "@/lib/types";
import { Badge, Card } from "./ui";

export function ModuleAttachments({
  attachments,
}: {
  attachments?: ModuleAttachment[];
}) {
  const visibleAttachments =
    attachments?.filter((attachment) => attachment.visibleToEmployees) ?? [];

  if (visibleAttachments.length === 0) {
    return null;
  }

  const imageAttachments = visibleAttachments.filter(
    (attachment) => attachment.fileType === "image",
  );
  const documentAttachments = visibleAttachments.filter(
    (attachment) => attachment.fileType !== "image",
  );

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Module attachments
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Visual guides and documents
        </h2>
        <p className="text-sm leading-6 text-muted">
          Attachments are scoped to this module. Visual guides are shown inline;
          controlled documents are downloadable only when enabled by an admin.
        </p>
      </div>

      {imageAttachments.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {imageAttachments.map((attachment) => (
            <figure
              key={attachment.id}
              className="overflow-hidden rounded-lg border border-border bg-surface-muted"
            >
              <Image
                src={attachment.storagePath}
                alt={attachment.title}
                width={960}
                height={540}
                className="aspect-video w-full object-cover"
              />
              <figcaption className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">Visual guide</Badge>
                  {!attachment.downloadable ? <Badge>View only</Badge> : null}
                  <Badge>{attachment.sizeLabel}</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {attachment.title}
                </p>
                {attachment.description ? (
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {attachment.description}
                  </p>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {documentAttachments.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {documentAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-[#fbfcf8] p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary">
                  {attachment.downloadable ? <FileText /> : <LockKeyhole />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {attachment.title}
                    </p>
                    <Badge>{attachment.fileName}</Badge>
                    <Badge>{attachment.sizeLabel}</Badge>
                  </div>
                  {attachment.description ? (
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {attachment.description}
                    </p>
                  ) : null}
                </div>
              </div>

              {attachment.downloadable ? (
                <a
                  href={attachment.storagePath}
                  download={attachment.fileName}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#0b4d3c]"
                >
                  <Download />
                  Download
                </a>
              ) : (
                <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface-muted px-4 text-sm font-semibold text-muted">
                  <LockKeyhole />
                  View only
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export function AttachmentTypeIcon({ type }: { type: ModuleAttachment["fileType"] }) {
  return type === "image" ? <ImageIcon /> : <FileText />;
}
