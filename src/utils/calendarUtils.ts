import { supabase } from "@/integrations/supabase/client";

export const createSimpleCalendar = async (userId: string) => {
  try {
    console.log("Creating calendar for user:", userId);
    
    // First, let's try to get the user's personal organization
    const { data: orgs, error: orgError } = await supabase
      .from("organisations")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_personal", true)
      .single();

    console.log("Personal org result:", { orgs, orgError });

    let calendarData: any = {
      name: "My Calendar",
      description: "Your personal calendar for events and appointments",
      color: "#7CC3FF",
      visibility: "private",
      created_by: userId,
    };

    // Add org_id if we have one
    if (orgs?.id) {
      calendarData.org_id = orgs.id;
    }

    const { data, error } = await supabase
      .from("calendars")
      .insert([calendarData])
      .select()
      .single();

    if (error) {
      console.error("Error creating calendar:", error);
      console.error("Calendar data attempted:", calendarData);
      return null;
    }

    console.log("Successfully created calendar:", data);
    return data;
  } catch (error) {
    console.error("Exception creating simple calendar:", error);
    return null;
  }
};

export const getUserCalendars = async (userId: string) => {
  try {
    console.log("Getting calendars for user:", userId);
    let calendars = [];

    // Approach 1: Get calendars created by user
    console.log("Trying to get calendars created by user...");
    const { data: createdCalendars, error: createdError } = await supabase
      .from("calendars")
      .select("*")
      .eq("created_by", userId)
      .limit(5);

    console.log("Created calendars result:", { createdCalendars, createdError });

    if (!createdError && createdCalendars) {
      calendars = [...calendars, ...createdCalendars];
      console.log("Found calendars by created_by:", createdCalendars.length);
    }

    // Approach 2: Get calendars through profile membership (only if no calendars found)
    if (calendars.length === 0) {
      console.log("No calendars found by created_by, trying membership approach...");
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      console.log("Profile result:", { profile, profileError });

      if (profile && !profileError) {
        const { data: memberships, error: membershipError } = await supabase
          .from("memberships")
          .select(`
            organisations!inner (
              calendars (*)
            )
          `)
          .eq("profile_id", profile.id);

        console.log("Memberships result:", { memberships, membershipError });

        if (memberships && !membershipError) {
          memberships.forEach((membership: any) => {
            if (membership.organisations?.calendars) {
              calendars = [...calendars, ...membership.organisations.calendars];
            }
          });
          console.log("Found calendars through membership:", calendars.length);
        }
      }
    }

    // Remove duplicates based on ID
    const uniqueCalendars = calendars.filter((calendar, index, self) => 
      index === self.findIndex(c => c.id === calendar.id)
    );

    console.log("Final unique calendars:", uniqueCalendars.length);
    return uniqueCalendars;
  } catch (error) {
    console.error("Error getting user calendars:", error);
    return [];
  }
};

