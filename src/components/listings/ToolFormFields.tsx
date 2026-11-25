import { Hint, Input, Label, Textarea } from "@/components/ui/Field";
import { categoryLabel } from "@/lib/categories";
import {
  CATEGORIES,
  CONDITION_LABELS,
  CONDITIONS,
  type Category,
  type Condition,
} from "@convex/shared/catalog";
import { LISTING_POLICY } from "@convex/shared/policy";
import { useEffect, useRef, useState } from "react";
import { SelectField } from "./SelectField";

const { nameLength, descriptionLength } = LISTING_POLICY;

export interface ToolFormValues {
  name: string;
  category: Category;
  condition: Condition;
  shortDescription: string;
}

interface ToolFormFieldsProps {
  initial: ToolFormValues;
  onNameChange: (name: string) => void;
  onCategoryChange: (category: Category) => void;
}

export function ToolFormFields({
  initial,
  onNameChange,
  onCategoryChange,
}: ToolFormFieldsProps) {
  const nameInput = useRef<HTMLInputElement>(null);

  const [descriptionCount, setDescriptionCount] = useState(
    initial.shortDescription.length,
  );

  useEffect(() => {
    nameInput.current?.focus();
  }, []);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="tool-name">Tool name</Label>
          <Input
            ref={nameInput}
            id="tool-name"
            name="name"
            required
            minLength={nameLength.min}
            maxLength={nameLength.max}
            defaultValue={initial.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g. DeWalt Cordless Drill"
          />
        </div>

        <SelectField
          id="tool-category"
          name="category"
          label="Category"
          options={CATEGORIES}
          defaultValue={initial.category}
          onChange={onCategoryChange}
          labelOf={categoryLabel}
        />

        <SelectField
          id="tool-condition"
          name="condition"
          label="Condition"
          options={CONDITIONS}
          defaultValue={initial.condition}
          labelOf={(condition) => CONDITION_LABELS[condition]}
        />
      </div>

      <div>
        <Label htmlFor="tool-description">Short description</Label>
        <Textarea
          id="tool-description"
          name="shortDescription"
          required
          minLength={descriptionLength.min}
          maxLength={descriptionLength.max}
          rows={2}
          defaultValue={initial.shortDescription}
          onChange={(event) => setDescriptionCount(event.target.value.length)}
          placeholder="Includes 2 batteries and charger. Great for weekend shelves or repairs."
        />
        <Hint className="text-right">
          {descriptionCount}/{descriptionLength.max}
        </Hint>
      </div>
    </>
  );
}
