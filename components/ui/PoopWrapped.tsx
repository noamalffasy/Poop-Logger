"use client";

import { motion, AnimatePresence } from "motion/react";
import { Maximize2, X, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

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
  const [lastManualChange, setLastManualChange] = useState(0); // Track manual navigation
  
  // Generate snarky comments once and keep them consistent
  const [snarkyComments] = useState(() => ({
    total: "",
    mostDay: "",
    mostMonth: "",
    streak: "",
    hour: "",
    weekday: "",
  }));

  // Get all available years from the data (memoized)
  const availableYears = useMemo(() => 
    Array.from(
      new Set(data.map((entry) => new Date(entry.timestamp).getFullYear()))
    ).sort((a, b) => b - a), // Sort descending (newest first)
    [data]
  );

  const currentYear = new Date().getFullYear();
  // Initialize with most recent available year or current year if it exists in data
  const initialYear = availableYears.includes(currentYear) ? currentYear : availableYears[0];
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Filter data to only include entries from the selected year
  const yearData = data.filter((entry) => {
    const entryYear = new Date(entry.timestamp).getFullYear();
    return entryYear === selectedYear;
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

  // Autoplay in full-screen mode
  useEffect(() => {
    if (!isFullScreen || !api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      }
      // Don't loop back to start - stop at the end
    }, 8000); // 8 seconds per slide (4s animations + 4s view time)

    return () => clearInterval(interval);
  }, [isFullScreen, api, lastManualChange]); // Reset timer on manual navigation

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullScreen) return;
      
      if (e.key === "Escape") {
        setIsFullScreen(false);
      } else if (e.key === "ArrowRight") {
        api?.scrollNext();
        setLastManualChange(Date.now()); // Reset timer
      } else if (e.key === "ArrowLeft") {
        api?.scrollPrev();
        setLastManualChange(Date.now()); // Reset timer
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, api]);

  // Share slide as image
  const handleShare = async (slideIndex: number) => {
    try {
      const slideElement = document.querySelector(`[data-slide-index="${slideIndex}"]`);
      if (!slideElement) {
        console.error('Slide element not found for index:', slideIndex);
        return;
      }

      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(slideElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          return;
        }
        
        const file = new File([blob], `${selectedYear}-wrapped-slide-${slideIndex + 1}.png`, { type: 'image/png' });
        
        // Check if Web Share API is available and supports files
        if (navigator.share && navigator.canShare) {
          try {
            const canShareFiles = navigator.canShare({ files: [file] });
            if (canShareFiles) {
              await navigator.share({
                title: `${selectedYear} Wrapped - Slide ${slideIndex + 1}`,
                text: `Check out my ${selectedYear} stats!`,
                files: [file],
              });
              return;
            }
          } catch (shareError) {
            console.error('Share failed:', shareError);
          }
        }
        
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedYear}-wrapped-slide-${slideIndex + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to share:', error);
      alert('Failed to share. Please try again.');
    }
  };

  // Initialize snarky comments once per year data change (before any early returns)
  useEffect(() => {
    // Only generate comments if we have data
    if (yearData.length === 0) return;

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
    };

    const getRandomComment = (key: string) => {
      const commentList = comments[key] || comments.total;
      return commentList[Math.floor(Math.random() * commentList.length)];
    };

    // Generate comments once and store them
    snarkyComments.total = getRandomComment("total");
    snarkyComments.mostDay = getRandomComment("mostDay");
    snarkyComments.mostMonth = getRandomComment("mostMonth");
    snarkyComments.streak = getRandomComment("streak");
    snarkyComments.hour = getRandomComment("hour");
    snarkyComments.weekday = getRandomComment("weekday");
  }, [selectedYear, yearData.length, snarkyComments]);

  // If there's no data for the selected year, show a message
  if (yearData.length === 0) {
    return (
      <Card className="shadow-lg w-full max-w-xs mx-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">A Year in Rearview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No data available for {selectedYear} yet. Start logging to see your stats!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalPoops = yearData.length;

  const mostPoopsDate = yearData.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPoopsDateEntry = Object.entries(mostPoopsDate).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  const mostPoopsMonth = yearData.reduce((acc, entry) => {
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

  // Calculate average per day based on actual data span
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  
  // Get the range of dates in the selected year's data
  const yearDates = yearData.map(entry => {
    const date = new Date(entry.timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });
  
  const minDate = yearDates.length > 0 ? Math.min(...yearDates) : Date.now();
  const maxDate = yearDates.length > 0 ? Math.max(...yearDates) : Date.now();
  const daysSpan = Math.max(1, Math.ceil((maxDate - minDate) / MILLISECONDS_PER_DAY) + 1);
  const avgPerDay = (totalPoops / daysSpan).toFixed(1);

  // Calculate busiest hour
  const hourCounts = yearData.reduce((acc, entry) => {
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
  const sortedData = [...yearData].sort((a, b) => a.timestamp - b.timestamp);
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
  const weekdayCounts = yearData.reduce((acc, entry) => {
    const day = new Date(entry.timestamp).toLocaleDateString("default", { weekday: "long" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteWeekdayEntry = Object.entries(weekdayCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  const slides = [
    {
      pretext: "Brace yourself...",
      title: `${selectedYear} Wrapped`,
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
        { text: selectedYear.toString(), type: "bold" },
      ],
      followup: snarkyComments.total,
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
      followup: snarkyComments.mostDay,
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
      followup: snarkyComments.mostMonth,
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
      followup: snarkyComments.hour,
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
      followup: snarkyComments.streak,
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
      followup: snarkyComments.weekday,
      gradient: "bg-gradient-to-br from-pink-500 via-rose-600 to-red-600",
      stats: `${favoriteWeekdayEntry[1]} visits on ${favoriteWeekdayEntry[0]}s`,
    },
    {
      pretext: "Here's everything",
      title: `${selectedYear} Summary`,
      description: [
        { text: "All your stats at a glance", type: "normal" },
      ],
      followup: "What a year it's been! 📊",
      gradient: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
      isSummary: true,
    },
  ];

  const renderSlide = (slide: typeof slides[0] & { isSummary?: boolean }, index: number, isFullScreen: boolean) => (
    <CarouselItem
      key={index}
      data-slide-index={index}
      className={`relative flex flex-col items-center justify-center text-white ${slide.gradient} ${
        isFullScreen ? "min-h-screen" : "aspect-[9/16]"
      } overflow-hidden px-6 md:px-12`}
    >
      {/* Tap zones for navigation in full-screen */}
      {isFullScreen && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            onClick={() => {
              api?.scrollPrev();
              setLastManualChange(Date.now()); // Reset timer
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            onClick={() => {
              api?.scrollNext();
              setLastManualChange(Date.now()); // Reset timer
            }}
          />
        </>
      )}

      {/* Pre-text with fade entrance */}
      <motion.p
        className={`${isFullScreen ? "text-base md:text-lg" : "text-xs"} font-bold tracking-wide uppercase absolute ${
          isFullScreen ? "top-24 md:top-32" : "top-16"
        } opacity-80`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{
          opacity: [0, 0.8, 0.8, 0],
          y: [20, 0, 0, -20],
        }}
        transition={{
          duration: 3,
          times: [0, 0.2, 0.7, 1],
          ease: "easeInOut",
        }}
      >
        {slide.pretext}
      </motion.p>

      <div className="text-center w-full max-w-lg md:max-w-2xl">
        {/* Title with clean fade and scale */}
        <motion.h2
          className={`${
            isFullScreen ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl" : "text-3xl"
          } font-black mb-8 md:mb-12 leading-tight tracking-tight`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{
            opacity: [0, 1],
            scale: [0.9, 1],
            y: [20, 0],
          }}
          transition={{
            duration: 0.6,
            delay: 3,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {slide.title}
        </motion.h2>

        {/* Description with smooth fade */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.3, duration: 0.5, ease: "easeOut" }}
          className={`${isFullScreen ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg"} leading-snug font-medium mb-6`}
        >
          {slide.description.map((entry, i) => (
            <span
              key={i}
              className={entry.type === "bold" ? "font-black" : "font-normal opacity-95"}
            >
              {entry.text}
            </span>
          ))}
        </motion.div>

        {/* Stats line with fade */}
        {slide.stats && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.75 }}
            transition={{
              duration: 0.5,
              delay: 3.6,
              ease: "easeOut",
            }}
            className={`${isFullScreen ? "text-lg md:text-xl" : "text-sm"} font-semibold opacity-75`}
          >
            {slide.stats}
          </motion.p>
        )}

        {/* Summary stats grid */}
        {slide.isSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 3.3,
              ease: "easeOut",
            }}
            className={`mt-8 md:mt-12 grid grid-cols-1 gap-4 ${isFullScreen ? "text-base md:text-lg" : "text-xs"} text-left w-full max-w-md`}
          >
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span className="opacity-70">Total Poops:</span>
              <span className="font-bold">{totalPoops}</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span className="opacity-70">Average per Day:</span>
              <span className="font-bold">{avgPerDay}</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span className="opacity-70">Record Day:</span>
              <span className="font-bold">{mostPoopsDateEntry[0]}</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span className="opacity-70">Peak Month:</span>
              <span className="font-bold">{mostPoopsMonthEntry[0]}</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span className="opacity-70">Busiest Hour:</span>
              <span className="font-bold">{busiestHourEntry[0]}</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span className="opacity-70">Longest Streak:</span>
              <span className="font-bold">{longestStreak} days</span>
            </div>
            <div className="flex justify-between border-b border-white/20 pb-2">
              <span className="opacity-70">Favorite Day:</span>
              <span className="font-bold">{favoriteWeekdayEntry[0]}</span>
            </div>
          </motion.div>
        )}

        {/* Snarky comment with delayed fade */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{
            opacity: [0, 0.7],
            y: [10, 0],
          }}
          transition={{
            duration: 0.5,
            delay: 4,
            ease: "easeOut",
          }}
          className={`mt-8 md:mt-12 ${isFullScreen ? "text-lg md:text-2xl" : "text-sm"} font-bold opacity-70 italic`}
        >
          {slide.followup}
        </motion.p>
      </div>
    </CarouselItem>
  );

  return (
    <>
      {/* Compact Card View - Mobile First */}
      <Card className="shadow-lg w-full max-w-xs mx-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">A Year in Rearview</CardTitle>
          <div className="flex items-center gap-1">
            {/* Year selector */}
            {availableYears.length > 1 && (
              <div className="flex items-center gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = availableYears.indexOf(selectedYear);
                    if (currentIndex < availableYears.length - 1) {
                      setSelectedYear(availableYears[currentIndex + 1]);
                    }
                  }}
                  disabled={selectedYear === availableYears[availableYears.length - 1]}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-sm font-semibold min-w-[3rem] text-center">
                  {selectedYear}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = availableYears.indexOf(selectedYear);
                    if (currentIndex > 0) {
                      setSelectedYear(availableYears[currentIndex - 1]);
                    }
                  }}
                  disabled={selectedYear === availableYears[0]}
                  className="h-7 w-7"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(true)}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <Carousel className="aspect-[9/16]" setApi={setApi}>
            <CarouselContent className="flex w-full h-full aspect-[9/16]">
              {slides.map((slide, index) => renderSlide(slide, index, false))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          {count > 0 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {Array.from({ length: count }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === current ? "bg-primary w-6" : "bg-muted w-1.5"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-Screen Modal - Touch Optimized */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background"
          >
            {/* Floating share button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleShare(current)}
              className="absolute top-4 left-4 z-50 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/10 hover:bg-background/20 text-white"
              title="Share this slide"
            >
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Year selector in full-screen */}
            {availableYears.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-full px-3 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = availableYears.indexOf(selectedYear);
                    if (currentIndex < availableYears.length - 1) {
                      setSelectedYear(availableYears[currentIndex + 1]);
                    }
                  }}
                  disabled={selectedYear === availableYears[availableYears.length - 1]}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-white font-bold text-sm min-w-[3rem] text-center">
                  {selectedYear}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = availableYears.indexOf(selectedYear);
                    if (currentIndex > 0) {
                      setSelectedYear(availableYears[currentIndex - 1]);
                    }
                  }}
                  disabled={selectedYear === availableYears[0]}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 right-4 z-50 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/10 hover:bg-background/20 text-white"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Carousel className="h-screen w-screen" setApi={setApi}>
              <CarouselContent className="h-screen">
                {slides.map((slide, index) => renderSlide(slide, index, true))}
              </CarouselContent>
              {/* Hidden prev/next buttons - navigation via tap zones instead */}
            </Carousel>
            {count > 0 && (
              <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-50">
                {Array.from({ length: count }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 sm:h-2.5 rounded-full transition-all ${
                      index === current ? "bg-white w-6 sm:w-8" : "bg-white/40 w-2 sm:w-2.5"
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
