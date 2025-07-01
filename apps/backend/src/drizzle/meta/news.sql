PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "minecraft_news" ("id" integer PRIMARY KEY, "title" text NOT NULL, "description" text NOT NULL, "media_links" text, "tags" text, "created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP, "imageUrl" text NOT NULL);
INSERT INTO minecraft_news VALUES(1,'Добавление вики сервера','⚡Теперь всю полезную информацию по игре можно узнать на странице вики. Меньше тупых вопросов!',NULL,NULL,'2025-06-14 08:06:15','news/wiki-news.webp');
INSERT INTO minecraft_news VALUES(2,'Теперь у сервера есть свой дискорд канал','Да, ты не ослышался, целый дискорд канал. Зачем? Для того, чтобы собирать именно там всё коммьюнити сервера, а также это место, где я сижу постоянно и готов ответить на все твои вопросы.',NULL,NULL,'2025-06-14 08:06:28','news/discord-news.webp');
INSERT INTO minecraft_news VALUES(3,'Релиз уже!','Если вы еще не знали, я уже открыл сервер, написав об этом в дискорде и телеграмме проекта. Кстати советую подписаться там. Любой желающий сможет зайти на сервер, имея у себя майнкрафт версии не ниже 1.20.1.',NULL,NULL,'2025-06-14 08:06:42','news/release-news.webp');
COMMIT;
