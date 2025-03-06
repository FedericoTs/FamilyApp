import React, { useState } from "react";
import { Filter, MapPin, Clock, Baby } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface FilterPanelProps {
  isOpen?: boolean;
  onFilterChange?: (filters: FilterOptions) => void;
}

interface FilterOptions {
  locationTypes: string[];
  distance: number;
  ageRanges: string[];
}

const FilterPanel = ({ isOpen = true, onFilterChange }: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    locationTypes: [],
    distance: 1,
    ageRanges: [],
  });

  const [isPanelOpen, setIsPanelOpen] = useState(isOpen);

  const locationTypeOptions = [
    { id: "parks", label: "Parks" },
    { id: "playgrounds", label: "Playgrounds" },
    { id: "restaurants", label: "Kid-Friendly Restaurants" },
    { id: "museums", label: "Children's Museums" },
    { id: "libraries", label: "Libraries" },
    { id: "activities", label: "Indoor Activities" },
  ];

  const ageRangeOptions = [
    { id: "toddler", label: "Toddler (0-3)" },
    { id: "preschool", label: "Preschool (3-5)" },
    { id: "elementary", label: "Elementary (6-10)" },
    { id: "preteen", label: "Preteen (11-12)" },
    { id: "teen", label: "Teen (13+)" },
  ];

  const handleLocationTypeChange = (
    checked: boolean | "indeterminate",
    type: string,
  ) => {
    let updatedTypes = [...filters.locationTypes];

    if (checked) {
      if (!updatedTypes.includes(type)) {
        updatedTypes.push(type);
      }
    } else {
      updatedTypes = updatedTypes.filter((t) => t !== type);
    }

    const updatedFilters = { ...filters, locationTypes: updatedTypes };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleAgeRangeChange = (
    checked: boolean | "indeterminate",
    range: string,
  ) => {
    let updatedRanges = [...filters.ageRanges];

    if (checked) {
      if (!updatedRanges.includes(range)) {
        updatedRanges.push(range);
      }
    } else {
      updatedRanges = updatedRanges.filter((r) => r !== range);
    }

    const updatedFilters = { ...filters, ageRanges: updatedRanges };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleDistanceChange = (value: number[]) => {
    const updatedFilters = { ...filters, distance: value[0] };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      locationTypes: [],
      distance: 1,
      ageRanges: [],
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-[300px] overflow-auto border border-gray-200 max-h-full">
      <Collapsible open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-pink-50">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-purple-800">Filters</h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">
                {isPanelOpen ? "Close" : "Open"} filters
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${isPanelOpen ? "rotate-180" : ""} transition-transform duration-200`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="location-type">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Location Type</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-6 pt-2">
                    {locationTypeOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`location-${option.id}`}
                          checked={filters.locationTypes.includes(option.label)}
                          onCheckedChange={(checked) =>
                            handleLocationTypeChange(checked, option.label)
                          }
                        />
                        <label
                          htmlFor={`location-${option.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="distance">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Distance</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-6 pt-2">
                    <div className="pb-4">
                      <Slider
                        defaultValue={[filters.distance]}
                        max={2}
                        step={0.1}
                        onValueChange={handleDistanceChange}
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>0 km</span>
                        <span>{filters.distance.toFixed(1)} km</span>
                        <span>2 km</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="age-range">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Baby className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Age Appropriateness</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-6 pt-2">
                    {ageRangeOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`age-${option.id}`}
                          checked={filters.ageRanges.includes(option.label)}
                          onCheckedChange={(checked) =>
                            handleAgeRangeChange(checked, option.label)
                          }
                        />
                        <label
                          htmlFor={`age-${option.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FilterPanel;
