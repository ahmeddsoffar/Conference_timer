-- Initial schema for conference_db

DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) DEFAULT NULL,
  staff_name VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UK_admin_email (email)
);

DROP TABLE IF EXISTS events;
CREATE TABLE events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  event_end_time DATETIME(6) DEFAULT NULL,
  event_name VARCHAR(255) DEFAULT NULL,
  event_start_time DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UK_user_email (email)
);

DROP TABLE IF EXISTS registrations;
CREATE TABLE registrations (
  id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  status ENUM('CHECKED_IN','CHECKED_OUT','PAUSED','REGISTERED') NOT NULL,
  event_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UK_user_event (user_id, event_id),
  UNIQUE KEY UK_code (code),
  CONSTRAINT FK_registration_event FOREIGN KEY (event_id) REFERENCES events (id),
  CONSTRAINT FK_registration_user FOREIGN KEY (user_id) REFERENCES users (id)
);

DROP TABLE IF EXISTS attendees;
CREATE TABLE attendees (
  id BIGINT NOT NULL AUTO_INCREMENT,
  status VARCHAR(255) DEFAULT NULL,
  total_time BIGINT DEFAULT NULL,
  event_id BIGINT DEFAULT NULL,
  user_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_attendee_event FOREIGN KEY (event_id) REFERENCES events (id),
  CONSTRAINT FK_attendee_user FOREIGN KEY (user_id) REFERENCES users (id)
);

DROP TABLE IF EXISTS attendance_events;
CREATE TABLE attendance_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at DATETIME(6) NOT NULL,
  event_type ENUM('CHECKIN','CHECKOUT','MANUAL','PAUSE','RESUME') NOT NULL,
  meta JSON DEFAULT NULL,
  registration_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_reg_created (registration_id, created_at),
  CONSTRAINT FK_attendance_registration FOREIGN KEY (registration_id) REFERENCES registrations (id)
);
