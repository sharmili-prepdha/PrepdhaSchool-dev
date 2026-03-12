"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

export function WeakTopicsCard({
  weakTopics,
}: {
  weakTopics: { topic_id: number; topic: { title: string }; accuracy: number }[];
}) {
  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  const [api, setApi] = React.useState<CarouselApi>();
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="cursor-pointer"
        onMouseEnter={() => plugin.current.stop()}
        onMouseLeave={() => plugin.current.reset()}
      >
        <CarouselContent className="h-48 sm:h-56 md:h-64">
          {weakTopics.map((topic) => (
            <CarouselItem key={topic.topic_id} className="h-full cursor-pointer">
              <Link href={`/student/learning/${topic.topic_id}`} className="block h-full">
                <Card className="rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm h-full w-full hover:shadow-md transition">
                  <CardContent className="flex flex-col items-center justify-center h-full pb-6 sm:pb-10 px-4 sm:px-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 text-center line-clamp-2">
                      {topic.topic.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">
                      Accuracy: {topic.accuracy}%
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Progress Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-1.5 bg-white/70 backdrop-blur rounded-xl border z-10">
        {weakTopics.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === index ? "w-6 bg-gray-800" : "w-2 bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
