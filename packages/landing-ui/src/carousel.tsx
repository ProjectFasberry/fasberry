'use client';

import useEmblaCarousel from 'embla-carousel-react';
import {
  type EmblaCarouselType as CarouselApi,
  type EmblaOptionsType as CarouselOptions,
  type EmblaPluginType as CarouselPlugin,
} from 'embla-carousel';
import { cn } from "@repo/lib/cn"
import { Button } from './button';
import {
  ComponentProps,
  createContext,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin[]
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  
  return context;
}

const Carousel = forwardRef<
  HTMLDivElement, HTMLAttributes<HTMLDivElement> & CarouselProps
>(({
    orientation = 'horizontal', opts, setApi, plugins, className, children, ...props
  }, ref) => {
    const [ carouselRef, api ] = useEmblaCarousel(
      { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' }, plugins,
    );
    
    const [ canScrollPrev, setCanScrollPrev ] = useState(false);
    const [ canScrollNext, setCanScrollNext ] = useState(false);
    
    const onSelect = useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }
      
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);
    
    const scrollPrev = useCallback(() => {
      api?.scrollPrev();
    }, [ api ]);
    
    const scrollNext = useCallback(() => {
      api?.scrollNext();
    }, [ api ]);
    
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    }, [ scrollPrev, scrollNext ]);
    
    useEffect(() => {
      if (!api || !setApi) {
        return;
      }
      
      setApi(api);
    }, [ api, setApi ]);
    
    useEffect(() => {
      if (!api) {
        return;
      }
      
      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);
      
      return () => {
        api?.off('select', onSelect);
      };
    }, [ api, onSelect ]);
    
    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = 'Carousel';

const CarouselContent = forwardRef<
  HTMLDivElement, HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = forwardRef<
  HTMLDivElement, HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = forwardRef<
  HTMLButtonElement, ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  
  return (
    <Button
      ref={ref}
      // @ts-ignore
      variant={variant}
      size={size}
      className={cn(
        'absolute  h-8 w-8 border-none',
        orientation === 'horizontal'
          ? 'lg:-left-12 -bottom-20 lg:top-1/2 -translate-y-1/2'
          : 'lg:-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <img
        src="/images/minecraft/icons/large-arrow-left-hover.png"
        width={26}
        height={26}
        alt="Previous"
      />
      <span className="sr-only">
        Previous slide
      </span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = forwardRef<
  HTMLButtonElement, ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  
  return (
    <Button
      ref={ref}
      // @ts-ignore
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 border-none',
        orientation === 'horizontal'
          ? '-right-0 lg:-right-12 -bottom-20 lg:top-1/2 -translate-y-1/2'
          : 'lg:-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <img
        src="/images/minecraft/icons/large-arrow-right-hover.png"
        width={26}
        height={26}
        alt="Next"
      />
      <span className="sr-only">
        Next slide
      </span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};