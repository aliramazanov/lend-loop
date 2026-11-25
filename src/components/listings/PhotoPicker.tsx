import { PhotoCarousel } from "@/components/tools/PhotoCarousel";
import { Hint, labelClasses } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { PHOTO_POLICY } from "@convex/shared/policy";
import { ImagePlus, X } from "lucide-react";
import type { PhotoPickerProps } from "@/types";

const addTileClasses = cn(
  "flex h-16 w-20 cursor-pointer flex-col items-center justify-center gap-0.5",
  "rounded-lg border border-dashed border-input text-xs text-stone-600",
  "focus-within:ring-2 focus-within:ring-ring hover:bg-muted",
);

const removeButtonClasses = cn(
  "absolute -top-2 -right-2 cursor-pointer rounded-full bg-card p-1",
  "text-stone-700 shadow ring-1 ring-border hover:bg-muted",
);

export function PhotoPicker({
  toolName,
  category,
  photos,
  onAdd,
  onRemove,
}: PhotoPickerProps) {
  const hasRoom = photos.length < PHOTO_POLICY.maxPerListing;

  return (
    <fieldset>
      <legend className={labelClasses}>
        Photos (up to {PHOTO_POLICY.maxPerListing})
      </legend>

      {photos.length > 0 && (
        <PhotoCarousel
          name={toolName}
          category={category}
          photoUrls={photos.map((photo) => photo.url)}
          showThumbnails={false}
          className="mb-3 max-w-sm"
        />
      )}

      <ul className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <li key={photo.key} className="relative">
            <img
              src={photo.url}
              alt={`${toolName}, ${index + 1}${index === 0 ? " (cover)" : ""}`}
              className="h-16 w-20 rounded-lg object-cover"
            />

            <button
              type="button"
              onClick={() => onRemove(photo.key)}
              aria-label={`Remove photo ${index + 1}`}
              className={removeButtonClasses}
            >
              <X aria-hidden className="size-3" />
            </button>
          </li>
        ))}

        {hasRoom && (
          <li>
            <label className={addTileClasses}>
              <ImagePlus aria-hidden className="size-5" />
              Add
              <input
                type="file"
                multiple
                accept={PHOTO_POLICY.acceptedTypes.join(",")}
                aria-describedby="tool-photo-hint"
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files?.length) onAdd(event.target.files);

                  event.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>

      <Hint id="tool-photo-hint">
        JPEG, PNG or WebP, up to {PHOTO_POLICY.maxMegabytes} MB each. The first
        photo is the cover.
      </Hint>
    </fieldset>
  );
}
