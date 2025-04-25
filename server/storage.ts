import { eq, like, and, sql, desc } from "drizzle-orm";
import { programs, clients, enrollments, visits, notes, users } from "@shared/schema";
import { db, pool } from "./db";
import { 
  Program, InsertProgram, 
  Client, InsertClient, 
  Enrollment, InsertEnrollment,
  Visit, InsertVisit,
  Note, InsertNote,
  User, InsertUser,
  ClientWithDetails, ClientWithEnrollments, ProgramWithEnrollments
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Program operations
  getPrograms(): Promise<Program[]>;
  getProgramById(id: number): Promise<Program | undefined>;
  getProgramByCode(code: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClientById(id: number): Promise<Client | undefined>;
  getClientByClientId(clientId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  searchClients(query: string): Promise<Client[]>;
  
  // Enrollment operations
  getEnrollments(): Promise<Enrollment[]>;
  getEnrollmentById(id: number): Promise<Enrollment | undefined>;
  getEnrollmentsByClientId(clientId: number): Promise<(Enrollment & { program: Program })[]>;
  getEnrollmentsByProgramId(programId: number): Promise<(Enrollment & { client: Client })[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  deleteEnrollment(clientId: number, programId: number): Promise<boolean>;
  
  // Client with details operations
  getClientDetails(clientId: number): Promise<ClientWithDetails | undefined>;
  getClientWithEnrollments(clientId: number): Promise<ClientWithEnrollments | undefined>;
  
  // Visit operations
  getVisitsByClientId(clientId: number): Promise<Visit[]>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  
  // Note operations
  getNotesByClientId(clientId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;

  // Dashboard data
  getProgramsWithEnrollmentCount(): Promise<ProgramWithEnrollments[]>;
  
  // Session storage
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Program operations
  async getPrograms(): Promise<Program[]> {
    return db.select().from(programs);
  }

  async getProgramById(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }

  async getProgramByCode(code: string): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.code, code));
    return program;
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  }
  
  // Client operations
  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(desc(clients.id));
  }

  async getClientById(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByClientId(clientId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.clientId, clientId));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    // Generate a unique clientId (if not provided by the client)
    let clientId = client.clientId;
    
    // Generate a clientId if one wasn't provided
    if (!clientId) {
      const clientIdPrefix = "HIS";
      const year = new Date().getFullYear().toString();
      
      // Get the latest client to determine the next ID
      const latestClients = await db.select().from(clients).orderBy(desc(clients.id)).limit(1);
      const nextId = latestClients.length ? latestClients[0].id + 1 : 1;
      const paddedId = String(nextId).padStart(3, '0');
      
      clientId = `${clientIdPrefix}-${year}-${paddedId}`;
    }
    
    // Remove clientId from the client object to avoid duplication
    // @ts-ignore - Typescript doesn't like the destructuring+rest pattern here
    const { clientId: _, ...clientData } = client;
    
    const [newClient] = await db
      .insert(clients)
      .values({ ...clientData, clientId })
      .returning();
    
    return newClient;
  }

  async searchClients(query: string): Promise<Client[]> {
    if (!query) return [];
    
    return db
      .select()
      .from(clients)
      .where(
        sql`${clients.name} ILIKE ${`%${query}%`} OR 
            ${clients.clientId} ILIKE ${`%${query}%`} OR 
            ${clients.phone} ILIKE ${`%${query}%`}`
      );
  }
  
  // Enrollment operations
  async getEnrollments(): Promise<Enrollment[]> {
    return db.select().from(enrollments);
  }

  async getEnrollmentById(id: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment;
  }

  async getEnrollmentsByClientId(clientId: number): Promise<(Enrollment & { program: Program })[]> {
    const results = await db
      .select({
        enrollment: enrollments,
        program: programs,
      })
      .from(enrollments)
      .innerJoin(programs, eq(enrollments.programId, programs.id))
      .where(eq(enrollments.clientId, clientId));
    
    return results.map(({ enrollment, program }) => ({ ...enrollment, program }));
  }

  async getEnrollmentsByProgramId(programId: number): Promise<(Enrollment & { client: Client })[]> {
    const results = await db
      .select({
        enrollment: enrollments,
        client: clients,
      })
      .from(enrollments)
      .innerJoin(clients, eq(enrollments.clientId, clients.id))
      .where(eq(enrollments.programId, programId));
    
    return results.map(({ enrollment, client }) => ({ ...enrollment, client }));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async deleteEnrollment(clientId: number, programId: number): Promise<boolean> {
    const result = await db
      .delete(enrollments)
      .where(
        and(
          eq(enrollments.clientId, clientId),
          eq(enrollments.programId, programId)
        )
      )
      .returning({ id: enrollments.id });
    
    return result.length > 0;
  }
  
  // Client with details operations
  async getClientDetails(clientId: number): Promise<ClientWithDetails | undefined> {
    const client = await this.getClientById(clientId);
    if (!client) return undefined;
    
    const clientEnrollments = await this.getEnrollmentsByClientId(clientId);
    
    // Get visits with program details
    const visitsResult = await db
      .select({
        visit: visits,
        program: programs,
      })
      .from(visits)
      .innerJoin(programs, eq(visits.programId, programs.id))
      .where(eq(visits.clientId, clientId));
    
    const clientVisits = visitsResult.map(({ visit, program }) => ({ ...visit, program }));
    
    // Get notes with program details (if applicable)
    const notesResult = await db
      .select({
        note: notes,
        program: programs,
      })
      .from(notes)
      .leftJoin(programs, eq(notes.programId, programs.id))
      .where(eq(notes.clientId, clientId));
    
    const clientNotes = notesResult.map(({ note, program }) => ({ 
      ...note, 
      program: program || undefined 
    }));
    
    return {
      ...client,
      enrollments: clientEnrollments,
      visits: clientVisits,
      notes: clientNotes,
    };
  }

  async getClientWithEnrollments(clientId: number): Promise<ClientWithEnrollments | undefined> {
    const client = await this.getClientById(clientId);
    if (!client) return undefined;
    
    const clientEnrollments = await this.getEnrollmentsByClientId(clientId);
    
    return {
      ...client,
      enrollments: clientEnrollments,
    };
  }
  
  // Visit operations
  async getVisitsByClientId(clientId: number): Promise<Visit[]> {
    return db.select().from(visits).where(eq(visits.clientId, clientId));
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const [newVisit] = await db.insert(visits).values(visit).returning();
    return newVisit;
  }
  
  // Note operations
  async getNotesByClientId(clientId: number): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.clientId, clientId));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }
  
  // Dashboard data
  async getProgramsWithEnrollmentCount(): Promise<ProgramWithEnrollments[]> {
    const programList = await this.getPrograms();
    
    const enrollmentCounts = await db
      .select({
        programId: enrollments.programId,
        count: sql<number>`count(*)`,
      })
      .from(enrollments)
      .groupBy(enrollments.programId);
    
    const enrollmentCountMap = new Map<number, number>();
    enrollmentCounts.forEach(({ programId, count }) => {
      enrollmentCountMap.set(programId, count);
    });
    
    return programList.map(program => ({
      ...program,
      enrollmentCount: enrollmentCountMap.get(program.id) || 0,
    }));
  }
}

export const storage = new DatabaseStorage();