import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, LogOut, Plus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarData {
  id: string;
  name: string;
  description: string | null;
  color: string;
  visibility: string;
  created_at: string;
}

interface Organisation {
  id: string;
  name: string;
  is_personal: boolean;
}

const Calendars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  
  // New calendar form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState("");
  const [newCalendarDescription, setNewCalendarDescription] = useState("");
  const [newCalendarColor, setNewCalendarColor] = useState("#7CC3FF");
  const [newCalendarVisibility, setNewCalendarVisibility] = useState("team");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchOrganisations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedOrg) {
      fetchCalendars();
    }
  }, [selectedOrg]);

  const fetchOrganisations = async () => {
    const { data, error } = await supabase
      .from("organisations")
      .select("*")
      .order("is_personal", { ascending: false });

    if (error) {
      toast({
        title: "Error loading organisations",
        description: error.message,
        variant: "destructive",
      });
    } else if (data && data.length > 0) {
      setOrganisations(data);
      setSelectedOrg(data[0].id);
    }
  };

  const fetchCalendars = async () => {
    const { data, error } = await supabase
      .from("calendars")
      .select("*")
      .eq("org_id", selectedOrg)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading calendars",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCalendars(data || []);
    }
  };

  const handleCreateCalendar = async () => {
    if (!newCalendarName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a calendar name",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("calendars")
      .insert([{
        org_id: selectedOrg,
        name: newCalendarName,
        description: newCalendarDescription || null,
        color: newCalendarColor,
        visibility: newCalendarVisibility as "private" | "team" | "public",
        created_by: user?.id!,
      }]);

    if (error) {
      toast({
        title: "Error creating calendar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Calendar created!",
        description: `${newCalendarName} has been created successfully.`,
      });
      setIsDialogOpen(false);
      setNewCalendarName("");
      setNewCalendarDescription("");
      setNewCalendarColor("#7CC3FF");
      setNewCalendarVisibility("team");
      fetchCalendars();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Calendar className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const currentOrg = organisations.find(o => o.id === selectedOrg);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/app")}>
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Schedura</h1>
            </div>
            {organisations.length > 1 && (
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organisations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {currentOrg?.name} Calendars
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your calendars and organize your schedule
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-hero shadow-soft hover:shadow-medium transition-smooth">
                  <Plus className="w-4 h-4 mr-2" />
                  New Calendar
                </Button>
              </DialogTrigger>
              <DialogContent className="gradient-card">
                <DialogHeader>
                  <DialogTitle>Create New Calendar</DialogTitle>
                  <DialogDescription>
                    Add a new calendar to organize your events
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Calendar Name</Label>
                    <Input
                      id="name"
                      placeholder="Work, Personal, etc."
                      value={newCalendarName}
                      onChange={(e) => setNewCalendarName(e.target.value)}
                      className="bg-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Calendar description"
                      value={newCalendarDescription}
                      onChange={(e) => setNewCalendarDescription(e.target.value)}
                      className="bg-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={newCalendarColor}
                        onChange={(e) => setNewCalendarColor(e.target.value)}
                        className="w-20 h-10 bg-surface"
                      />
                      <Input
                        value={newCalendarColor}
                        onChange={(e) => setNewCalendarColor(e.target.value)}
                        placeholder="#7CC3FF"
                        className="flex-1 bg-surface"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={newCalendarVisibility} onValueChange={setNewCalendarVisibility}>
                      <SelectTrigger className="bg-surface">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleCreateCalendar}
                  className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
                >
                  Create Calendar
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          {calendars.length === 0 ? (
            <div className="gradient-card rounded-2xl p-12 text-center border border-border shadow-soft">
              <Calendar className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2 text-foreground">
                No calendars yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first calendar to start organizing events
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gradient-hero shadow-soft hover:shadow-medium transition-smooth"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Calendar
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendars.map((calendar) => (
                <Card
                  key={calendar.id}
                  className="gradient-card border-border shadow-soft hover:shadow-medium transition-smooth cursor-pointer"
                  onClick={() => navigate(`/calendars/${calendar.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: calendar.color }}
                        />
                        <CardTitle className="text-xl">{calendar.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({ title: "Coming soon!", description: "Calendar settings" });
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    {calendar.description && (
                      <CardDescription>{calendar.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="capitalize">{calendar.visibility}</span>
                      <span>{new Date(calendar.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendars;