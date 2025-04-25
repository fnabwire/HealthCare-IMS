import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProgramSchema,
  insertClientSchema,
  insertEnrollmentSchema,
  insertNoteSchema,
  insertVisitSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // API prefix
  const API_PREFIX = "/api";
  
  // Health check
  app.get(`${API_PREFIX}/health`, (_req, res) => {
    res.json({ status: "ok" });
  });
  
  // Program routes
  app.get(`${API_PREFIX}/programs`, isAuthenticated, async (_req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get(`${API_PREFIX}/programs/stats`, isAuthenticated, async (_req, res) => {
    try {
      const programsWithStats = await storage.getProgramsWithEnrollmentCount();
      res.json(programsWithStats);
    } catch (error) {
      console.error("Error fetching program stats:", error);
      res.status(500).json({ message: "Failed to fetch program statistics" });
    }
  });
  
  app.get(`${API_PREFIX}/programs/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      const program = await storage.getProgramById(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });
  
  app.post(`${API_PREFIX}/programs`, isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProgramSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Check if program code already exists
      const existingProgram = await storage.getProgramByCode(validatedData.data.code);
      if (existingProgram) {
        return res.status(409).json({ message: "Program code already exists" });
      }
      
      const newProgram = await storage.createProgram(validatedData.data);
      res.status(201).json(newProgram);
    } catch (error) {
      console.error("Error creating program:", error);
      res.status(500).json({ message: "Failed to create program" });
    }
  });
  
  // Client routes
  app.get(`${API_PREFIX}/clients`, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      
      if (search) {
        const clients = await storage.searchClients(search);
        return res.json(clients);
      }
      
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  
  app.get(`${API_PREFIX}/clients/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClientById(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });
  
  app.get(`${API_PREFIX}/clients/:id/details`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const clientDetails = await storage.getClientDetails(id);
      if (!clientDetails) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(clientDetails);
    } catch (error) {
      console.error("Error fetching client details:", error);
      res.status(500).json({ message: "Failed to fetch client details" });
    }
  });
  
  app.post(`${API_PREFIX}/clients`, isAuthenticated, async (req, res) => {
    try {
      // Create a custom schema for client creation that makes clientId optional
      const createClientSchema = insertClientSchema.partial({ clientId: true });
      
      const validatedData = createClientSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newClient = await storage.createClient(validatedData.data);
      res.status(201).json(newClient);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });
  
  // Enrollment routes
  app.get(`${API_PREFIX}/enrollments`, async (_req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });
  
  app.get(`${API_PREFIX}/clients/:clientId/enrollments`, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClientById(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const enrollments = await storage.getEnrollmentsByClientId(clientId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching client enrollments:", error);
      res.status(500).json({ message: "Failed to fetch client enrollments" });
    }
  });
  
  app.post(`${API_PREFIX}/enrollments`, isAuthenticated, async (req, res) => {
    try {
      // Create a custom schema for enrollment that handles enrollDate as both string and Date
      const createEnrollmentSchema = z.object({
        clientId: z.number(),
        programId: z.number(),
        enrollDate: z.union([z.string(), z.date()]).transform(val => 
          typeof val === 'string' ? new Date(val) : val
        ),
        notes: z.string().optional(),
        status: z.string().optional(),
        symptomSeverity: z.string().optional(),
        riskLevel: z.string().optional(),
        followUpRequired: z.boolean().optional()
      });
      
      const validatedData = createEnrollmentSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Validate client exists
      const client = await storage.getClientById(validatedData.data.clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Validate program exists
      const program = await storage.getProgramById(validatedData.data.programId);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      try {
        const newEnrollment = await storage.createEnrollment(validatedData.data);
        res.status(201).json(newEnrollment);
      } catch (error) {
        if (error instanceof Error && error.message.includes("already enrolled")) {
          return res.status(409).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });
  
  app.delete(`${API_PREFIX}/clients/:clientId/programs/:programId`, isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const programId = parseInt(req.params.programId);
      
      if (isNaN(clientId) || isNaN(programId)) {
        return res.status(400).json({ message: "Invalid client ID or program ID" });
      }
      
      const success = await storage.deleteEnrollment(clientId, programId);
      if (!success) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      res.status(500).json({ message: "Failed to delete enrollment" });
    }
  });
  
  // Visit routes
  app.get(`${API_PREFIX}/clients/:clientId/visits`, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const visits = await storage.getVisitsByClientId(clientId);
      res.json(visits);
    } catch (error) {
      console.error("Error fetching client visits:", error);
      res.status(500).json({ message: "Failed to fetch client visits" });
    }
  });
  
  app.post(`${API_PREFIX}/visits`, isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVisitSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newVisit = await storage.createVisit(validatedData.data);
      res.status(201).json(newVisit);
    } catch (error) {
      console.error("Error creating visit:", error);
      res.status(500).json({ message: "Failed to create visit" });
    }
  });
  
  // Note routes
  app.get(`${API_PREFIX}/clients/:clientId/notes`, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const notes = await storage.getNotesByClientId(clientId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching client notes:", error);
      res.status(500).json({ message: "Failed to fetch client notes" });
    }
  });
  
  app.post(`${API_PREFIX}/notes`, isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNoteSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const errorMessage = fromZodError(validatedData.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newNote = await storage.createNote(validatedData.data);
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });
  
  // Dashboard stats
  app.get(`${API_PREFIX}/stats`, async (_req, res) => {
    try {
      const clients = await storage.getClients();
      const programs = await storage.getPrograms();
      const enrollments = await storage.getEnrollments();
      
      const stats = {
        totalClients: clients.length,
        activePrograms: programs.length,
        newEnrollments: enrollments.length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
