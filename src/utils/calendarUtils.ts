import { supabase } from "@/integrations/supabase/client";

export const createSimpleCalendar = async (userId: string) => {
  try {
    // Create a simple calendar without complex organization structure
    const { data, error } = await supabase
      .from("calendars")
      .insert([{
        name: "My Calendar",
        description: "Your personal calendar for events and appointments",
        color: "#7CC3FF",
        visibility: "private",
        created_by: userId,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating simple calendar:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception creating simple calendar:", error);
    return null;
  }
};

export const getUserCalendars = async (userId: string) => {
  try {
    // Try multiple approaches to get user calendars
    let calendars = [];

    // Approach 1: Get calendars created by user
    const { data: createdCalendars, error: createdError } = await supabase
      .from("calendars")
      .select("*")
      .eq("created_by", userId)
      .limit(5);

    if (!createdError && createdCalendars) {
      calendars = [...calendars, ...createdCalendars];
    }

    // Approach 2: Get calendars through profile membership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profile) {
      const { data: memberships } = await supabase
        .from("memberships")
        .select(`
          organisations!inner (
            calendars (*)
          )
        `)
        .eq("profile_id", profile.id);

      if (memberships) {
        memberships.forEach((membership: any) => {
          if (membership.organisations?.calendars) {
            calendars = [...calendars, ...membership.organisations.calendars];
          }
        });
      }
    }

    // Remove duplicates based on ID
    const uniqueCalendars = calendars.filter((calendar, index, self) => 
      index === self.findIndex(c => c.id === calendar.id)
    );

    return uniqueCalendars;
  } catch (error) {
    console.error("Error getting user calendars:", error);
    return [];
  }
};
