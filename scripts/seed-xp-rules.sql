-- Insert XP Rules for Gamification
INSERT INTO xp_rules (activity_type, activity_displayname, xp_points) VALUES
  ('LOGIN', 'Daily Login', 3),
  ('LOGIN_STREAK_3D', '3 Day Login Streak', 10),
  ('REVISION_COMPLETE', 'Revision Completed', 5),
  ('NEW_TOPIC_COMPLETE', 'New Topic Completed', 3),
  ('ANSWER_CORRECT', 'Correct Answer', 1),
  ('ANSWER_WRONG', 'Wrong Answer', -1),
  ('DID_FLASHCARDS', 'Flashcards Completed', 8),
  ('LOGIN_MISSED_7DAYS', 'Missed Login for 7 Days', -50)
ON CONFLICT (activity_type) DO UPDATE SET
  activity_displayname = EXCLUDED.activity_displayname,
  xp_points = EXCLUDED.xp_points;
