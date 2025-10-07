import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Tag, Globe } from "lucide-react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCategoryByValue } from "@/config/categories";
import { getTimezoneByValue } from "@/config/timezones";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  category?: string;
  timezone?: string;
  created_at: string;
  attendees?: Array<{
    id: string;
    email: string;
    name: string | null;
    response: string;
  }>;
};

interface EventCardProps {
  event: Event;
  onDeleted: () => void;
  onEdit?: (event: Event) => void;
}

export const EventCard = ({ event, onDeleted, onEdit }: EventCardProps) => {
  const { toast } = useToast();

  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);
  
  const formatDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDateTime = () => {
    if (event.all_day) {
      if (startDate.toDateString() === endDate.toDateString()) {
        return formatDate(startDate);
      }
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return `${formatDate(startDate)} • ${formatTime(startDate)} - ${formatTime(endDate)}`;
    }
    
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: `${event.title} has been deleted.`,
      });

      onDeleted();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAttendeeStatus = () => {
    if (!event.attendees || event.attendees.length === 0) return null;
    
    const accepted = event.attendees.filter(a => a.response === 'accepted').length;
    const total = event.attendees.length;
    
    return `${accepted}/${total} accepted`;
  };

  return (
    <Card className="gradient-card border-border shadow-soft hover:shadow-medium transition-smooth group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-smooth line-clamp-1">
              {event.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              <span>{formatDateTime()}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {event.all_day && (
              <Badge variant="secondary" className="text-xs">
                All Day
              </Badge>
            )}
            {event.category && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: getCategoryByValue(event.category)?.color + '40',
                  color: getCategoryByValue(event.category)?.color 
                }}
              >
                <span className="mr-1">{getCategoryByValue(event.category)?.icon}</span>
                {getCategoryByValue(event.category)?.label}
              </Badge>
            )}
            {getAttendeeStatus() && (
              <Badge variant="outline" className="text-xs">
                {getAttendeeStatus()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}

        {event.timezone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>{getTimezoneByValue(event.timezone)?.label}</span>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(event)}
              className="flex-1 hover:bg-primary/10 transition-smooth"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="gradient-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete event?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{event.title}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
