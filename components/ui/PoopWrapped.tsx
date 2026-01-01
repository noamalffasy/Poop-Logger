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
        "Holy sh*t! That's a lot of bathroom breaks! 💩",
        "Your toilet paper budget must be INSANE.",
        "The throne has seen more of you than your couch this year.",
        "Your toilet's gonna file for worker's comp at this rate.",
        "That's enough to fertilize a small farm. Just saying. 🌾",
        "Someone's fiber intake is OFF THE CHARTS!",
      ],
      mostDay: [
        "RIP your toilet. It never stood a chance that day. 🪦",
        "We should've sent flowers to your bathroom after that.",
        "Your toilet called in sick the next day, I heard.",
        "That day will go down in infamy. Never forget. 🫡",
        "Hope you had a good book handy that day...",
        "Your toilet's therapy bills must be astronomical.",
      ],
      mostMonth: [
        "That month was UNHINGED! What were you eating?! 😱",
        "Did you lose a bet or something? Damn.",
        "Your plumber is probably naming their yacht after you.",
        "I'm calling Guinness World Records about this one.",
        "That month was a CRIME SCENE. 🚨",
        "Someone discovered Taco Bell that month, huh?",
      ],
      streak: [
        "You're basically a sh*tting MACHINE at this point. 🤖",
        "Most people can't commit to ANYTHING like this!",
        "Your consistency is honestly terrifying.",
        "This is either impressive or concerning. We're not sure.",
        "You could set your watch by this. Literally.",
        "Your intestines run tighter than a Swiss watch. ⏰",
      ],
      hour: [
        "Your colon has better punctuality than most people.",
        "This is clockwork at its FINEST. Or weirdest.",
        "Hope your boss doesn't notice this pattern... 👀",
        "Everyone knows not to book meetings during this time, right?",
        "The prophecy has foretold this hour of reckoning.",
        "Your body runs on a schedule even YOU can't change.",
      ],
      weekday: [
        "Clearly this is your toilet's favorite day too. 🚽",
        "Your bowels have STRONG opinions about this day.",
        "Hope that's not during important meetings... 😬",
        "Your body said 'NOT TODAY' to productivity on this day.",
        "This day is OWNED by your digestive system.",
        "Guess we found your favorite day of the week. 💀",
      ],
      percentile: [
        "You're in the HALL OF FAME. We're building a statue.",
        "Elite doesn't even BEGIN to cover this. 👑",
        "You've transcended normal human limits. Congrats?",
        "This level of dedication is... unsettling honestly.",
        "You're not just top tier. You're LEGENDARY status.",
        "The 1% we didn't know existed. But here we are.",
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
      pretext: "Brace yourself...",
      title: `${currentYear} Wrapped`,
      description: [
        { text: "Your ", type: "normal" },
        { text: "BATHROOM HISTORY", type: "bold" },
        { text: " in all its glory", type: "normal" },
      ],
      followup: "This year's stats are absolutely WILD 💩",
      gradient: "bg-gradient-to-br from-purple-600 via-pink-600 to-red-600",
    },
    {
      pretext: "Let's talk numbers...",
      title: "Total Poops",
      description: [
        { text: "A whopping ", type: "normal" },
        { text: totalPoops.toString(), type: "bold" },
        { text: " logs in ", type: "normal" },
        { text: currentYear.toString(), type: "bold" },
      ],
      followup: getSnarkyComment("total"),
      gradient: "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600",
      stats: `${avgPerDay} times per day (we're counting)`,
    },
    {
      pretext: "This day will be remembered...",
      title: "Your Record Day",
      description: [
        { text: mostPoopsDateEntry[0], type: "bold" },
        { text: " — ", type: "normal" },
        { text: mostPoopsDateEntry[1].toString(), type: "bold" },
        { text: " bathroom trips", type: "normal" },
      ],
      followup: getSnarkyComment("mostDay"),
      gradient: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
    },
    {
      pretext: "One month to rule them all",
      title: "Peak Month",
      description: [
        { text: mostPoopsMonthEntry[0], type: "bold" },
        { text: " was absolutely ", type: "normal" },
        { text: "LEGENDARY", type: "bold" },
      ],
      followup: getSnarkyComment("mostMonth"),
      gradient: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600",
      stats: `${mostPoopsMonthEntry[1]} poops that month`,
    },
    {
      pretext: "We've noticed a pattern...",
      title: "The Daily Ritual",
      description: [
        { text: "Every day at ", type: "normal" },
        { text: busiestHourFormatted, type: "bold" },
        { text: " like clockwork", type: "normal" },
      ],
      followup: getSnarkyComment("hour"),
      gradient: "bg-gradient-to-br from-orange-500 via-red-600 to-pink-600",
      stats: `${busiestHourCount} times at this exact hour`,
    },
    {
      pretext: "This is actually impressive",
      title: `${longestStreak}-Day Streak`,
      description: [
        { text: longestStreak.toString(), type: "bold" },
        { text: " consecutive days of ", type: "normal" },
        { text: "PEAK PERFORMANCE", type: "bold" },
      ],
      followup: getSnarkyComment("streak"),
      gradient: "bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600",
    },
    {
      pretext: "You have a favorite",
      title: `${favoriteWeekdayEntry[0]}s Hit Different`,
      description: [
        { text: "Your body ", type: "normal" },
        { text: "OWNS", type: "bold" },
        { text: " this day", type: "normal" },
      ],
      followup: getSnarkyComment("weekday"),
      gradient: "bg-gradient-to-br from-pink-500 via-rose-600 to-red-600",
      stats: `${favoriteWeekdayEntry[1]} visits on ${favoriteWeekdayEntry[0]}s`,
    },
    {
      pretext: "The final verdict",
      title: "Elite Tier Unlocked",
      description: [
        { text: "Top ", type: "normal" },
        { text: `${percentile}%`, type: "bold" },
        { text: " performer worldwide", type: "normal" },
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
      } overflow-hidden`}
    >
      {/* Pre-text with dramatic entrance and exit */}
      <motion.p
        className={`${isFullScreen ? "text-3xl md:text-5xl" : "text-xl"} font-semibold tracking-tight absolute ${
          isFullScreen ? "top-1/4" : "top-1/4"
        }`}
        initial={{ opacity: 0, scale: 0.5, y: 50, rotateX: -90 }}
        whileInView={{
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.1, 1, 0.8],
          y: [50, -10, 0, -100],
          rotateX: [-90, 10, 0, 90],
        }}
        transition={{
          duration: 3.5,
          times: [0, 0.15, 0.75, 1],
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        {slide.pretext}
      </motion.p>

      <div className="text-center px-8 max-w-4xl">
        {/* Title with bounce and scale effect */}
        <motion.h2
          className={`${
            isFullScreen ? "text-5xl md:text-7xl" : "text-2xl"
          } tracking-tighter font-black mb-6`}
          initial={{ opacity: 0, scale: 0.3, rotateY: -180 }}
          whileInView={{
            opacity: [0, 1],
            scale: [0.3, 1.2, 1],
            rotateY: [-180, 10, 0],
          }}
          transition={{
            duration: 0.8,
            times: [0, 0.6, 1],
            ease: [0.68, -0.55, 0.265, 1.55], // Bounce easing
            delay: 3.5,
          }}
        >
          {slide.title}
        </motion.h2>

        {/* Description with staggered word animations */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.3 }}
          className={`${isFullScreen ? "text-3xl md:text-5xl" : "text-lg"} tracking-tight font-medium leading-relaxed`}
        >
          {slide.description.map((entry, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: entry.type === "bold" ? [0.8, 1.15, 1] : 1,
              }}
              transition={{
                delay: 4 + i * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              className={entry.type === "bold" ? "font-black text-white" : "font-light opacity-90"}
            >
              {entry.text}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats line with slide in from side */}
        {slide.stats && (
          <motion.p
            initial={{ opacity: 0, x: -100, rotateZ: -5 }}
            whileInView={{
              opacity: [0, 1],
              x: [-100, 10, 0],
              rotateZ: [-5, 2, 0],
            }}
            transition={{
              duration: 0.7,
              times: [0, 0.7, 1],
              ease: [0.34, 1.56, 0.64, 1],
              delay: 4.8,
            }}
            className={`mt-4 ${isFullScreen ? "text-xl md:text-3xl" : "text-base"} font-semibold tracking-wide`}
          >
            {slide.stats}
          </motion.p>
        )}

        {/* Snarky comment with pop effect */}
        <motion.p
          initial={{ opacity: 0, scale: 0, rotateZ: -180 }}
          whileInView={{
            opacity: [0, 1],
            scale: [0, 1.3, 1],
            rotateZ: [-180, 10, 0],
          }}
          transition={{
            duration: 0.8,
            times: [0, 0.6, 1],
            ease: [0.68, -0.55, 0.265, 1.55],
            delay: 5.3,
          }}
          className={`mt-8 ${isFullScreen ? "text-2xl md:text-3xl" : "text-base"} font-bold tracking-wide italic`}
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
