import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, LogOut, Plus, Grid, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { EventCard } from "@/components/events/EventCard";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

type Calendar = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  visibility: string;
  created_at: string;
};

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

const Calendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session && event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchUserCalendar();
      fetchEvents();
    }
  }, [user]);

  const fetchUserCalendar = async () => {
    try {
      // Get user's default calendar
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_calendar_id")
        .eq("user_id", user?.id)
        .single();

      if (profile?.default_calendar_id) {
        const { data: calendarData, error } = await supabase
          .from("calendars")
          .select("*")
          .eq("id", profile.default_calendar_id)
          .single();

        if (error) throw error;
        setCalendar(calendarData);
      }
    } catch (error: any) {
      console.error("Error fetching user calendar:", error);
      toast({
        title: "Error loading calendar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchEvents = async () => {
    try {
      if (!user) return;

      // Get user's default calendar ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_calendar_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.default_calendar_id) {
        const { data, error } = await supabase
          .from("events")
          .select(`
            *,
            attendees (
              id,
              email,
              name,
              response
            )
          `)
          .eq("calendar_id", profile.default_calendar_id)
          .order("start_at", { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_at);
      return isSameDay(eventDate, date);
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCreateDialog(true);
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfMonth(monthStart);
    const calendarEnd = endOfMonth(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-2 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition-smooth ${
                isCurrentMonth ? 'bg-surface' : 'bg-muted/30'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20 transition-smooth"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setShowEditDialog(true);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEventList = () => {
    return (
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card className="gradient-card border-border shadow-soft">
            <CardContent className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding events to your calendar
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onDeleted={fetchEvents}
              onEdit={(event) => {
                setSelectedEvent(event);
                setShowEditDialog(true);
              }}
            />
          ))
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Calendar not found</h2>
          <p className="text-muted-foreground mb-4">There was an issue loading your calendar.</p>
          <Button onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Schedura</h1>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <Button 
                variant="default" 
                className="gradient-hero"
              >
                Calendar
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-soft"
                style={{ backgroundColor: calendar.color + "20" }}
              >
                <CalendarIcon className="w-6 h-6" style={{ color: calendar.color }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">My Calendar</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    {events.length} event{events.length !== 1 ? 's' : ''}
                  </span>
                  {events.length > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {events.filter(e => new Date(e.start_at) >= new Date()).length} upcoming
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'grid' ? (
            <div className="space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentMonth(new Date());
                      setSelectedDate(new Date());
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    →
                  </Button>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <Card className="gradient-card border-border shadow-soft">
                <CardContent className="p-6">
                  {renderCalendarGrid()}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">All Events</h3>
              {renderEventList()}
            </div>
          )}
        </div>
      </main>

      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={fetchEvents}
        calendarId={calendar.id}
        selectedDate={selectedDate || undefined}
      />

      <EditEventDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdated={fetchEvents}
        event={selectedEvent}
      />
    </div>
  );
};

export default Calendar;
