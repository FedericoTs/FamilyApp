import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { FamilyMember } from "@/types/profile";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  format,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  parseISO,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  X,
  Clock,
  MapPin,
  Users,
  Calendar as CalendarLucide,
  Loader2,
} from "lucide-react";

interface FamilyCalendarProps {
  familyMembers: FamilyMember[];
}

interface Event {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  description?: string;
  category: "family" | "school" | "activity" | "appointment" | "other";
  attendees: string[];
}

interface DbEvent {
  id: string;
  profile_id: string;
  title: string;
  event_date: string;
  event_time?: string;
  location?: string;
  description?: string;
  category: "family" | "school" | "activity" | "appointment" | "other";
  attendees: string[];
  created_at: string;
  updated_at: string;
}

const FamilyCalendar: React.FC<FamilyCalendarProps> = ({
  familyMembers = [],
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    date: new Date(),
    category: "family",
    attendees: [],
  });

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  // Get events for the selected month
  const getEventsForMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => ({
      date: day,
      events: events.filter((event) => isSameDay(event.date, day)),
    }));
  };

  const monthEvents = getEventsForMonth(date);
  const selectedDateEvents = getEventsForDate(date);

  // Load events from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("family_events")
          .select("*")
          .eq("profile_id", user.id);

        if (error) throw error;

        // Convert database events to the Event format used by the component
        const formattedEvents: Event[] = data.map((dbEvent: DbEvent) => ({
          id: dbEvent.id,
          title: dbEvent.title,
          date: parseISO(dbEvent.event_date),
          time: dbEvent.event_time,
          location: dbEvent.location,
          description: dbEvent.description,
          category: dbEvent.category,
          attendees: dbEvent.attendees || [],
        }));

        setEvents(formattedEvents);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error loading events",
          description: "Failed to load your calendar events.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Set up realtime subscription
    const subscription = supabase
      .channel("family_events_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_events",
          filter: `profile_id=eq.${user.id}`,
        },
        fetchEvents,
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

  const handleAddEvent = async () => {
    if (!user || !newEvent.title || !newEvent.date) return;

    setLoading(true);

    try {
      const eventData = {
        profile_id: user.id,
        title: newEvent.title,
        event_date: newEvent.date.toISOString(),
        event_time: newEvent.time,
        location: newEvent.location,
        description: newEvent.description,
        category:
          (newEvent.category as
            | "family"
            | "school"
            | "activity"
            | "appointment"
            | "other") || "other",
        attendees: newEvent.attendees || [],
      };

      if (newEvent.id) {
        // Update existing event
        const { error } = await supabase
          .from("family_events")
          .update(eventData)
          .eq("id", newEvent.id);

        if (error) throw error;

        toast({
          title: "Event updated",
          description: "Your event has been updated successfully.",
        });
      } else {
        // Add new event
        const { error } = await supabase
          .from("family_events")
          .insert(eventData);

        if (error) throw error;

        toast({
          title: "Event added",
          description: "Your new event has been added to the calendar.",
        });
      }

      // Reset form
      setNewEvent({
        date: new Date(),
        category: "family",
        attendees: [],
      });
      setIsAddEventOpen(false);
    } catch (err: any) {
      console.error("Error saving event:", err);
      toast({
        variant: "destructive",
        title: "Error saving event",
        description: err.message || "Failed to save your event.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("family_events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSelectedEvent(null);
      setIsViewEventOpen(false);

      toast({
        title: "Event deleted",
        description: "The event has been removed from your calendar.",
      });
    } catch (err: any) {
      console.error("Error deleting event:", err);
      toast({
        variant: "destructive",
        title: "Error deleting event",
        description: err.message || "Failed to delete the event.",
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setNewEvent(event);
    setIsAddEventOpen(true);
    setIsViewEventOpen(false);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "family":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "school":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "activity":
        return "bg-green-100 text-green-800 border-green-200";
      case "appointment":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAttendeeToggle = (name: string) => {
    const currentAttendees = newEvent.attendees || [];
    if (currentAttendees.includes(name)) {
      setNewEvent({
        ...newEvent,
        attendees: currentAttendees.filter((attendee) => attendee !== name),
      });
    } else {
      setNewEvent({
        ...newEvent,
        attendees: [...currentAttendees, name],
      });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      {loading && events.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2">Loading your calendar...</span>
        </div>
      )}

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-purple-700 flex items-center">
          <CalendarLucide className="mr-2 h-6 w-6" />
          Family Calendar
        </h2>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {newEvent.id ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEvent.date ? (
                        format(newEvent.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEvent.date}
                      onSelect={(date) =>
                        date && setNewEvent({ ...newEvent, date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time (optional)</Label>
                <Input
                  id="time"
                  value={newEvent.time || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  placeholder="e.g. 3:00 PM"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={newEvent.location || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  placeholder="Enter location"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, category: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Attendees</Label>
                <div className="flex flex-wrap gap-2">
                  {["Mom", "Dad", ...familyMembers.map((m) => m.name)].map(
                    (name, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`cursor-pointer ${(newEvent.attendees || []).includes(name) ? getCategoryColor((newEvent.category as string) || "family") : ""}`}
                        onClick={() => handleAttendeeToggle(name)}
                      >
                        {name}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Add any additional details"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddEventOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEvent}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {newEvent.id ? "Updating..." : "Adding..."}
                  </>
                ) : newEvent.id ? (
                  "Update Event"
                ) : (
                  "Add Event"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-medium">
                {format(date, "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
                {monthEvents.map(({ date: day, events }) => {
                  const dayEvents = events.length;
                  const isCurrentMonth = isSameMonth(day, date);
                  return (
                    <div
                      key={day.toString()}
                      className={`min-h-[80px] p-1 border rounded-md ${isToday(day) ? "bg-purple-50 border-purple-200" : isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"} ${dayEvents > 0 ? "cursor-pointer" : ""}`}
                      onClick={() => setDate(day)}
                    >
                      <div className="text-right p-1">
                        <span
                          className={`text-sm ${isToday(day) ? "font-bold text-purple-700" : ""}`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                      {dayEvents > 0 && (
                        <div className="mt-1">
                          {events
                            .filter((event) => isSameDay(event.date, day))
                            .slice(0, 2)
                            .map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 mb-1 rounded truncate ${getCategoryColor(event.category)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                          {dayEvents > 2 && (
                            <div className="text-xs text-center text-gray-500">
                              +{dayEvents - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-medium">
                {format(date, "EEEE, MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarLucide className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No events scheduled
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add an event to get started.
                  </p>
                  <Button
                    onClick={() => setIsAddEventOpen(true)}
                    className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewEvent(event)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      {event.time && (
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.attendees.length > 0 && (
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>{event.attendees.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Event Dialog */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedEvent.title}</span>
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {selectedEvent.category}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {format(selectedEvent.date, "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  {selectedEvent.time && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{selectedEvent.time}</span>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.attendees.length > 0 && (
                    <div className="flex items-start">
                      <Users className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <div className="mb-1">Attendees:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedEvent.attendees.map((attendee, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={getCategoryColor(
                                selectedEvent.category,
                              )}
                            >
                              {attendee}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedEvent.description && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-600">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={() => handleEditEvent(selectedEvent)}
                >
                  Edit
                </Button>
                <Button onClick={() => setIsViewEventOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilyCalendar;
