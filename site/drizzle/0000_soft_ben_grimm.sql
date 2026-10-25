CREATE TABLE `posters` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`team` integer NOT NULL,
	`title` text NOT NULL,
	`key` text NOT NULL,
	`mime` text NOT NULL,
	`status` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`code`) REFERENCES `sessions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`state` text NOT NULL,
	`accepting` integer DEFAULT 1 NOT NULL,
	`created` integer NOT NULL
);
