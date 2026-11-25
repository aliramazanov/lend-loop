"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePhotoDrafts, type PhotoDraft } from "@/hooks/usePhotoDrafts";
import { parseChoice } from "@/lib/choices";
import type { OwnListing } from "@/lib/convexTypes";
import { ROUTES } from "@/lib/routes";
import { withToast } from "@/lib/toast";
import { api } from "@convex/_generated/api";
import { CATEGORIES, CONDITIONS } from "@convex/shared/catalog";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { PhotoPicker } from "./PhotoPicker";
import { ToolFormFields, type ToolFormValues } from "./ToolFormFields";

const NEW_TOOL: ToolFormValues = {
  name: "",
  category: "power tools",
  condition: "good",
  shortDescription: "",
};

function readText(data: FormData, field: string): string {
  const value = data.get(field);

  return typeof value === "string" ? value : "";
}

function readValues(form: HTMLFormElement): ToolFormValues {
  const data = new FormData(form);

  return {
    name: readText(data, "name"),
    category:
      parseChoice(CATEGORIES, data.get("category")) ?? NEW_TOOL.category,
    condition:
      parseChoice(CONDITIONS, data.get("condition")) ?? NEW_TOOL.condition,
    shortDescription: readText(data, "shortDescription"),
  };
}

function toPhotoDrafts(listing?: OwnListing): PhotoDraft[] {
  return (listing?.photos ?? []).map((photo) => ({
    kind: "saved",
    key: photo.id,
    url: photo.url,
    storageId: photo.id,
  }));
}

export function ToolForm({ listing }: { listing?: OwnListing }) {
  const router = useRouter();
  const createTool = useMutation(api.tools.create);
  const updateTool = useMutation(api.tools.update);
  const initial = listing ?? NEW_TOOL;

  const { photos, addPhotos, removePhoto, uploadAll } = usePhotoDrafts(
    toPhotoDrafts(listing),
  );

  const [toolName, setToolName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [isSaving, setIsSaving] = useState(false);

  async function save(values: ToolFormValues) {
    const photoIds = await uploadAll();

    if (listing) {
      await updateTool({ toolId: listing._id, ...values, photoIds });
    } else {
      await createTool({ ...values, photoIds });
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const saved = await withToast(
      save(readValues(event.currentTarget)),
      listing ? "Tool listing updated." : "Tool listed for your neighbors.",
    );

    setIsSaving(false);

    if (saved) router.push(ROUTES.listings);
  }

  return (
    <Card className="p-5">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        aria-labelledby="tool-form-title"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h1 id="tool-form-title" className="text-base font-semibold">
            {listing ? "Edit tool" : "List a new tool"}
          </h1>

          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={ROUTES.listings} aria-label="Close form">
              <X aria-hidden />
            </Link>
          </Button>
        </div>

        <ToolFormFields
          initial={initial}
          onNameChange={setToolName}
          onCategoryChange={setCategory}
        />

        <PhotoPicker
          toolName={toolName || "New tool"}
          category={category}
          photos={photos}
          onAdd={(files) => void addPhotos(files)}
          onRemove={removePhoto}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={ROUTES.listings}>Cancel</Link>
          </Button>

          <Button type="submit" disabled={isSaving}>
            {isSaving && "Saving..."}
            {!isSaving && (listing ? "Save changes" : "Publish listing")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
