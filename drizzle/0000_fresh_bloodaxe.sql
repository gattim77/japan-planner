CREATE TABLE `attractions` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`payload` text NOT NULL,
	`source_id` text,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`prefecture_id` integer NOT NULL,
	`payload` text NOT NULL,
	`source_id` text,
	FOREIGN KEY (`prefecture_id`) REFERENCES `prefectures`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`year` integer NOT NULL,
	`start_date` text,
	`end_date` text,
	`confidence` text NOT NULL,
	`cancelled` integer DEFAULT false NOT NULL,
	`source_id` text,
	`verified_at` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `occurrences_dates` ON `event_occurrences` (`start_date`,`end_date`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`payload` text NOT NULL,
	`source_id` text,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prefectures` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`japanese_name` text NOT NULL,
	`region` text NOT NULL,
	`source_id` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rail_passes` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`source_id` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `saved_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`priority` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`visited` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saved_event_owner` ON `saved_events` (`user_id`,`event_id`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`authority` text NOT NULL,
	`kind` text NOT NULL,
	`verified_at` text
);
--> statement-breakpoint
CREATE TABLE `transport_services` (
	`id` text PRIMARY KEY NOT NULL,
	`operator` text NOT NULL,
	`payload` text NOT NULL,
	`source_id` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'saved' NOT NULL,
	`payload` text NOT NULL,
	`share_token` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `trips_owner` ON `trips` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `trips_share` ON `trips` (`share_token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trip_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `versions_trip` ON `trip_versions` (`trip_id`);