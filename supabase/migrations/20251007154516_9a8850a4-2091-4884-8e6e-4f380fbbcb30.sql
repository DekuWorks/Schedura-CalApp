-- Create enum types
CREATE TYPE public.organisation_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE public.calendar_visibility AS ENUM ('private', 'team', 'public');
CREATE TYPE public.attendee_response AS ENUM ('pending', 'accepted', 'declined', 'tentative');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Organisations table (both Personal Spaces and Workspaces)
CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_personal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Memberships table
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.organisation_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, profile_id)
);

-- Calendars table
CREATE TABLE public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#7CC3FF',
  visibility public.calendar_visibility NOT NULL DEFAULT 'team',
  public_id TEXT UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  rrule TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendees table
CREATE TABLE public.attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  response public.attendee_response NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.organisation_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  status public.invite_status NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Organisations RLS Policies
CREATE POLICY "Users can view their organisations"
  ON public.organisations FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = organisations.id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organisations"
  ON public.organisations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their organisations"
  ON public.organisations FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their organisations"
  ON public.organisations FOR DELETE
  USING (auth.uid() = owner_id);

-- Memberships RLS Policies
CREATE POLICY "Users can view memberships in their organisations"
  ON public.memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.organisations o
      WHERE o.id = org_id AND o.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.memberships m2
      INNER JOIN public.profiles p ON p.id = m2.profile_id
      WHERE m2.org_id = memberships.org_id 
      AND p.user_id = auth.uid()
      AND m2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can insert memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organisations o
      WHERE o.id = org_id AND o.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = memberships.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete memberships"
  ON public.memberships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organisations o
      WHERE o.id = org_id AND o.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = memberships.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- Calendars RLS Policies
CREATE POLICY "Users can view calendars in their organisations"
  ON public.calendars FOR SELECT
  USING (
    visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = calendars.org_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create calendars"
  ON public.calendars FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = calendars.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Members can update calendars"
  ON public.calendars FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = calendars.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Creators and admins can delete calendars"
  ON public.calendars FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = calendars.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- Events RLS Policies
CREATE POLICY "Users can view events in accessible calendars"
  ON public.events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = events.calendar_id
      AND (
        c.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM public.memberships m
          INNER JOIN public.profiles p ON p.id = m.profile_id
          WHERE m.org_id = c.org_id AND p.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Members can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = events.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Creators and admins can update events"
  ON public.events FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = events.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Creators and admins can delete events"
  ON public.events FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = events.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- Attendees RLS Policies
CREATE POLICY "Users can view attendees of accessible events"
  ON public.attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      INNER JOIN public.calendars c ON c.id = e.calendar_id
      WHERE e.id = attendees.event_id
      AND (
        c.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM public.memberships m
          INNER JOIN public.profiles p ON p.id = m.profile_id
          WHERE m.org_id = c.org_id AND p.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Members can manage attendees"
  ON public.attendees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      INNER JOIN public.memberships m ON m.org_id = e.org_id
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE e.id = attendees.event_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'member')
    )
  );

-- Invites RLS Policies
CREATE POLICY "Users can view invites for their organisations"
  ON public.invites FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = invites.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can create invites"
  ON public.invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = invites.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete invites"
  ON public.invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      INNER JOIN public.profiles p ON p.id = m.profile_id
      WHERE m.org_id = invites.org_id 
      AND p.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_organisations_updated_at
  BEFORE UPDATE ON public.organisations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_calendars_updated_at
  BEFORE UPDATE ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_attendees_updated_at
  BEFORE UPDATE ON public.attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile and personal organisation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  new_org_id UUID;
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
  
  RETURN NEW;
END;
$$;

-- Trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate public calendar ID
CREATE OR REPLACE FUNCTION public.generate_public_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.visibility = 'public' AND NEW.public_id IS NULL THEN
    NEW.public_id := encode(gen_random_bytes(16), 'base64');
    NEW.public_id := REPLACE(REPLACE(REPLACE(NEW.public_id, '+', '-'), '/', '_'), '=', '');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to generate public ID for public calendars
CREATE TRIGGER generate_calendar_public_id
  BEFORE INSERT OR UPDATE ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_public_id();

-- Add indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_organisations_owner_id ON public.organisations(owner_id);
CREATE INDEX idx_organisations_slug ON public.organisations(slug);
CREATE INDEX idx_memberships_org_id ON public.memberships(org_id);
CREATE INDEX idx_memberships_profile_id ON public.memberships(profile_id);
CREATE INDEX idx_calendars_org_id ON public.calendars(org_id);
CREATE INDEX idx_calendars_public_id ON public.calendars(public_id);
CREATE INDEX idx_events_calendar_id ON public.events(calendar_id);
CREATE INDEX idx_events_org_id ON public.events(org_id);
CREATE INDEX idx_events_start_at ON public.events(start_at);
CREATE INDEX idx_attendees_event_id ON public.attendees(event_id);
CREATE INDEX idx_invites_org_id ON public.invites(org_id);
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_email ON public.invites(email);