import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Tag, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EVENT_CATEGORIES, getCategoryColorWithCustom, setCustomCategoryColor } from "@/config/categories";
import { TIMEZONES, getUserTimezone } from "@/config/timezones";
import { ColorPicker } from "@/components/ui/color-picker";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  calendarId: string;
  selectedDate?: Date;
}

export const CreateEventDialog = ({ 
  open, 
  onOpenChange, 
  onCreated, 
  calendarId,
  selectedDate 
}: CreateEventDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
    startTime: "09:00",
    endDate: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
    endTime: "10:00",
    allDay: false,
    attendees: "",
    category: "personal",
    timezone: getUserTimezone(),
    categoryColor: getCategoryColorWithCustom("personal"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get calendar info to get org_id
      const { data: calendar, error: calendarError } = await supabase
        .from("calendars")
        .select("org_id")
        .eq("id", calendarId)
        .single();

      if (calendarError) throw calendarError;

      // Parse attendees
      const attendeeEmails = formData.attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Create start and end timestamps
      const startAt = formData.allDay 
        ? new Date(formData.startDate + 'T00:00:00Z')
        : new Date(formData.startDate + 'T' + formData.startTime + ':00Z');
      
      const endAt = formData.allDay
        ? new Date(formData.endDate + 'T23:59:59Z')
        : new Date(formData.endDate + 'T' + formData.endTime + ':00Z');

      // Create the event
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert([{
          org_id: calendar.org_id,
          calendar_id: calendarId,
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          all_day: formData.allDay,
          category: formData.category,
          timezone: formData.timezone,
          created_by: user.id,
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Add attendees if any
      if (attendeeEmails.length > 0) {
        const attendeeData = attendeeEmails.map(email => ({
          event_id: event.id,
          email: email,
          name: email.split('@')[0], // Use email prefix as name
        }));

        const { error: attendeeError } = await supabase
          .from("attendees")
          .insert(attendeeData);

        if (attendeeError) {
          console.warn("Failed to add attendees:", attendeeError);
        }
      }

      toast({
        title: "Event created!",
        description: `${formData.title} has been added to your calendar.`,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "10:00",
        allDay: false,
        attendees: "",
        category: "personal",
        timezone: getUserTimezone(),
        categoryColor: getCategoryColorWithCustom("personal"),
      });
      
      onOpenChange(false);
      onCreated();
    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAllDayChange = (checked: boolean) => {
    setFormData({ ...formData, allDay: checked });
    if (checked) {
      // If all day, set end date to same as start date
      setFormData(prev => ({ ...prev, endDate: prev.startDate }));
    }
  };

  const handleCategoryChange = (category: string) => {
    const color = getCategoryColorWithCustom(category);
    setFormData({ ...formData, category, categoryColor: color });
  };

  const handleCategoryColorChange = (color: string) => {
    setCustomCategoryColor(formData.category, color);
    setFormData({ ...formData, categoryColor: color });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gradient-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Add a new event to your calendar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Team Meeting, Doctor Appointment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this event..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-surface resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Conference Room A, Zoom Meeting"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-surface pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-surface pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                  <SelectTrigger className="bg-surface pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {TIMEZONES.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{timezone.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{timezone.offset}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryColor">Category Color</Label>
            <ColorPicker
              value={formData.categoryColor}
              onChange={handleCategoryColorChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={formData.allDay}
              onCheckedChange={handleAllDayChange}
            />
            <Label htmlFor="allDay">All day event</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="bg-surface"
              />
            </div>

            {!formData.allDay && (
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-surface"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="bg-surface"
              />
            </div>

            {!formData.allDay && (
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-surface"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="attendees"
                placeholder="email1@example.com, email2@example.com"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                className="bg-surface pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Separate multiple email addresses with commas
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-hero shadow-soft hover:shadow-medium transition-smooth"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
