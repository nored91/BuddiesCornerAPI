INSERT INTO "user" (mail,firstname,lastname,pseudo,password,active) VALUES ('thoretton.norman@gmail.com','norman','thoretton','nored','',true);
INSERT INTO "user" (mail,firstname,lastname,pseudo,password,active) VALUES ('notactivated@test.fr','test','test','test dude','',false);
INSERT INTO "user" (mail,firstname,lastname,pseudo,password,active) VALUES ('activated@test.fr','test','test','test dude','',true);
INSERT INTO "user" (mail,firstname,lastname,pseudo,password,active) VALUES ('legraskevin@outlook.com','kevin','legras','keke','',true);

INSERT INTO "group" (title,description) VALUES ('On va au bloc','groupe escalade');
INSERT INTO "group" (title,description) VALUES ('Au bar','groupe de la boisson');
INSERT INTO "group" (title) VALUES ('Vacance');

INSERT INTO group_user VALUES (
  (select group_id from "group" where "group".title = 'On va au bloc'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com'),
  true
);
INSERT INTO group_user VALUES (
  (select group_id from "group" where "group".title = 'On va au bloc'),
  (select user_id from "user" where "user".mail = 'legraskevin@outlook.com'),
  false
);

INSERT INTO group_user VALUES (
  (select group_id from "group" where "group".title = 'Au bar'),
  (select user_id from "user" where "user".mail = 'legraskevin@outlook.com'),
  true
);
INSERT INTO group_user VALUES (
  (select group_id from "group" where "group".title = 'Au bar'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com'),
  true
);
INSERT INTO group_user (group_id,user_id) VALUES (
  (select group_id from "group" where "group".title = 'Au bar'),
  (select user_id from "user" where "user".mail = 'activated@test.fr')
);
INSERT INTO group_user (group_id,user_id) VALUES (
  (select group_id from "group" where "group".title = 'Au bar'),
  (select user_id from "user" where "user".mail = 'notactivated@test.fr')
);

INSERT INTO event (group_id,creator_user_id,title,description,event_date,location,type) VALUES (
  (select group_id from "group" where "group".title = 'On va au bloc'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com'),
  'S??ance du mardi',
  'La classico du mardi',
  '2023/01/16:12:00:00'::timestamp,
  'Le labo (Grenoble gare)',
  'sport'
);
INSERT INTO event_user (event_id,user_id) VALUES (
  (select event_id from "event" where event.title = 'S??ance du mardi'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com')
);

INSERT INTO event (group_id,creator_user_id,title,description,event_date,location,type) VALUES (
  (select group_id from "group" where "group".title = 'On va au bloc'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com'),
  'S??ance du vendredi 18 f??vrier',
  'La classico du vendredi',
  '2023/02/18:12:00:00'::timestamp,
  'Le labo (Grenoble gare)',
  'sport'
);
INSERT INTO event_user (event_id,user_id) VALUES (
  (select event_id from "event" where event.title = 'S??ance du vendredi 18 f??vrier'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com')
);
INSERT INTO event_user (event_id,user_id) VALUES (
  (select event_id from "event" where event.title = 'S??ance du vendredi 18 f??vrier'),
  (select user_id from "user" where "user".mail = 'activated@test.fr')
);
INSERT INTO event_user (event_id,user_id) VALUES (
  (select event_id from "event" where event.title = 'S??ance du vendredi 18 f??vrier'),
  (select user_id from "user" where "user".mail = 'legraskevin@outlook.com')
);

INSERT INTO event (group_id,creator_user_id,title,description,event_date,location,type) VALUES (
  (select group_id from "group" where "group".title = 'On va au bloc'),
  (select user_id from "user" where "user".mail = 'legraskevin@outlook.com'),
  'S??ance du mercredi',
  'La seance des bonhommes du mercredi',
  '2023/02/18:12:00:00'::timestamp,
  'Le labo (Grenoble gare)',
  'sport'
);
INSERT INTO event_user (event_id,user_id) VALUES (
  (select event_id from "event" where event.title = 'S??ance du mercredi'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com')
);
INSERT INTO event_user (event_id,user_id) VALUES (
  (select event_id from "event" where event.title = 'S??ance du mercredi'),
  (select user_id from "user" where "user".mail = 'activated@test.fr')
);
INSERT INTO event_user (event_id,user_id) VALUES (
  (select event_id from "event" where event.title = 'S??ance du mercredi'),
  (select user_id from "user" where "user".mail = 'legraskevin@outlook.com')
);

INSERT INTO task (event_id, user_id, title) VALUES (
  (select event_id from "event" where event.title = 'S??ance du vendredi 18 f??vrier'),
  (select user_id from "user" where "user".mail = 'legraskevin@outlook.com'),
  'Ram??ne tes chaussons');

INSERT INTO task (event_id, user_id, title) VALUES (
  (select event_id from "event" where event.title = 'S??ance du mardi'),
  (select user_id from "user" where "user".mail = 'legraskevin@outlook.com'),
  'Je dois une bi??re ?? norman');

INSERT INTO task (event_id, user_id, title) VALUES (
  (select event_id from "event" where event.title = 'S??ance du mardi'),
  (select user_id from "user" where "user".mail = 'thoretton.norman@gmail.com'),
  'Ram??ne tes chaussons');

INSERT INTO comment (event_id,user_id,message,creation_date) VALUES (
  (SELECT event_id FROM "event" WHERE title = 'S??ance du mardi'),
  (SELECT user_id FROM "user" WHERE mail = 'legraskevin@outlook.com'),
  'Norman tu es pas beau',
  '2023-01-16 13:00:00'::timestamp
);

INSERT INTO comment (parent_comment_id,event_id,user_id,message,creation_date,edition_date) VALUES (
  (SELECT comment_id FROM comment WHERE message = 'Norman tu es pas beau'),
  (SELECT event_id FROM "event" WHERE title = 'S??ance du mardi'),
  (SELECT user_id FROM "user" WHERE mail = 'thoretton.norman@gmail.com'),
  'Vous avez raison mon maitre',
  '2023-01-16 13:10:00'::timestamp,
  '2023-01-16 13:11:00'::timestamp
);