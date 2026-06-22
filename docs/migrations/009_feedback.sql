-- Feedback fields for members (Coyotes)
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS rating           int  CHECK (rating >= 0 AND rating <= 10),
  ADD COLUMN IF NOT EXISTS story            text,
  ADD COLUMN IF NOT EXISTS highlights       text,
  ADD COLUMN IF NOT EXISTS improvement_points text,
  ADD COLUMN IF NOT EXISTS suggestions      text,
  ADD COLUMN IF NOT EXISTS testimonial_approved boolean NOT NULL DEFAULT false;

-- Feedback fields for baskferia_participants
ALTER TABLE baskferia_participants
  ADD COLUMN IF NOT EXISTS rating           int  CHECK (rating >= 0 AND rating <= 10),
  ADD COLUMN IF NOT EXISTS story            text,
  ADD COLUMN IF NOT EXISTS highlights       text,
  ADD COLUMN IF NOT EXISTS improvement_points text,
  ADD COLUMN IF NOT EXISTS suggestions      text,
  ADD COLUMN IF NOT EXISTS testimonial_approved boolean NOT NULL DEFAULT false;
