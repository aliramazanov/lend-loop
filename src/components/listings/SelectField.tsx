import { Label } from "@/components/ui/Field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { parseChoice } from "@/lib/choices";
import type { SelectFieldProps } from "@/types";

export function SelectField<Option extends string>({
  id,
  name,
  label,
  options,
  defaultValue,
  labelOf = (option) => option,
  onChange,
  className,
}: SelectFieldProps<Option>) {
  function handleChange(value: string) {
    const option = parseChoice(options, value);

    if (option) onChange?.(option);
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      <Select
        name={name}
        defaultValue={defaultValue}
        onValueChange={handleChange}
      >
        <SelectTrigger id={id} className={className}>
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option} className={className}>
              {labelOf(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
