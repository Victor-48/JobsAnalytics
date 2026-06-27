import React, { useState } from "react";
import { format, subDays, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined;
    onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ className, date, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    {
      label: "Last 30 Days",
      getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }),
    },
    {
      label: "Last 90 Days",
      getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }),
    },
    {
      label: "This Year",
      getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
    },
    {
      label: "Last Year",
      getValue: () => ({ 
        from: startOfYear(subDays(startOfYear(new Date()), 1)), 
        to: endOfYear(subDays(startOfYear(new Date()), 1)) 
      }),
    }
  ];

  const handlePresetClick = (preset: { label: string, getValue: () => DateRange }) => {
    onDateChange(preset.getValue());
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-between text-left font-normal border-border bg-card/80 backdrop-blur-sm hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm rounded-lg",
              !date && "text-muted-foreground"
            )}
          >
            <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary/70" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(
          "w-auto p-0 rounded-xl shadow-2xl border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden ring-1 ring-primary/5 transition-opacity duration-300",
          (date?.from && date?.to) && "opacity-50"
        )} align="end">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="flex flex-col p-3 gap-1.5 bg-muted/30 min-w-[150px]">
                <div className="text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-widest px-2">Quick Presets</div>
                {presets.map((preset) => (
                    <Button 
                        key={preset.label} 
                        variant="ghost" 
                        className="justify-start text-sm hover:bg-primary/10 hover:text-primary rounded-md px-3 py-2 h-auto font-medium transition-colors"
                        onClick={() => handlePresetClick(preset)}
                    >
                        {preset.label}
                    </Button>
                ))}
            </div>
            <div className="p-3">
                <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={onDateChange}
                    numberOfMonths={2}
                    className="rounded-md"
                />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}