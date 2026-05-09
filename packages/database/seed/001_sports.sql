INSERT INTO sports (id, name, min_players, ideal_players, max_players, default_duration_minutes)
VALUES
  ('football', 'Football', 10, 12, 14, 90),
  ('basketball', 'Basketball', 6, 8, 10, 60),
  ('tennis', 'Tennis', 2, 2, 4, 60),
  ('running', 'Running', 2, 5, 20, 45),
  ('volleyball', 'Volleyball', 6, 8, 12, 75)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  min_players = EXCLUDED.min_players,
  ideal_players = EXCLUDED.ideal_players,
  max_players = EXCLUDED.max_players,
  default_duration_minutes = EXCLUDED.default_duration_minutes;
