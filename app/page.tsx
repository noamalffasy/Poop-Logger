"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUploadArea from "@/components/ui/FileUploadArea";
import { ModeToggle } from "@/components/ui/theme-toggle";
import WeekdayChartCard from "@/components/ui/WeekdayChartCard";
import WeekSelection from "@/components/ui/WeekSelection";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const data = useAppSelector((state) => state.data.data);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] mb-6 text-center">
          Poop Logger
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Poop Log</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArea />
          </CardContent>
        </Card>

        {data && (
          <div className="flex w-full gap-8">
            <WeekdayChartCard />
            <WeekSelection />
          </div>
        )}
      </div>
    </div>
  );
}
