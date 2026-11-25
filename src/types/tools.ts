import type { BoardTool, ToolDetailsView } from "@/types/api";
import type { BadgeTone } from "@/types/ui";
import type { Id } from "@convex/_generated/dataModel";
import type { Category } from "@convex/types/catalog";
import type { DateRange as PickedRange } from "react-day-picker";

export interface AdminRemovePanelProps {
  toolId: Id<"tools">;
  toolName: string;
}

export interface Availability {
  tone: BadgeTone;
  label: string;
}

export interface AvailabilityBadgeProps {
  isArchived: boolean;
  isAvailable: boolean;
}

export interface AvailabilityCalendarProps {
  bookedRanges: ToolDetailsView["bookedRanges"];
  selected?: PickedRange;
  onSelect?: (range: PickedRange | undefined) => void;
}

export interface BorrowPanelProps {
  tool: ToolDetailsView;
}

export interface BreadcrumbsProps {
  category: Category;
  toolName: string;
}

export interface OwnerStatProps {
  label: string;
  value: string;
}

export interface OwnerCardProps {
  tool: ToolDetailsView;
}

export interface ToolDetailsProps {
  toolId: string;
}

export interface ToolSummaryCardProps {
  tool: ToolDetailsView;
}

export interface CarouselThumbnailsProps {
  photoUrls: string[];
}

export interface FilterChipProps {
  href: string;
  isActive: boolean;
  label: string;
}

export interface CategoryFilterProps {
  selected?: Category;
}

export interface PhotoCarouselProps {
  name: string;
  category: Category;
  photoUrls: string[];
  showThumbnails?: boolean;
  className?: string;
}

export interface SlideCounterProps {
  total: number;
}

export interface ToolBrowserProps {
  category?: Category;
}

export interface ToolCardProps {
  tool: BoardTool;
}

export interface ToolPhotoProps {
  name: string;
  category: Category;
  photoUrl: string | null;
  className?: string;
}

export interface ToolSearchProps {
  value: string;
  onChange: (value: string) => void;
}
