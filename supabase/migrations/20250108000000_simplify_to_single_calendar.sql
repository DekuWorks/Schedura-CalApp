-- Simplify to single calendar per user
-- Remove the multiple calendars concept and make it a traditional calendar app

-- First, let's add a default_calendar_id to profiles
ALTER TABLE public.profiles ADD COLUMN default_calendar_id UUID REFERENCES public.calendars(id) ON DELETE CASCADE;

-- Update the handle_new_user function to create a single default calendar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  new_org_id UUID;
  new_calendar_id UUID;
  user_email TEXT;
  org_slug TEXT;
BEGIN
  -- Get user email
  user_email := NEW.email;
  
  -- Create slug from email (remove domain and special chars)
  org_slug := 'personal-' || REPLACE(SPLIT_PART(user_email, '@', 1), '.', '-') || '-' || substr(NEW.id::text, 1, 8);
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(user_email, '@', 1)))
  RETURNING id INTO new_profile_id;
  
  -- Create personal organisation
  INSERT INTO public.organisations (name, slug, owner_id, is_personal)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(user_email, '@', 1)) || '''s Space',
    org_slug,
    NEW.id,
    true
  )
  RETURNING id INTO new_org_id;
  
  -- Create membership for the user in their personal org
  INSERT INTO public.memberships (org_id, profile_id, role)
  VALUES (new_org_id, new_profile_id, 'owner');
  
  -- Create a single default calendar for the user
  INSERT INTO public.calendars (org_id, name, description, color, visibility, created_by)
  VALUES (
    new_org_id,
    'My Calendar',
    'Your personal calendar for events and appointments',
    '#7CC3FF',
    'private',
    NEW.id
  )
  RETURNING id INTO new_calendar_id;
  
  -- Update profile with default calendar reference
  UPDATE public.profiles 
  SET default_calendar_id = new_calendar_id
  WHERE id = new_profile_id;
  
  RETURN NEW;
END;
$$;

-- Create a function to get user's default calendar
CREATE OR REPLACE FUNCTION public.get_user_default_calendar(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calendar_id UUID;
BEGIN
  SELECT default_calendar_id INTO calendar_id
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  RETURN calendar_id;
END;
$$;

-- Update existing users to have a default calendar if they don't have one
DO $$
DECLARE
  user_record RECORD;
  org_record RECORD;
  calendar_record RECORD;
BEGIN
  -- For each user without a default calendar
  FOR user_record IN 
    SELECT p.user_id, p.id as profile_id
    FROM public.profiles p
    WHERE p.default_calendar_id IS NULL
  LOOP
    -- Get their personal organization
    SELECT o.id INTO org_record
    FROM public.organisations o
    WHERE o.owner_id = user_record.user_id AND o.is_personal = true
    LIMIT 1;
    
    -- Create default calendar if they don't have one
    INSERT INTO public.calendars (org_id, name, description, color, visibility, created_by)
    VALUES (
      org_record.id,
      'My Calendar',
      'Your personal calendar for events and appointments',
      '#7CC3FF',
      'private',
      user_record.user_id
    )
    RETURNING id INTO calendar_record;
    
    -- Update profile with default calendar
    UPDATE public.profiles 
    SET default_calendar_id = calendar_record.id
    WHERE id = user_record.profile_id;
  END LOOP;
END $$;
