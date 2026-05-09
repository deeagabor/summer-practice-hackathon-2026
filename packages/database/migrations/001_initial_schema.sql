CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');
CREATE TYPE location_privacy AS ENUM ('approximate', 'precise', 'hidden');
CREATE TYPE skill_level AS ENUM ('beginner', 'casual', 'intermediate', 'advanced');
CREATE TYPE play_intensity AS ENUM ('social', 'balanced', 'competitive');
CREATE TYPE event_status AS ENUM ('draft', 'suggested', 'open', 'pending_confirmation', 'confirmed', 'active', 'completed', 'cancelled');
CREATE TYPE event_visibility AS ENUM ('public', 'friends', 'invite_only');
CREATE TYPE participant_status AS ENUM ('invited', 'joined', 'confirmed', 'waitlisted', 'attended', 'cancelled');
CREATE TYPE conversation_kind AS ENUM ('direct', 'group', 'event');
CREATE TYPE message_kind AS ENUM ('text', 'event_invitation', 'poll_prompt', 'system_update');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  home_area text NOT NULL DEFAULT '',
  preferred_radius_km integer NOT NULL DEFAULT 8,
  location_privacy location_privacy NOT NULL DEFAULT 'approximate',
  allows_ai_profile boolean NOT NULL DEFAULT true,
  coordinates geography(Point, 4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sports (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  min_players integer NOT NULL,
  ideal_players integer NOT NULL,
  max_players integer NOT NULL,
  default_duration_minutes integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_sport_preferences (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport_id text NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  skill_level skill_level NOT NULL,
  intensity play_intensity NOT NULL,
  preferred_roles text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sport_id)
);

CREATE TABLE availability_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  show_up_today boolean NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE organizer_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name text NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending',
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  coordinates geography(Point, 4326) NOT NULL,
  price_estimate_cents integer,
  amenities text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sport_id text NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  creator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  organizer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  captain_id uuid REFERENCES users(id) ON DELETE SET NULL,
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  status event_status NOT NULL DEFAULT 'draft',
  visibility event_visibility NOT NULL DEFAULT 'public',
  image_url text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  capacity integer NOT NULL,
  min_skill skill_level NOT NULL,
  max_skill skill_level NOT NULL,
  description text NOT NULL DEFAULT '',
  location_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  coordinates geography(Point, 4326) NOT NULL,
  price_estimate_cents integer,
  reason_codes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (capacity > 1)
);

CREATE TABLE event_participants (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'joined',
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL,
  closes_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE poll_votes (
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, option_id, user_id)
);

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind conversation_kind NOT NULL,
  title text NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at timestamptz,
  muted_at timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind message_kind NOT NULL DEFAULT 'text',
  body text NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  caption text NOT NULL DEFAULT '',
  visibility event_visibility NOT NULL DEFAULT 'public',
  sport_id text NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  event_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  content_type text NOT NULL,
  byte_size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  extracted_sports text[] NOT NULL DEFAULT '{}',
  extracted_interests text[] NOT NULL DEFAULT '{}',
  compatibility_vector real[],
  moderation_flags text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE compatibility_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  score integer NOT NULL,
  reason_codes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (score BETWEEN 0 AND 100)
);

CREATE TABLE moderation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subject_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_coordinates_idx ON profiles USING gist (coordinates);
CREATE INDEX venues_coordinates_idx ON venues USING gist (coordinates);
CREATE INDEX events_coordinates_idx ON events USING gist (coordinates);
CREATE INDEX events_status_starts_at_idx ON events (status, starts_at);
CREATE INDEX events_sport_id_idx ON events (sport_id);
CREATE INDEX event_participants_status_idx ON event_participants (status);
CREATE INDEX messages_conversation_created_idx ON messages (conversation_id, created_at DESC);
CREATE INDEX audit_logs_created_idx ON audit_logs (created_at DESC);
