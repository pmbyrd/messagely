\c messagely
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

-- Insert sample users data
INSERT INTO users (username, password, first_name, last_name, phone, join_at)
VALUES
  ('user1', 'hashed_password1', 'John', 'Doe', '123-456-7890', NOW()),
  ('user2', 'hashed_password2', 'Alice', 'Johnson', '987-654-3210', NOW()),
  ('user3', 'hashed_password3', 'Bob', 'Smith', '555-555-5555', NOW()),
  ('user4', 'hashed_password4', 'Emma', 'Wilson', '777-888-9999', NOW());

-- Insert sample messages data
INSERT INTO messages (from_username, to_username, body, sent_at)
VALUES
  ('user1', 'user2', 'Hello, Alice!', NOW()),
  ('user2', 'user1', 'Hi, John!', NOW()),
  ('user3', 'user1', 'Hey, John!', NOW()),
  ('user4', 'user1', 'Good morning!', NOW()),
  ('user1', 'user3', 'Hello, Bob!', NOW()),
  ('user2', 'user3', 'Hi, Bob!', NOW()),
  ('user3', 'user2', 'Hey, Alice!', NOW());


