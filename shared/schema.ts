import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - troopers and supervisors
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  badgeNumber: varchar("badge_number", { length: 50 }).notNull().unique(),
  role: varchar("role", { length: 20 }).notNull().default("trooper"), // 'trooper' | 'supervisor'
  rank: varchar("rank", { length: 100 }),
  profileImageUrl: text("profile_image_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'approved' | 'denied'
  denialReason: text("denial_reason"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reports table - incident reports submitted by troopers
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  incidentDate: timestamp("incident_date").notNull(),
  location: varchar("location", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("reports_user_id_idx").on(table.userId),
  statusIdx: index("reports_status_idx").on(table.status),
}));

// Strikes table - disciplinary actions issued by supervisors
export const strikes = pgTable("strikes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description").notNull(),
  issuedBy: varchar("issued_by").notNull().references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("strikes_user_id_idx").on(table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  reports: many(reports, { relationName: "userReports" }),
  strikes: many(strikes, { relationName: "userStrikes" }),
  issuedStrikes: many(strikes, { relationName: "supervisorStrikes" }),
  reviewedReports: many(reports, { relationName: "supervisorReviews" }),
  approvedUsers: many(users, { relationName: "approvedBy" }),
  approver: one(users, {
    fields: [users.approvedBy],
    references: [users.id],
    relationName: "approvedBy",
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
    relationName: "userReports",
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
    relationName: "supervisorReviews",
  }),
}));

export const strikesRelations = relations(strikes, ({ one }) => ({
  user: one(users, {
    fields: [strikes.userId],
    references: [users.id],
    relationName: "userStrikes",
  }),
  supervisor: one(users, {
    fields: [strikes.issuedBy],
    references: [users.id],
    relationName: "supervisorStrikes",
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  badgeNumber: z.string().min(1, "Badge number is required"),
  role: z.enum(["trooper", "supervisor"]).default("trooper"),
  rank: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports, {
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  incidentDate: z.coerce.date(),
  location: z.string().optional(),
}).omit({
  id: true,
  userId: true,
  status: true,
  reviewedBy: true,
  reviewNotes: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStrikeSchema = createInsertSchema(strikes, {
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
}).omit({
  id: true,
  issuedBy: true,
  issuedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Strike = typeof strikes.$inferSelect;
export type InsertStrike = z.infer<typeof insertStrikeSchema>;

// Additional types for API responses
export type UserWithRelations = User & {
  reports?: Report[];
  strikes?: Strike[];
};

export type ReportWithUser = Report & {
  user?: User;
  reviewer?: User;
};

export type StrikeWithRelations = Strike & {
  user?: User;
  supervisor?: User;
};
