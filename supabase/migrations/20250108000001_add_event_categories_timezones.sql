-- Add event categories and timezone support

-- Create event categories enum
CREATE TYPE public.event_category AS ENUM (
  'work',
  'personal',
  'health',
  'social',
  'travel',
  'education',
  'finance',
  'hobby',
  'family',
  'other'
);

-- Add category and timezone columns to events table
ALTER TABLE public.events 
ADD COLUMN category public.event_category DEFAULT 'personal',
ADD COLUMN timezone TEXT DEFAULT 'UTC';

-- Create index for category filtering
CREATE INDEX idx_events_category ON public.events(category);

-- Create index for timezone filtering
CREATE INDEX idx_events_timezone ON public.events(timezone);

-- Update existing events to have default values
UPDATE public.events 
SET 
  category = 'personal',
  timezone = 'UTC'
WHERE category IS NULL OR timezone IS NULL;
