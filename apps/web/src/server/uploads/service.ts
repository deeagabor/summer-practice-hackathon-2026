import type { UploadRequestInput } from "@showup2move/shared";

export function createUploadIntent(input: UploadRequestInput) {
  const objectKey = `uploads/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

  return {
    objectKey,
    uploadUrl: `/api/uploads/local/${encodeURIComponent(objectKey)}`,
    publicUrl: `/uploads/${encodeURIComponent(objectKey)}`,
    maxBytes: 6_000_000,
    contentType: input.contentType
  };
}
