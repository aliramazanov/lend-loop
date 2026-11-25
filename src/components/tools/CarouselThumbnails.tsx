import { useCarousel } from "@/components/ui/Carousel";
import { cn } from "@/lib/utils";
import type { CarouselThumbnailsProps } from "@/types";

export function CarouselThumbnails({ photoUrls }: CarouselThumbnailsProps) {
  const { selectedIndex, scrollTo } = useCarousel();

  return (
    <ul className="mt-2 flex gap-2 overflow-x-auto overflow-y-hidden p-1">
      {photoUrls.map((url, index) => (
        <li key={url} className="shrink-0">
          <button
            type="button"
            onClick={() => scrollTo(index)}
            aria-label={`Show photo ${index + 1}`}
            aria-current={index === selectedIndex}
            className={cn(
              "block cursor-pointer overflow-hidden rounded-lg ring-2",
              "ring-transparent transition",
              index === selectedIndex && "ring-primary",
            )}
          >
            <img src={url} alt="" className="h-16 w-20 object-cover" />
          </button>
        </li>
      ))}
    </ul>
  );
}
