import {
  users,
  reports,
  strikes,
  type User,
  type InsertUser,
  type Report,
  type InsertReport,
  type Strike,
  type InsertStrike,
  type ReportWithUser,
  type StrikeWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByBadgeNumber(badgeNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getPendingUsers(): Promise<User[]>;
  getApprovedTroopers(): Promise<User[]>;
  approveUser(id: string, approvedBy: string): Promise<User | undefined>;
  denyUser(id: string, denialReason: string): Promise<User | undefined>;

  // Report operations
  createReport(userId: string, report: InsertReport): Promise<Report>;
  getReportsByUserId(userId: string): Promise<Report[]>;
  getPendingReports(): Promise<ReportWithUser[]>;
  getReportById(id: string): Promise<ReportWithUser | undefined>;
  reviewReport(id: string, reviewedBy: string, status: string, notes: string): Promise<Report | undefined>;

  // Strike operations
  createStrike(strike: InsertStrike & { issuedBy: string }): Promise<Strike>;
  getStrikesByUserId(userId: string): Promise<StrikeWithRelations[]>;
  
  // Stats operations
  getStats(): Promise<{
    activeTroopers: number;
    pendingProfiles: number;
    pendingReports: number;
    totalStrikes: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByBadgeNumber(badgeNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.badgeNumber, badgeNumber));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPendingUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.status, "pending"))
      .orderBy(sql`${users.createdAt} DESC`);
  }

  async getApprovedTroopers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.status, "approved"), eq(users.role, "trooper")))
      .orderBy(sql`${users.name} ASC`);
  }

  async approveUser(id: string, approvedBy: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        status: "approved",
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async denyUser(id: string, denialReason: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        status: "denied",
        denialReason,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Report operations
  async createReport(userId: string, reportData: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values({
        ...reportData,
        userId,
      })
      .returning();
    return report;
  }

  async getReportsByUserId(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(sql`${reports.createdAt} DESC`);
  }

  async getPendingReports(): Promise<ReportWithUser[]> {
    return await db
      .select({
        id: reports.id,
        userId: reports.userId,
        title: reports.title,
        description: reports.description,
        incidentDate: reports.incidentDate,
        location: reports.location,
        status: reports.status,
        reviewedBy: reports.reviewedBy,
        reviewNotes: reports.reviewNotes,
        reviewedAt: reports.reviewedAt,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        user: users,
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .where(eq(reports.status, "pending"))
      .orderBy(sql`${reports.createdAt} DESC`);
  }

  async getReportById(id: string): Promise<ReportWithUser | undefined> {
    const [report] = await db
      .select({
        id: reports.id,
        userId: reports.userId,
        title: reports.title,
        description: reports.description,
        incidentDate: reports.incidentDate,
        location: reports.location,
        status: reports.status,
        reviewedBy: reports.reviewedBy,
        reviewNotes: reports.reviewNotes,
        reviewedAt: reports.reviewedAt,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        user: users,
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .where(eq(reports.id, id));
    return report;
  }

  async reviewReport(
    id: string,
    reviewedBy: string,
    status: string,
    notes: string
  ): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({
        status,
        reviewedBy,
        reviewNotes: notes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  // Strike operations
  async createStrike(strikeData: InsertStrike & { issuedBy: string }): Promise<Strike> {
    const [strike] = await db
      .insert(strikes)
      .values(strikeData)
      .returning();
    return strike;
  }

  async getStrikesByUserId(userId: string): Promise<StrikeWithRelations[]> {
    return await db
      .select({
        id: strikes.id,
        userId: strikes.userId,
        reason: strikes.reason,
        description: strikes.description,
        issuedBy: strikes.issuedBy,
        issuedAt: strikes.issuedAt,
        supervisor: users,
      })
      .from(strikes)
      .leftJoin(users, eq(strikes.issuedBy, users.id))
      .where(eq(strikes.userId, userId))
      .orderBy(sql`${strikes.issuedAt} DESC`);
  }

  // Stats operations
  async getStats(): Promise<{
    activeTroopers: number;
    pendingProfiles: number;
    pendingReports: number;
    totalStrikes: number;
  }> {
    const [activeTroopersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.status, "approved"), eq(users.role, "trooper")));

    const [pendingProfilesResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.status, "pending"));

    const [pendingReportsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, "pending"));

    const [totalStrikesResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(strikes);

    return {
      activeTroopers: activeTroopersResult?.count || 0,
      pendingProfiles: pendingProfilesResult?.count || 0,
      pendingReports: pendingReportsResult?.count || 0,
      totalStrikes: totalStrikesResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
