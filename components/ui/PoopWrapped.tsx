import { motion } from "motion/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProcessedData } from "@/store/dataSlice";

interface PoopWrappedProps {
  data: ProcessedData;
}

const PoopWrapped: React.FC<PoopWrappedProps> = ({ data }) => {
  // Filter data to only include entries from the current year
  const currentYear = new Date().getFullYear();
  const currentYearData = data.filter((entry) => {
    const entryYear = new Date(entry.timestamp).getFullYear();
    return entryYear === currentYear;
  });

  // If there's no data for the current year, show a message
  if (currentYearData.length === 0) {
    return (
      <Card className="shadow-lg max-w-xs mx-auto">
        <CardHeader>
          <CardTitle>A Year in Rearview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No data available for {currentYear} yet. Start logging to see your stats!
          </p>
        </CardContent>
      </Card>
    );
  }

  const mostPoopsDate = currentYearData.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPoopsDateEntry = Object.entries(mostPoopsDate).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  const mostPoopsMonth = currentYearData.reduce((acc, entry) => {
    const month = new Date(entry.timestamp).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPoopsMonthEntry = Object.entries(mostPoopsMonth).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  const totalPoops = currentYearData.length;

  const slides = [
    {
      pretext: "You poop regularly. But one day stood out",
      title: "Most Poops in a Day",
      description: [
        { text: "You pooped the most times on ", type: "normal" },
        { text: mostPoopsDateEntry[0], type: "bold" },
        { text: " with a total of ", type: "normal" },
        { text: mostPoopsDateEntry[1], type: "bold" },
        { text: " poops!", type: "normal" },
      ],
      followup: "Oof that must've been a rough day for your toilet.",
      gradient: "bg-gradient-to-r from-blue-500 to-indigo-500",
    },
    {
      pretext: "You've been consistent. But one month was special",
      title: "Most Active Month",
      description: [
        { text: "Your most active month was ", type: "normal" },
        { text: mostPoopsMonthEntry[0], type: "bold" },
        { text: " with ", type: "normal" },
        { text: mostPoopsMonthEntry[1], type: "bold" },
        { text: " poops!", type: "normal" },
      ],
      followup: "You were on a roll!",
      gradient: "bg-gradient-to-r from-green-500 to-teal-500",
    },
    {
      pretext: "This year you've been a busy bee",
      title: "Total Poops",
      description: [
        { text: "You had a total of ", type: "normal" },
        { text: totalPoops.toString(), type: "bold" },
        { text: " poops this year. Keep it up!", type: "normal" },
      ],
      followup: "Wouldn't want to enter the toilet olympics, would you?",
      gradient: "bg-gradient-to-r from-red-500 to-pink-500",
    },
  ];

  return (
    <Card className="shadow-lg max-w-xs mx-auto">
      <CardHeader>
        <CardTitle>A Year in Rearview</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel className="aspect-[9/16]">
          <CarouselContent className="flex w-full h-full aspect-[9/16]">
            {slides.map((slide, index) => (
              <CarouselItem
                key={index}
                className={`relative p-4 flex flex-col items-center justify-center text-white ${slide.gradient} w-full h-full`}
              >
                <motion.p
                  className="text-2xl tracking-tight opacity-75 absolute top-1/3"
                  initial={{ opacity: 0, y: "100%", visibility: "hidden" }}
                  whileInView={{
                    opacity: [null, 0.75, 0.75, 0],
                    y: [null, 0, 0, "-100%"],
                    visibility: [null, "visible", "visible", "hidden"],
                  }}
                  transition={{
                    ease: ["easeOut"],
                    duration: 4,
                    times: [0, 0.1, 0.8, 1],
                    delay: 0.5,
                    repeat: 0,
                  }}
                >
                  {slide.pretext}
                </motion.p>
                <motion.h2
                  className="text-xl tracking-tighter font-bold mb-2"
                  initial={{ opacity: 0, y: "100%" }}
                  whileInView={{
                    fontSize: ["1rem", "1rem"],
                    opacity: [null, 1],
                    y: [null, "0"],
                  }}
                  transition={{
                    ease: ["easeOut"],
                    duration: 0.3,
                    times: [0, 1],
                    delay: 4.5,
                  }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: "100%" }}
                  whileInView={{
                    opacity: [null, 1],
                    y: [null, 0],
                  }}
                  transition={{
                    ease: ["easeOut"],
                    duration: 0.3,
                    times: [0, 1],
                    delay: 4.2,
                  }}
                  className="text-xl tracking-tight"
                >
                  {slide.description.map((entry, i) =>
                    entry.type === "bold" ? (
                      <span className="font-bold" key={i}>
                        {entry.text}
                      </span>
                    ) : (
                      <span className="opacity-75" key={i}>
                        {entry.text}
                      </span>
                    )
                  )}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{
                    opacity: [0, 0.5],
                  }}
                  transition={{
                    ease: ["easeOut"],
                    duration: 0.3,
                    times: [0, 1],
                    delay: 5,
                  }}
                  className="mt-4 text-sm text-center"
                >
                  {slide.followup}
                </motion.p>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default PoopWrapped;
