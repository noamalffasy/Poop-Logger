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
  
  // State for snarky comments (will be populated by useMemo after yearData is calculated)
  const [snarkyComments, setSnarkyComments] = useState({
    total: "",
    mostDay: "",
    mostMonth: "",
    streak: "",
    hour: "",
    weekday: "",
  });

  // Get all available years from the data (memoized)
  const availableYears = useMemo(() => 
    Array.from(
      new Set(data.map((entry) => new Date(entry.timestamp).getFullYear()))
    ).sort((a, b) => b - a), // Sort descending (newest first)
    [data]
  );

  const currentYear = new Date().getFullYear();
  // Initialize with most recent available year or current year if it exists in data,
  // and fall back to current year if there is no data yet.
  const initialYear =
    availableYears.length > 0
      ? (availableYears.includes(currentYear) ? currentYear : availableYears[0])
      : currentYear;
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Filter data to only include entries from the selected year
  // Memoize yearData to prevent unnecessary recalculations and useEffect re-runs
  const yearData = useMemo(() => data.filter((entry) => {
    const entryYear = new Date(entry.timestamp).getFullYear();
    return entryYear === selectedYear;
  }), [data, selectedYear]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);

    return () => {
      if (api) {
        api.off("select", handleSelect);
      }
    };
  }, [api]);

  // Reset carousel to first slide when year changes
  useEffect(() => {
    if (api) {
      api.scrollTo(0);
    }
  }, [api, selectedYear]);

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
      const slideElement = document.querySelector(`[data-slide-content="${slideIndex}"]`);
      if (!slideElement) {
        console.error('Slide element not found for index:', slideIndex);
        alert('Could not find slide to share. Please try again.');
        return;
      }

      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Wait longer to ensure all animations and rendering are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(slideElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
      });
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          console.error('canvas.toBlob timed out');
          alert('Sharing is taking longer than expected. Please try again.');
          reject(new Error('canvas.toBlob timed out'));
        }, 10000);

        canvas.toBlob((result) => {
          window.clearTimeout(timeoutId);

          if (!result) {
            console.error('Failed to create blob from canvas');
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          resolve(result);
        }, 'image/png');
      });

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
    } catch (error) {
      console.error('Failed to share:', error);
      alert('Failed to share. Please try again.');
    }
  };

  // Memoized statistics calculations to avoid duplication
  const stats = useMemo(() => {
    if (yearData.length === 0) {
      return null;
    }

    const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

    // Total poops
    const totalPoops = yearData.length;

    // Most poops in a single day
    const mostPoopsDate = yearData.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostPoopsDateEntries = Object.entries(mostPoopsDate);
    const mostPoopsDateEntry = mostPoopsDateEntries.length > 0 
      ? mostPoopsDateEntries.reduce((a, b) => b[1] > a[1] ? b : a)
      : ['N/A', 0] as [string, number];
    const mostPoopsDateCount = mostPoopsDateEntry[1] as number;

    // Most poops in a month
    const mostPoopsMonth = yearData.reduce((acc, entry) => {
      const month = new Date(entry.timestamp).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostPoopsMonthEntries = Object.entries(mostPoopsMonth);
    const mostPoopsMonthEntry = mostPoopsMonthEntries.length > 0
      ? mostPoopsMonthEntries.reduce((a, b) => b[1] > a[1] ? b : a)
      : ['N/A', 0] as [string, number];
    const mostPoopsMonthCount = mostPoopsMonthEntry[1] as number;

    // Average per day based on actual data span
    const yearDates = yearData.map(entry => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    const minDate = yearDates.length > 0 ? Math.min(...yearDates) : Date.now();
    const maxDate = yearDates.length > 0 ? Math.max(...yearDates) : Date.now();
    const daysSpan = Math.max(1, Math.ceil((maxDate - minDate) / MILLISECONDS_PER_DAY) + 1);
    const avgPerDay = (totalPoops / daysSpan).toFixed(1);

    // Busiest hour
    const hourCounts = yearData.reduce((acc, entry) => {
      const hour = new Date(entry.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const busiestHourEntries = Object.entries(hourCounts);
    const busiestHourEntry = busiestHourEntries.length > 0
      ? busiestHourEntries.reduce((a, b) => b[1] > a[1] ? b : a)
      : ['0', 0] as [string, number];
    const busiestHour = parseInt(busiestHourEntry[0] as string);
    const busiestHourCount = busiestHourEntry[1] as number;
    const busiestHourFormatted = busiestHour === 0 ? "12 AM" : 
      busiestHour === 12 ? "12 PM" :
      busiestHour < 12 ? `${busiestHour} AM` : `${busiestHour - 12} PM`;

    // Longest streak
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

    // Weekday distribution
    const weekdayCounts = yearData.reduce((acc, entry) => {
      const day = new Date(entry.timestamp).toLocaleDateString("default", { weekday: "long" });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteWeekdayEntries = Object.entries(weekdayCounts);
    const favoriteWeekdayEntry = favoriteWeekdayEntries.length > 0
      ? favoriteWeekdayEntries.reduce((a, b) => b[1] > a[1] ? b : a)
      : ['N/A', 0] as [string, number];
    const favoriteWeekdayCount = favoriteWeekdayEntry[1] as number;

    return {
      totalPoops,
      mostPoopsDateEntry,
      mostPoopsDateCount,
      mostPoopsMonthEntry,
      mostPoopsMonthCount,
      avgPerDay,
      busiestHour,
      busiestHourCount,
      busiestHourFormatted,
      longestStreak,
      favoriteWeekdayEntry,
      favoriteWeekdayCount,
    };
  }, [yearData]);

  // Calculate statistics and generate contextual snarky comments
  useEffect(() => {
    // Only generate comments if we have data
    if (!stats) return;

    const { totalPoops, mostPoopsDateCount, mostPoopsMonthCount, busiestHourCount, longestStreak, favoriteWeekdayCount } = stats;

    const comments: Record<string, { low: string[]; mid: string[]; high: string[] }> = {
      total: {
        low: [
          "Quality over quantity, right? 🤔",
          "Just getting started, we see.",
          "Rookie numbers, but everyone starts somewhere!",
        ],
        mid: [
          "Pretty standard bathroom activity here.",
          "Your digestive system is running on schedule.",
          "A respectable amount of bathroom visits.",
        ],
        high: [
          "Holy sh*t! That's a lot of bathroom breaks! 💩",
          "Your toilet paper budget must be INSANE.",
          "The throne has seen more of you than your couch this year.",
          "Your toilet's gonna file for worker's comp at this rate.",
          "That's enough to fertilize a small farm. Just saying. 🌾",
          "Someone's fiber intake is OFF THE CHARTS!",
        ],
      },
      mostDay: {
        low: [
          "A quiet day in bathroom history.",
          "That day was... unremarkable. 📅",
          "Just another day on the throne.",
        ],
        mid: [
          "That day had some activity, for sure.",
          "Your bathroom saw some action that day.",
          "A moderately busy day for your toilet.",
        ],
        high: [
          "RIP your toilet. It never stood a chance that day. 🪦",
          "We should've sent flowers to your bathroom after that.",
          "Your toilet called in sick the next day, I heard.",
          "That day will go down in infamy. Never forget. 🫡",
          "Hope you had a good book handy that day...",
          "Your toilet's therapy bills must be astronomical.",
        ],
      },
      mostMonth: {
        low: [
          "A slow month in the bathroom department.",
          "Your toilet got a vacation that month. 🏖️",
          "Not much happening in the throne room that month.",
        ],
        mid: [
          "A pretty average month for bathroom activity.",
          "That month kept things steady.",
          "Moderate bathroom traffic that month.",
        ],
        high: [
          "That month was UNHINGED! What were you eating?! 😱",
          "Did you lose a bet or something? Damn.",
          "Your plumber is probably naming their yacht after you.",
          "I'm calling Guinness World Records about this one.",
          "That month was a CRIME SCENE. 🚨",
          "Someone discovered Taco Bell that month, huh?",
        ],
      },
      streak: {
        low: [
          "Hey, consistency is hard!",
          "Everyone has their own rhythm. 🎵",
          "Short but sweet streak.",
        ],
        mid: [
          "A solid streak going there!",
          "Not bad for keeping the routine.",
          "Your body knows what it's doing.",
        ],
        high: [
          "You're basically a sh*tting MACHINE at this point. 🤖",
          "Most people can't commit to ANYTHING like this!",
          "Your consistency is honestly terrifying.",
          "This is either impressive or concerning. We're not sure.",
          "You could set your watch by this. Literally.",
          "Your intestines run tighter than a Swiss watch. ⏰",
        ],
      },
      hour: {
        low: [
          "Your bathroom schedule is... flexible.",
          "No particular time preference detected.",
          "You keep your toilet guessing. 🎲",
        ],
        mid: [
          "There's a pattern forming here...",
          "Your body has a preference, we see.",
          "Semi-regular bathroom timing detected.",
        ],
        high: [
          "Your colon has better punctuality than most people.",
          "This is clockwork at its FINEST. Or weirdest.",
          "Hope your boss doesn't notice this pattern... 👀",
          "Everyone knows not to book meetings during this time, right?",
          "The prophecy has foretold this hour of reckoning.",
          "Your body runs on a schedule even YOU can't change.",
        ],
      },
      weekday: {
        low: [
          "No strong weekday preference here.",
          "Your body is an equal opportunity pooper. 🗓️",
          "All days are created equal in your bathroom.",
        ],
        mid: [
          "Starting to see a favorite day emerge...",
          "Your body has opinions about this day.",
          "This day gets some special attention.",
        ],
        high: [
          "Clearly this is your toilet's favorite day too. 🚽",
          "Your bowels have STRONG opinions about this day.",
          "Hope that's not during important meetings... 😬",
          "Your body said 'NOT TODAY' to productivity on this day.",
          "This day is OWNED by your digestive system.",
          "Guess we found your favorite day of the week. 💀",
        ],
      },
    };

    const getContextualComment = (key: string, value: number, thresholds: { low: number; high: number }) => {
      const commentSet = comments[key];
      let level: 'low' | 'mid' | 'high' = 'mid';
      
      if (value <= thresholds.low) level = 'low';
      else if (value >= thresholds.high) level = 'high';
      
      const commentList = commentSet[level];
      return commentList[Math.floor(Math.random() * commentList.length)];
    };

    // Generate context-aware comments
    setSnarkyComments({
      total: getContextualComment("total", totalPoops, { low: 50, high: 200 }),
      mostDay: getContextualComment("mostDay", mostPoopsDateCount, { low: 2, high: 5 }),
      mostMonth: getContextualComment("mostMonth", mostPoopsMonthCount, { low: 10, high: 40 }),
      hour: getContextualComment("hour", busiestHourCount, { low: 3, high: 10 }),
      streak: getContextualComment("streak", longestStreak, { low: 3, high: 10 }),
      weekday: getContextualComment("weekday", favoriteWeekdayCount, { low: 5, high: 15 }),
    });
  }, [selectedYear, stats]);

  // Memoize slides array to avoid recalculation on every render
  // Must be before early return to comply with React Hooks rules
  const slides = useMemo(() => {
    if (!stats) return [];
    
    const { 
      totalPoops,
      mostPoopsDateEntry,
      mostPoopsMonthEntry,
      avgPerDay,
      busiestHourFormatted,
      busiestHourCount,
      longestStreak,
      favoriteWeekdayEntry
    } = stats;
    
    return [
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
  }, [stats, snarkyComments, selectedYear]);

  // If there's no data for the selected year, show a message
  if (!stats) {
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

  const renderSlide = (slide: typeof slides[0] & { isSummary?: boolean }, index: number, isFullScreen: boolean) => (
    <CarouselItem
      key={index}
      data-slide-index={index}
      className={`relative flex flex-col items-center justify-center text-white ${slide.gradient} ${
        isFullScreen ? "min-h-screen" : "aspect-[9/16]"
      } overflow-hidden px-6 md:px-12`}
    >
      {/* Wrapper for screenshot capture */}
      <div 
        data-slide-content={index}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-12"
      >
        {/* Pre-text with fade entrance */}
        <motion.p
          className={`${isFullScreen ? "text-base md:text-lg" : "text-xs"} font-bold tracking-wide uppercase absolute ${
            isFullScreen ? "top-24 md:top-32" : "top-16"
          } opacity-80`}
          initial={{ opacity: 0, y: 20 }}
          animate={{
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
            animate={{
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
            animate={{ opacity: 1, y: 0 }}
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
              animate={{ opacity: 0.75 }}
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
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 3.3,
                ease: "easeOut",
              }}
              className={`mt-8 md:mt-12 grid grid-cols-1 gap-4 ${isFullScreen ? "text-base md:text-lg" : "text-xs"} text-left w-full max-w-md`}
            >
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="opacity-70">Total Poops:</span>
                <span className="font-bold">{stats?.totalPoops}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="opacity-70">Average per Day:</span>
                <span className="font-bold">{stats?.avgPerDay}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="opacity-70">Record Day:</span>
                <span className="font-bold">{stats?.mostPoopsDateEntry[0]}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="opacity-70">Peak Month:</span>
                <span className="font-bold">{stats?.mostPoopsMonthEntry[0]}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="opacity-70">Busiest Hour:</span>
                <span className="font-bold">{stats?.busiestHourFormatted}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="opacity-70">Longest Streak:</span>
                <span className="font-bold">{stats?.longestStreak} days</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="opacity-70">Favorite Day:</span>
                <span className="font-bold">{stats?.favoriteWeekdayEntry[0]}</span>
              </div>
            </motion.div>
          )}

          {/* Snarky comment with delayed fade */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{
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
      </div>

      {/* Tap zones for navigation in full-screen (outside screenshot area) */}
      {/* Top offset (top-16) prevents overlap with floating controls (share button and year selector) */}
      {isFullScreen && (
        <>
          <div
            className="absolute left-0 top-16 bottom-0 w-1/3 cursor-pointer z-10 group"
            onClick={() => {
              api?.scrollPrev();
              setLastManualChange(Date.now()); // Reset timer
            }}
            aria-label="Previous slide"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent page scroll
                api?.scrollPrev();
                setLastManualChange(Date.now());
              }
            }}
          >
            <div className="absolute inset-y-0 left-4 hidden md:flex items-center">
              <ChevronLeft
                className="h-8 w-8 text-white/70 opacity-0 group-hover:opacity-70 transition-opacity duration-200 pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <span className="sr-only">Previous slide</span>
          </div>
          <div
            className="absolute right-0 top-16 bottom-0 w-1/3 cursor-pointer z-10 group"
            onClick={() => {
              api?.scrollNext();
              setLastManualChange(Date.now()); // Reset timer
            }}
            aria-label="Next slide"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent page scroll
                api?.scrollNext();
                setLastManualChange(Date.now());
              }
            }}
          >
            <div className="absolute inset-y-0 right-4 hidden md:flex items-center justify-end">
              <ChevronRight
                className="h-8 w-8 text-white/70 opacity-0 group-hover:opacity-70 transition-opacity duration-200 pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <span className="sr-only">Next slide</span>
          </div>
        </>
      )}
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
              aria-label="Share current slide"
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
              aria-label="Close fullscreen view"
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
              <div 
                className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-50"
                role="tablist"
                aria-label="Carousel slides"
              >
                {Array.from({ length: count }).map((_, index) => {
                  const isActive = index === current;
                  return (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-current={isActive ? "true" : undefined}
                      aria-label={isActive ? `Slide ${index + 1} of ${count} (current)` : `Go to slide ${index + 1} of ${count}`}
                      onClick={() => api?.scrollTo(index)}
                      className={`h-2 sm:h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        isActive ? "bg-white w-6 sm:w-8" : "bg-white/40 w-2 sm:w-2.5"
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PoopWrapped;
