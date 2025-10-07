import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const colorOptions = [
  { value: "#7CC3FF", label: "Sky Blue" },
  { value: "#FF7C7C", label: "Coral" },
  { value: "#7CFF7C", label: "Mint" },
  { value: "#FFD700", label: "Gold" },
  { value: "#FF69B4", label: "Pink" },
  { value: "#9370DB", label: "Purple" },
];

interface CreateCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export const CreateCalendarDialog = ({ open, onOpenChange, onCreated }: CreateCalendarDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#7CC3FF",
    visibility: "team",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's personal organisation
      const { data: orgs, error: orgError } = await supabase
        .from("organisations")
        .select("id")
        .eq("owner_id", user.id)
        .eq("is_personal", true)
        .single();

      if (orgError) throw orgError;

      const { error } = await supabase.from("calendars").insert([{
        name: formData.name,
        description: formData.description || null,
        color: formData.color,
        visibility: formData.visibility as "private" | "team" | "public",
        org_id: orgs.id,
        created_by: user.id,
      }]);

      if (error) throw error;

      toast({
        title: "Calendar created!",
        description: `${formData.name} has been created successfully.`,
      });

      setFormData({ name: "", description: "", color: "#7CC3FF", visibility: "team" });
      onOpenChange(false);
      onCreated();
    } catch (error: any) {
      toast({
        title: "Error creating calendar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Calendar</DialogTitle>
          <DialogDescription>
            Add a new calendar to organize your schedule
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Calendar Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Work, Personal, Fitness"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this calendar for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-surface resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger className="bg-surface">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.color }} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: option.value }} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
              <SelectTrigger className="bg-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (only you)</SelectItem>
                <SelectItem value="team">Team (workspace members)</SelectItem>
                <SelectItem value="public">Public (anyone with link)</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Creating..." : "Create Calendar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};