import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface ToolSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ToolSearch({ value, onChange }: ToolSearchProps) {
  return (
    <div className="relative">
      <label htmlFor="tool-search" className="sr-only">
        Search tools by name
      </label>

      <Search
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
          "text-muted-foreground",
        )}
      />

      <Input
        id="tool-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search tools"
        className="w-56 py-1.5 pl-9"
      />
    </div>
  );
}
