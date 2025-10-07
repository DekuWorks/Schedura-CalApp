import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, LogOut, Plus, Grid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCalendarDialog } from "@/components/calendars/CreateCalendarDialog";
import { CalendarCard } from "@/components/calendars/CalendarCard";

type Calendar = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  visibility: string;
  created_at: string;
};

const Calendars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
      fetchCalendars();
    }
  }, [user]);

  const fetchCalendars = async () => {
    try {
      const { data, error } = await supabase
        .from("calendars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCalendars(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading calendars",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading calendars...</p>
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
            <button onClick={() => navigate("/app")} className="flex items-center gap-2 hover:opacity-80 transition-smooth">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Schedura</h1>
            </button>
            <nav className="hidden md:flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/app")}
                className="hover:bg-primary/10"
              >
                Dashboard
              </Button>
              <Button 
                variant="default" 
                className="gradient-hero"
              >
                <Grid className="w-4 h-4 mr-2" />
                Calendars
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
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">My Calendars</h2>
              <p className="text-lg text-muted-foreground">
                Organize your time with beautiful calendars
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Calendar
            </Button>
          </div>

          {/* Calendars Grid */}
          {calendars.length === 0 ? (
            <Card className="gradient-card border-border shadow-soft">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">No calendars yet</CardTitle>
                <CardDescription className="text-base">
                  Create your first calendar to start organizing your schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Calendar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendars.map((calendar) => (
                <CalendarCard
                  key={calendar.id}
                  calendar={calendar}
                  onDeleted={fetchCalendars}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateCalendarDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={fetchCalendars}
      />
    </div>
  );
};

export default Calendars;