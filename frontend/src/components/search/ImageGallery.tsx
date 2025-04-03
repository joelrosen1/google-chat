import Image from "next/image";
import React from "react";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
  } from "@/components/ui/carousel";

interface ImageItem {
  original: string;
  thumbnail: string;
  title?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  title?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  // Determine if we need navigation buttons (more than 5 images)
  const showNavigation = images.length > 5;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Carousel
        opts={{
          align: "start",
          loop: showNavigation, // Only loop if we have navigation
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((img, i) => (
            <CarouselItem key={i} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <a
                href={img.original}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden hover:opacity-90 transition-opacity block max-h-40"
              >
                <div className="absolute inset-0">
                  <Image
                    src={img.thumbnail}
                    alt={img.title || title || ""}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                {img.title && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center">{img.title}</p>
                  </div>
                )}
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNavigation && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default ImageGallery;
