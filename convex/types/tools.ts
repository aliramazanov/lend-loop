import type { Doc, Id } from "../_generated/dataModel";
import type { Category, Condition } from "./catalog";

export interface ToolText {
  name: string;
  shortDescription: string;
}

export type PhotoId = Id<"_storage">;

export interface StoredPhoto {
  id: PhotoId;
  url: string;
}

export interface HasUrlArgs {
  id: PhotoId;
  url: string | null;
}

export interface DeleteDroppedPhotosArgs {
  previous: PhotoId[];
  kept: PhotoId[];
}

export type Viewer = Doc<"users">;

export type Tool = Doc<"tools">;

export interface ToolFields {
  name: string;
  category: Category;
  condition: Condition;
  shortDescription: string;
  photoIds?: Id<"_storage">[];
}
