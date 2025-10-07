import { supabase } from "@/integrations/supabase/client";

// Ultra-simple calendar creation that bypasses all complex organization logic
export const createUltraSimpleCalendar = async (userId: string) => {
  try {
    console.log("Creating ultra-simple calendar for user:", userId);
    
    // Try the most basic calendar creation possible
    const calendarData = {
      name: "My Calendar",
      description: "Your personal calendar",
      color: "#7CC3FF",
      visibility: "private",
      created_by: userId,
    };

    console.log("Attempting to create calendar with data:", calendarData);

    const { data, error } = await supabase
      .from("calendars")
      .insert([calendarData])
      .select()
      .single();

    if (error) {
      console.error("Database error creating calendar:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log("Successfully created ultra-simple calendar:", data);
    return data;
  } catch (error) {
    console.error("Exception creating ultra-simple calendar:", error);
    return null;
  }
};

// Ultra-simple calendar fetching
export const getUltraSimpleCalendars = async (userId: string) => {
  try {
    console.log("Getting ultra-simple calendars for user:", userId);
    
    // Try the most basic query possible
    const { data, error } = await supabase
      .from("calendars")
      .select("*")
      .eq("created_by", userId);

    if (error) {
      console.error("Database error getting calendars:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    console.log("Found calendars:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Exception getting calendars:", error);
    return [];
  }
};
