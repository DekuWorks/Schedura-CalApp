import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  created_at: string;
  attendees?: Array<{
    id: string;
    email: string;
    name: string | null;
    response: string;
  }>;
};

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
  event: Event | null;
}

export const EditEventDialog = ({ 
  open, 
  onOpenChange, 
  onUpdated, 
  event 
}: EditEventDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    allDay: false,
    attendees: "",
  });

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start_at);
      const endDate = new Date(event.end_at);
      
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        startDate: startDate.toISOString().split('T')[0],
        startTime: event.all_day ? "09:00" : startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: event.all_day ? "10:00" : endDate.toTimeString().slice(0, 5),
        allDay: event.all_day,
        attendees: event.attendees?.map(a => a.email).join(', ') || "",
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    setLoading(true);

    try {
      // Create start and end timestamps
      const startAt = formData.allDay 
        ? new Date(formData.startDate + 'T00:00:00Z')
        : new Date(formData.startDate + 'T' + formData.startTime + ':00Z');
      
      const endAt = formData.allDay
        ? new Date(formData.endDate + 'T23:59:59Z')
        : new Date(formData.endDate + 'T' + formData.endTime + ':00Z');

      // Update the event
      const { error: eventError } = await supabase
        .from("events")
        .update({
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          all_day: formData.allDay,
        })
        .eq("id", event.id);

      if (eventError) throw eventError;

      // Handle attendees
      const attendeeEmails = formData.attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Remove existing attendees
      await supabase
        .from("attendees")
        .delete()
        .eq("event_id", event.id);

      // Add new attendees if any
      if (attendeeEmails.length > 0) {
        const attendeeData = attendeeEmails.map(email => ({
          event_id: event.id,
          email: email,
          name: email.split('@')[0],
        }));

        const { error: attendeeError } = await supabase
          .from("attendees")
          .insert(attendeeData);

        if (attendeeError) {
          console.warn("Failed to update attendees:", attendeeError);
        }
      }

      toast({
        title: "Event updated!",
        description: `${formData.title} has been updated successfully.`,
      });

      onOpenChange(false);
      onUpdated();
    } catch (error: any) {
      toast({
        title: "Error updating event",
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
      setFormData(prev => ({ ...prev, endDate: prev.startDate }));
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gradient-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Edit Event
          </DialogTitle>
          <DialogDescription>
            Update your event details
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
              {loading ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
