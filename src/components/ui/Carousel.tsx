/*
 * A photo carousel built on Embla, with keyboard support.
 *
 * Carousel, CarouselContent, CarouselItem, CarouselArrow: the building blocks.
 * useCarousel: the current slide and scroll controls, used by the thumbnails.
 */

import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ComponentProps,
  type KeyboardEvent,
} from "react";
import { Button } from "./Button";
import type { CarouselArrowProps, CarouselState, EmblaApi } from "@/types";

const CarouselContext = createContext<CarouselState | null>(null);

const arrowClasses = "absolute top-1/2 size-8 -translate-y-1/2 rounded-full";

function useEmblaSnapshot<Value>(
  api: EmblaApi | undefined,
  read: (api: EmblaApi) => Value,
  fallback: Value,
) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      api?.on("select", onChange).on("reInit", onChange);

      return () => {
        api?.off("select", onChange).off("reInit", onChange);
      };
    },
    [api],
  );

  return useSyncExternalStore(
    subscribe,
    () => (api ? read(api) : fallback),
    () => fallback,
  );
}

export function useCarousel(): CarouselState {
  const state = useContext(CarouselContext);

  if (!state) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return state;
}

export function Carousel({
  className,
  children,
  ...props
}: ComponentProps<"section">) {
  const [carouselRef, api] = useEmblaCarousel();

  const state: CarouselState = {
    carouselRef,
    selectedIndex: useEmblaSnapshot(api, (a) => a.selectedScrollSnap(), 0),
    canScrollPrev: useEmblaSnapshot(api, (a) => a.canScrollPrev(), false),
    canScrollNext: useEmblaSnapshot(api, (a) => a.canScrollNext(), false),
    scrollTo: (index) => api?.scrollTo(index),
    scrollPrev: () => api?.scrollPrev(),
    scrollNext: () => api?.scrollNext(),
  };

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      state.scrollPrev();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      state.scrollNext();
    }
  }

  return (
    <CarouselContext.Provider value={state}>
      <section
        aria-roledescription="carousel"
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: ComponentProps<"ul">) {
  const { carouselRef } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <ul className={cn("-ml-4 flex", className)} {...props} />
    </div>
  );
}

export function CarouselItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4", className)}
      {...props}
    />
  );
}

export function CarouselArrow({ direction, className }: CarouselArrowProps) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  const isPrevious = direction === "previous";
  const Icon = isPrevious ? ArrowLeft : ArrowRight;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(arrowClasses, className)}
      disabled={isPrevious ? !canScrollPrev : !canScrollNext}
      onClick={isPrevious ? scrollPrev : scrollNext}
    >
      <Icon />
      <span className="sr-only">
        {isPrevious ? "Previous slide" : "Next slide"}
      </span>
    </Button>
  );
}
