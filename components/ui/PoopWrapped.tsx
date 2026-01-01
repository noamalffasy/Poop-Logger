"use client";

import { motion, AnimatePresence } from "motion/react";
import { Maximize2, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ProcessedData } from "@/store/dataSlice";
import { Button } from "@/components/ui/button";

interface PoopWrappedProps {
  data: ProcessedData;
}

const PoopWrapped: React.FC<PoopWrappedProps> = ({ data }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Filter data to only include entries from the current year
  const currentYear = new Date().getFullYear();
  const currentYearData = data.filter((entry) => {
    const entryYear = new Date(entry.timestamp).getFullYear();
    return entryYear === currentYear;
  });

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullScreen) return;
      
      if (e.key === "Escape") {
        setIsFullScreen(false);
      } else if (e.key === "ArrowRight") {
        api?.scrollNext();
      } else if (e.key === "ArrowLeft") {
        api?.scrollPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, api]);

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

  // Calculate statistics
  const totalPoops = currentYearData.length;

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

  // Calculate average per day
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  const daysSinceYearStart = Math.ceil(
    (Date.now() - new Date(currentYear, 0, 1).getTime()) / MILLISECONDS_PER_DAY
  );
  const avgPerDay = (totalPoops / daysSinceYearStart).toFixed(1);

  // Calculate busiest hour
  const hourCounts = currentYearData.reduce((acc, entry) => {
    const hour = new Date(entry.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const busiestHourEntry = Object.entries(hourCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );
  const busiestHour = parseInt(busiestHourEntry[0]);
  const busiestHourCount = busiestHourEntry[1];
  const busiestHourFormatted = busiestHour === 0 ? "12 AM" : 
    busiestHour === 12 ? "12 PM" :
    busiestHour < 12 ? `${busiestHour} AM` : `${busiestHour - 12} PM`;

  // Calculate longest streak
  const sortedData = [...currentYearData].sort((a, b) => a.timestamp - b.timestamp);
  let longestStreak = 1;
  let currentStreak = 1;

  if (sortedData.length > 1) {
    let lastDate = new Date(sortedData[0].timestamp);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedData.length; i++) {
      const currentDate = new Date(sortedData[i].timestamp);
      currentDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / MILLISECONDS_PER_DAY);
      
      if (dayDiff === 0) {
        // Same day, continue streak
        continue;
      } else if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (dayDiff > 1) {
        currentStreak = 1;
      }
      lastDate = currentDate;
    }
  }

  // Calculate weekday distribution
  const weekdayCounts = currentYearData.reduce((acc, entry) => {
    const day = new Date(entry.timestamp).toLocaleDateString("default", { weekday: "long" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteWeekdayEntry = Object.entries(weekdayCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  // Calculate percentile (top X% of poopers)
  const percentile = Math.min(99, Math.max(1, Math.floor((totalPoops / 365) * 100)));

  const getSnarkyComment = (stat: string): string => {
    const comments: Record<string, string[]> = {
      total: [
        "That's a lot of time on the throne! 👑",
        "Your toilet is your best friend at this point.",
        "Wouldn't want to enter the toilet olympics, would you?",
        "That's commitment to digestive excellence!",
        "Your toilet seat has seen some things this year.",
      ],
      mostDay: [
        "Oof that must've been a rough day for your toilet.",
        "Your toilet needed a break after that day!",
        "Someone had too much fiber that day...",
        "That day was legendary in bathroom history.",
        "Your toilet is still recovering from this day.",
      ],
      mostMonth: [
        "You were on a roll!",
        "That month was explosive! 💥",
        "Someone discovered a new coffee shop that month?",
        "Your toilet saw some serious action that month!",
        "What happened that month? We need answers!",
      ],
      streak: [
        "That's dedication to regularity! 🏆",
        "Consistency is key, they say!",
        "You're like a well-oiled machine!",
        "Your digestive system has a schedule!",
        "That's what we call routine!",
      ],
      hour: [
        "Clockwork precision! ⏰",
        "Your body has a schedule and it sticks to it!",
        "Peak performance hours identified!",
        "That's when the magic happens!",
        "Your toilet knows to expect you then!",
      ],
      weekday: [
        "That day just hits different! 📅",
        "Your body knows what day it is!",
        "Some days are just meant for the throne!",
        "That's your special day apparently!",
        "Your favorite day for a reason!",
      ],
      percentile: [
        "You're basically a professional at this point!",
        "Elite status achieved! 🌟",
        "You're in rare company!",
        "Not many can claim this achievement!",
        "You've mastered the art!",
      ],
    };

    const getRandomComment = (key: string) => {
      const commentList = comments[key] || comments.total;
      return commentList[Math.floor(Math.random() * commentList.length)];
    };

    return getRandomComment(stat);
  };

  const slides = [
    {
      pretext: "Welcome to your year in review",
      title: `${currentYear} Wrapped`,
      description: [
        { text: "Let's dive into your ", type: "normal" },
        { text: "bathroom journey", type: "bold" },
        { text: " this year!", type: "normal" },
      ],
      followup: "Buckle up, this is going to be interesting! 🚽",
      gradient: "bg-gradient-to-br from-purple-600 via-pink-600 to-red-600",
    },
    {
      pretext: "This year you've been busy",
      title: "Total Poops",
      description: [
        { text: "You logged ", type: "normal" },
        { text: totalPoops.toString(), type: "bold" },
        { text: " poops in ", type: "normal" },
        { text: currentYear.toString(), type: "bold" },
        { text: "!", type: "normal" },
      ],
      followup: getSnarkyComment("total"),
      gradient: "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600",
      stats: `That's ${avgPerDay} per day on average`,
    },
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
      followup: getSnarkyComment("mostDay"),
      gradient: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
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
      followup: getSnarkyComment("mostMonth"),
      gradient: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600",
    },
    {
      pretext: "Your body runs like clockwork",
      title: "Peak Performance Time",
      description: [
        { text: "Your busiest hour was ", type: "normal" },
        { text: busiestHourFormatted, type: "bold" },
        { text: " with ", type: "normal" },
        { text: busiestHourCount.toString(), type: "bold" },
        { text: " visits!", type: "normal" },
      ],
      followup: getSnarkyComment("hour"),
      gradient: "bg-gradient-to-br from-orange-500 via-red-600 to-pink-600",
    },
    {
      pretext: "Consistency is everything",
      title: "Longest Streak",
      description: [
        { text: "You pooped ", type: "normal" },
        { text: `${longestStreak} days`, type: "bold" },
        { text: " in a row!", type: "normal" },
      ],
      followup: getSnarkyComment("streak"),
      gradient: "bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600",
    },
    {
      pretext: "Some days just hit different",
      title: "Favorite Day",
      description: [
        { text: "You prefer ", type: "normal" },
        { text: favoriteWeekdayEntry[0], type: "bold" },
        { text: " with ", type: "normal" },
        { text: favoriteWeekdayEntry[1].toString(), type: "bold" },
        { text: " visits!", type: "normal" },
      ],
      followup: getSnarkyComment("weekday"),
      gradient: "bg-gradient-to-br from-pink-500 via-rose-600 to-red-600",
    },
    {
      pretext: "You're special",
      title: "Elite Status",
      description: [
        { text: "You're in the top ", type: "normal" },
        { text: `${percentile}%`, type: "bold" },
        { text: " of consistent poopers!", type: "normal" },
      ],
      followup: getSnarkyComment("percentile"),
      gradient: "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600",
    },
  ];

  const renderSlide = (slide: typeof slides[0], index: number, isFullScreen: boolean) => (
    <CarouselItem
      key={index}
      className={`relative flex flex-col items-center justify-center text-white ${slide.gradient} ${
        isFullScreen ? "min-h-screen" : "aspect-[9/16]"
      }`}
    >
      <motion.p
        className={`${isFullScreen ? "text-4xl md:text-5xl" : "text-2xl"} tracking-tight opacity-75 absolute ${
          isFullScreen ? "top-1/4" : "top-1/3"
        }`}
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
      <div className="text-center px-8 max-w-3xl">
        <motion.h2
          className={`${
            isFullScreen ? "text-4xl md:text-6xl" : "text-xl"
          } tracking-tighter font-bold mb-4`}
          initial={{ opacity: 0, y: "100%" }}
          whileInView={{
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
          className={`${isFullScreen ? "text-3xl md:text-4xl" : "text-xl"} tracking-tight`}
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
        {slide.stats && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{
              opacity: [0, 0.6],
            }}
            transition={{
              ease: ["easeOut"],
              duration: 0.3,
              times: [0, 1],
              delay: 4.7,
            }}
            className={`mt-3 ${isFullScreen ? "text-xl md:text-2xl" : "text-sm"} text-center`}
          >
            {slide.stats}
          </motion.p>
        )}
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
          className={`mt-6 ${isFullScreen ? "text-xl md:text-2xl" : "text-sm"} text-center`}
        >
          {slide.followup}
        </motion.p>
      </div>
    </CarouselItem>
  );

  return (
    <>
      {/* Compact Card View */}
      <Card className="shadow-lg max-w-xs mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>A Year in Rearview</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(true)}
            className="h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Carousel className="aspect-[9/16]" setApi={setApi}>
            <CarouselContent className="flex w-full h-full aspect-[9/16]">
              {slides.map((slide, index) => renderSlide(slide, index, false))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          {count > 0 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: count }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === current ? "bg-primary w-4" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-Screen Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-background/10 hover:bg-background/20 text-white"
            >
              <X className="h-6 w-6" />
            </Button>
            <Carousel className="h-screen w-screen" setApi={setApi}>
              <CarouselContent className="h-screen">
                {slides.map((slide, index) => renderSlide(slide, index, true))}
              </CarouselContent>
              <CarouselPrevious className="left-4 h-12 w-12 bg-background/10 hover:bg-background/20 border-none text-white" />
              <CarouselNext className="right-4 h-12 w-12 bg-background/10 hover:bg-background/20 border-none text-white" />
            </Carousel>
            {count > 0 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-3 z-50">
                {Array.from({ length: count }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 rounded-full transition-all ${
                      index === current ? "bg-white w-8" : "bg-white/40 w-3"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PoopWrapped;
