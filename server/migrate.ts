import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { createHashedPassword } from "./auth";
import * as schema from "../shared/schema";

// Enable WebSocket for neon
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for database migrations");
  }

  console.log("Starting database setup...");
  
  // Create a database pool
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Create tables directly
  console.log("Creating tables...");
  
  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  // Create programs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS programs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      required_info TEXT[] NOT NULL
    );
  `);
  
  // Create clients table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      client_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      email TEXT,
      emergency_contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  // Create enrollments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      program_id INTEGER NOT NULL REFERENCES programs(id),
      enroll_date TIMESTAMP NOT NULL DEFAULT NOW(),
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      symptom_severity TEXT,
      risk_level TEXT,
      follow_up_required BOOLEAN DEFAULT FALSE,
      UNIQUE(client_id, program_id)
    );
  `);
  
  // Create visits table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      program_id INTEGER NOT NULL REFERENCES programs(id),
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      doctor TEXT NOT NULL,
      purpose TEXT NOT NULL
    );
  `);
  
  // Create notes table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      program_id INTEGER REFERENCES programs(id),
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  
  console.log("Tables created!");

  // Seed admin user
  try {
    const hashedPassword = await createHashedPassword("admin123");
    
    await pool.query(
      `INSERT INTO users (username, password, name, email, role) 
       VALUES ('admin', $1, 'Administrator', 'admin@example.com', 'admin')
       ON CONFLICT (username) DO NOTHING`,
      [hashedPassword]
    );
    
    console.log("Default admin user created or already exists.");
    
    // Seed initial programs if needed
    await pool.query(
      `INSERT INTO programs (name, code, description, required_info)
       VALUES 
       ('Tuberculosis (TB)', 'TB', 'Prevention and treatment of tuberculosis', ARRAY['testResults', 'medication', 'symptoms', 'followup']),
       ('Malaria', 'MALARIA', 'Prevention and treatment of malaria', ARRAY['testResults', 'medication', 'symptoms']),
       ('HIV/AIDS', 'HIV', 'HIV treatment and management program', ARRAY['testResults', 'medication', 'followup']),
       ('Maternal Health', 'MATERNAL', 'Prenatal and postnatal care', ARRAY['testResults', 'followup'])
       ON CONFLICT (code) DO NOTHING`
    );
    
    console.log("Initial programs created or already exist.");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }

  // Close the pool
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});