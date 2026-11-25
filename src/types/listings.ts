import type { OwnListing, RemovedListing } from "@/types/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Category, Condition } from "@convex/types/catalog";

export interface EditListingProps {
  toolId: string;
}

export interface ListingRowProps {
  listing: OwnListing;
}

export interface PhotoPickerProps {
  toolName: string;
  category: Category;
  photos: PhotoDraft[];
  onAdd: (files: FileList) => void;
  onRemove: (key: string) => void;
}

export interface RemoveListingButtonProps {
  toolId: Id<"tools">;
  toolName: string;
  asAdmin?: boolean;
  onRemoved?: () => void;
}

export interface RemovedListingsProps {
  title: string;
  listings: RemovedListing[];
}

export interface SelectFieldProps<Option extends string> {
  id: string;
  name: string;
  label: string;
  options: readonly Option[];
  defaultValue: Option;
  labelOf?: (option: Option) => string;
  onChange?: (option: Option) => void;
  className?: string;
}

export interface ToolFormProps {
  listing?: OwnListing;
}

export interface ToolFormValues {
  name: string;
  category: Category;
  condition: Condition;
  shortDescription: string;
}

export interface ToolFormFieldsProps {
  initial: ToolFormValues;
  onNameChange: (name: string) => void;
  onCategoryChange: (category: Category) => void;
}

export type StorageId = Id<"_storage">;

export type PhotoDraft =
  | { kind: "saved"; key: string; url: string; storageId: StorageId }
  | { kind: "new"; key: string; url: string; file: File };

export interface UploadResponse {
  storageId: StorageId;
}
