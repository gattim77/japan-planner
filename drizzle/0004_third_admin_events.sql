CREATE TRIGGER IF NOT EXISTS third_admin_trips_insert_guard BEFORE INSERT ON trips
WHEN EXISTS(SELECT 1 FROM third_admin_controls WHERE user_id=NEW.user_id AND status='blocked')
BEGIN SELECT RAISE(ABORT,'Account unavailable'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_trips_update_guard BEFORE UPDATE ON trips
WHEN EXISTS(SELECT 1 FROM third_admin_controls WHERE user_id=NEW.user_id AND status='blocked')
BEGIN SELECT RAISE(ABORT,'Account unavailable'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_trips_activity AFTER INSERT ON trips
BEGIN INSERT INTO third_admin_activity(occurred_at,user_id,action) VALUES(CAST(strftime('%s','now') AS INTEGER)*1000,NEW.user_id,'trips_created'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_preferences_insert_guard BEFORE INSERT ON preferences
WHEN EXISTS(SELECT 1 FROM third_admin_controls WHERE user_id=NEW.user_id AND status='blocked')
BEGIN SELECT RAISE(ABORT,'Account unavailable'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_preferences_update_guard BEFORE UPDATE ON preferences
WHEN EXISTS(SELECT 1 FROM third_admin_controls WHERE user_id=NEW.user_id AND status='blocked')
BEGIN SELECT RAISE(ABORT,'Account unavailable'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_preferences_activity AFTER INSERT ON preferences
BEGIN INSERT INTO third_admin_activity(occurred_at,user_id,action) VALUES(CAST(strftime('%s','now') AS INTEGER)*1000,NEW.user_id,'preferences_created'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_saved_events_insert_guard BEFORE INSERT ON saved_events
WHEN EXISTS(SELECT 1 FROM third_admin_controls WHERE user_id=NEW.user_id AND status='blocked')
BEGIN SELECT RAISE(ABORT,'Account unavailable'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_saved_events_update_guard BEFORE UPDATE ON saved_events
WHEN EXISTS(SELECT 1 FROM third_admin_controls WHERE user_id=NEW.user_id AND status='blocked')
BEGIN SELECT RAISE(ABORT,'Account unavailable'); END;
CREATE TRIGGER IF NOT EXISTS third_admin_saved_events_activity AFTER INSERT ON saved_events
BEGIN INSERT INTO third_admin_activity(occurred_at,user_id,action) VALUES(CAST(strftime('%s','now') AS INTEGER)*1000,NEW.user_id,'saved_events_created'); END;
