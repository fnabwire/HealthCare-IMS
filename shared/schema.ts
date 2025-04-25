import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Health program schema
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  requiredInfo: text("required_info").array()
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  name: text("name").notNull(),
  dob: text("dob").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  email: text("email"),
  emergencyContact: text("emergency_contact").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertClientSchema = createInsertSchema(clients)
  .omit({
    id: true,
    createdAt: true
  })
  .partial({
    clientId: true // Make clientId optional so server can generate it
  });

// Enrollment schema
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  programId: integer("program_id").notNull().references(() => programs.id),
  enrollDate: timestamp("enroll_date").notNull().defaultNow(),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  symptomSeverity: text("symptom_severity"),
  riskLevel: text("risk_level"),
  followUpRequired: boolean("follow_up_required").default(false)
}, (t) => ({
  uniq: unique().on(t.clientId, t.programId)
}));

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true
});

// Visit schema
export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  programId: integer("program_id").notNull().references(() => programs.id),
  date: timestamp("date").notNull().defaultNow(),
  doctor: text("doctor").notNull(),
  purpose: text("purpose").notNull()
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true
});

// Note schema
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  programId: integer("program_id").references(() => programs.id),
  content: text("content").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

// Extended types for frontend
export type ClientWithEnrollments = Client & {
  enrollments: (Enrollment & { program: Program })[];
};

export type ClientWithDetails = Client & {
  enrollments: (Enrollment & { program: Program })[];
  visits: (Visit & { program: Program })[];
  notes: (Note & { program?: Program })[];
};

export type ProgramWithEnrollments = Program & {
  enrollmentCount: number;
};
