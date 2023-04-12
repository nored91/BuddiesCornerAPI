CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS event_user;
DROP TABLE IF EXISTS group_user;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS "comment";
DROP TABLE IF EXISTS "event";
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS "group";
DROP TYPE IF EXISTS event_type;

CREATE TYPE event_type AS ENUM ('other','party','sport','vacation');

CREATE TABLE "group" ( 
  group_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(100) NOT NULL,
  description varchar(255),
  creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

CREATE TABLE "user" ( 
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mail varchar(255) NOT NULL UNIQUE,
  firstname varchar(50) NOT NULL,
  lastname varchar(50) NOT NULL,
  pseudo varchar(50) NOT NULL,
  password varchar(255) NOT NULL,
  active boolean DEFAULT false,
  creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

CREATE TABLE "event" ( 
  event_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id uuid NOT NULL,
  creator_user_id uuid NOT NULL,
  title varchar(100) NOT NULL, 
  description varchar(255),
  creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  event_date timestamp,
  location varchar(255),
  type event_type NOT NULL,
  CONSTRAINT foreign_key_group_event FOREIGN KEY(group_id) REFERENCES "group"(group_id),
  CONSTRAINT foreign_key_creator_user_event FOREIGN KEY(creator_user_id) REFERENCES "user"(user_id)
);

CREATE TABLE "comment" ( 
  comment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_comment_id uuid,
  event_id uuid,
  user_id uuid,
  message varchar(255) NOT NULL,
  creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  edition_date timestamp,
  CONSTRAINT foreign_key_parent_comment_comment FOREIGN KEY(parent_comment_id) REFERENCES "comment"(comment_id),
  CONSTRAINT foreign_key_event_comment FOREIGN KEY(event_id) REFERENCES "event"(event_id),
  CONSTRAINT foreign_key_user_comment FOREIGN KEY(user_id) REFERENCES "user"(user_id)
);

CREATE TABLE task ( 
  task_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid,
  user_id uuid,
  title varchar(100) NOT NULL, 
  achieve boolean DEFAULT false,
  CONSTRAINT foreign_key_event_task FOREIGN KEY(event_id) REFERENCES "event"(event_id),
  CONSTRAINT foreign_key_user_task FOREIGN KEY(user_id) REFERENCES "user"(user_id)
);

CREATE TABLE event_user(
  event_id uuid ,
  user_id uuid,
  PRIMARY KEY (event_id, user_id),
  CONSTRAINT primary_key_event_event_user FOREIGN KEY (event_id) REFERENCES "event"(event_id),
  CONSTRAINT primary_key_user_event_user FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

CREATE TABLE group_user(
  group_id uuid,
  user_id uuid,
  administrator boolean default false,
  join_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (group_id, user_id),
  CONSTRAINT primary_key_group_group_user FOREIGN KEY (group_id) REFERENCES "group"(group_id),
  CONSTRAINT primary_key_user_group_user FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);
