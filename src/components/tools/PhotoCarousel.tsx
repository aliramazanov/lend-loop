import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselArrow,
  useCarousel,
} from "@/components/ui/Carousel";
import { cn } from "@/lib/utils";
import type { Category } from "@convex/shared/catalog";
import { CarouselThumbnails } from "./CarouselThumbnails";
import { ToolPhoto } from "./ToolPhoto";

interface PhotoCarouselProps {
  name: string;
  category: Category;
  photoUrls: string[];
  showThumbnails?: boolean;
  className?: string;
}

function SlideCounter({ total }: { total: number }) {
  const { selectedIndex } = useCarousel();

  return (
    <span
      aria-hidden
      className={cn(
        "absolute right-3 bottom-3 rounded-md px-1.5 py-0.5",
        "bg-black/60 text-xs text-white",
      )}
    >
      {selectedIndex + 1} / {total}
    </span>
  );
}

export function PhotoCarousel({
  name,
  category,
  photoUrls,
  showThumbnails = true,
  className,
}: PhotoCarouselProps) {
  const [coverUrl] = photoUrls;

  if (photoUrls.length <= 1) {
    return (
      <ToolPhoto
        name={name}
        category={category}
        photoUrl={coverUrl ?? null}
        className={cn("aspect-[4/3] w-full rounded-xl", className)}
      />
    );
  }

  return (
    <Carousel aria-label={`${name} photos`} className={className}>
      <div className="relative">
        <CarouselContent>
          {photoUrls.map((url, index) => (
            <CarouselItem key={url}>
              <img
                src={url}
                alt={`${name}, ${index + 1} of ${photoUrls.length}`}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselArrow direction="previous" className="left-3" />
        <CarouselArrow direction="next" className="right-3" />
        <SlideCounter total={photoUrls.length} />
      </div>

      {showThumbnails && <CarouselThumbnails photoUrls={photoUrls} />}
    </Carousel>
  );
}
