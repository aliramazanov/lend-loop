import { compressImage } from "@/lib/compressImage";
import { api } from "@convex/_generated/api";
import { PHOTO_POLICY } from "@convex/shared/policy";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PhotoDraft, StorageId, UploadResponse } from "@/types";

function isUploadResponse(body: unknown): body is UploadResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "storageId" in body &&
    typeof body.storageId === "string"
  );
}

function revokeDraftUrls(photos: PhotoDraft[]) {
  for (const photo of photos) {
    if (photo.kind === "new") URL.revokeObjectURL(photo.url);
  }
}

function isAcceptedSource(file: File): boolean {
  return (
    PHOTO_POLICY.acceptedTypes.includes(file.type) &&
    file.size <= PHOTO_POLICY.maxSourceBytes
  );
}

async function toDraft(original: File): Promise<PhotoDraft | null> {
  if (!isAcceptedSource(original)) {
    toast.error(`${original.name}: use a JPEG, PNG or WebP photo.`);

    return null;
  }

  const file = await compressImage(original);

  if (file.size > PHOTO_POLICY.maxBytes) {
    toast.error(
      `${original.name} is still over ${PHOTO_POLICY.maxMegabytes} MB after resizing.`,
    );

    return null;
  }

  return {
    kind: "new",
    key: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    file,
  };
}

function isDraft(draft: PhotoDraft | null): draft is PhotoDraft {
  return draft !== null;
}

export function usePhotoDrafts(initialPhotos: PhotoDraft[]) {
  const [photos, setPhotos] = useState(initialPhotos);
  const latestPhotos = useRef(photos);
  const generateUploadUrl = useMutation(api.tools.generatePhotoUploadUrl);

  useEffect(() => {
    latestPhotos.current = photos;
  }, [photos]);

  useEffect(() => () => revokeDraftUrls(latestPhotos.current), []);

  async function addPhotos(files: FileList) {
    const room = PHOTO_POLICY.maxPerListing - photos.length;
    const selected = Array.from(files);

    if (selected.length > room) {
      toast.error(
        `A listing can have at most ${PHOTO_POLICY.maxPerListing} photos.`,
      );
    }

    const drafts = await Promise.all(selected.slice(0, room).map(toDraft));

    setPhotos((current) => [...current, ...drafts.filter(isDraft)]);
  }

  function removePhoto(key: string) {
    const removed = photos.find((photo) => photo.key === key);

    if (removed) revokeDraftUrls([removed]);

    setPhotos((current) => current.filter((photo) => photo.key !== key));
  }

  async function upload(file: File): Promise<StorageId> {
    const uploadUrl = await generateUploadUrl();

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    const body: unknown = await response.json();

    if (!response.ok || !isUploadResponse(body)) {
      throw new Error(`Photo upload failed with HTTP ${response.status}`);
    }

    return body.storageId;
  }

  async function uploadAll(): Promise<StorageId[]> {
    return await Promise.all(
      photos.map((photo) =>
        photo.kind === "saved"
          ? Promise.resolve(photo.storageId)
          : upload(photo.file),
      ),
    );
  }

  return { photos, addPhotos, removePhoto, uploadAll };
}
