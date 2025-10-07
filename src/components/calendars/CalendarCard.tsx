import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Users, Lock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

type Calendar = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  visibility: string;
  created_at: string;
};

interface CalendarCardProps {
  calendar: Calendar;
  onDeleted: () => void;
}

export const CalendarCard = ({ calendar, onDeleted }: CalendarCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const visibilityIcon = {
    private: <Lock className="w-4 h-4" />,
    team: <Users className="w-4 h-4" />,
    public: <Eye className="w-4 h-4" />,
  }[calendar.visibility];

  const visibilityLabel = {
    private: "Private",
    team: "Team",
    public: "Public",
  }[calendar.visibility];

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("calendars").delete().eq("id", calendar.id);

      if (error) throw error;

      toast({
        title: "Calendar deleted",
        description: `${calendar.name} has been deleted.`,
      });

      onDeleted();
    } catch (error: any) {
      toast({
        title: "Error deleting calendar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="gradient-card border-border shadow-soft hover:shadow-medium transition-smooth group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-soft"
              style={{ backgroundColor: calendar.color + "20" }}
            >
              <Calendar className="w-6 h-6" style={{ color: calendar.color }} />
            </div>
            <div>
              <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                {calendar.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                {visibilityIcon}
                <span>{visibilityLabel}</span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {calendar.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{calendar.description}</p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/calendars/${calendar.id}`)}
            className="flex-1 gradient-hero shadow-soft hover:shadow-medium transition-smooth"
          >
            View Calendar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="gradient-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete calendar?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{calendar.name}" and all its events. This action cannot be undone.
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