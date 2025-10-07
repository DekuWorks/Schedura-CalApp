import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const App = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/login");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session && event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
          <Calendar className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Schedura</h1>
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
          {/* Welcome Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-2 text-foreground">
              Welcome back!
            </h2>
            <p className="text-lg text-muted-foreground">
              Your Personal Space - organize your schedule, your way
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <QuickActionCard
              icon={<Calendar className="w-8 h-8 text-primary" />}
              title="My Calendars"
              description="View and manage all your calendars"
              onClick={() => navigate("/calendars")}
            />
            
            <QuickActionCard
              icon={<Plus className="w-8 h-8 text-primary" />}
              title="Create Event"
              description="Add a new event to your schedule"
              onClick={() => toast({ title: "Coming soon!", description: "Event creation is being built." })}
              highlighted
            />
            
            <QuickActionCard
              icon={<Calendar className="w-8 h-8 text-primary" />}
              title="Upcoming Events"
              description="See what's coming up next"
              onClick={() => toast({ title: "Coming soon!", description: "Event list is being built." })}
            />
          </div>

          {/* Placeholder for upcoming features */}
          <div className="gradient-card rounded-2xl p-12 text-center border border-border shadow-soft">
            <Calendar className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              Your calendar awaits
            </h3>
            <p className="text-muted-foreground mb-6">
              Start creating calendars and events to organize your time beautifully
            </p>
            <Button 
              className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
              onClick={() => toast({ title: "Coming soon!", description: "Full calendar features are being built." })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Calendar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

const QuickActionCard = ({ 
  icon, 
  title, 
  description,
  onClick,
  highlighted = false
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  onClick: () => void;
  highlighted?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`${
      highlighted ? 'gradient-hero' : 'gradient-card'
    } p-6 rounded-2xl border border-border shadow-soft hover:shadow-medium transition-smooth text-left group`}
  >
    <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h4 className="text-xl font-bold mb-2 text-foreground">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </button>
);

export default App;
