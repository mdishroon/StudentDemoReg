import express from 'express';
import ViteExpress from 'vite-express';
import { sql } from '@neondatabase/serverless';
import formidable from 'formidable';

const app = express();
const PORT = process.env.PORT || 3000;

// API Routes
const router = express.Router();

// GET all demo time slots
router.get("/demo-slots", async (req, res) => {
  try {
    const slots = await sql`
      SELECT * FROM demo_slots 
      ORDER BY time ASC
    `;
    res.json(slots);
  } catch (err) {
    console.error("Error fetching demo slots:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all students
router.get("/students", async (req, res) => {
  try {
    const students = await sql`
      SELECT s.*, ds.time as demo_time
      FROM students s
      LEFT JOIN demo_slots ds ON s.demo_slot_id = ds.id
      ORDER BY ds.time ASC
    `;
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Register a student for a demo
router.post("/students", async (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(400).json({ error: "Form parsing error" });
    }

    try {
      const {
        fullName,
        email,
        studentId,
        number,
        projectDescription,
        demoTimeId
      } = fields;

      // Validation
      if (
        !fullName || !email || !studentId || !number ||
        !projectDescription || !demoTimeId
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
      const idRegex = /^\d{8}$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

      if (!nameRegex.test(fullName)) {
        return res.status(400).json({ error: "Name must include first and last name using letters only" });
      }
      if (!idRegex.test(studentId)) {
        return res.status(400).json({ error: "Student ID must be exactly 8 digits" });
      }
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      if (!phoneRegex.test(number)) {
        return res.status(400).json({ error: "Phone number must be in the format 999-999-9999" });
      }

      // Check if the demo slot is available (not at capacity)
      const slotCheck = await sql`
        SELECT * FROM demo_slots WHERE id = ${demoTimeId}
      `;
      
      if (slotCheck.length === 0) {
        return res.status(400).json({ error: "Invalid demo time slot" });
      }
      
      if (slotCheck[0].booked >= slotCheck[0].capacity) {
        return res.status(400).json({ error: "This time slot is full. Please select another time." });
      }

      // Insert the student into the database
      await sql`
        INSERT INTO students (student_id, name, email, phone_number, project_name, demo_slot_id)
        VALUES (${studentId}, ${fullName}, ${email}, ${number}, ${projectDescription}, ${demoTimeId})
      `;
      
      // Update the booked count for the demo slot
      await sql`
        UPDATE demo_slots 
        SET booked = booked + 1
        WHERE id = ${demoTimeId}
      `;

      res.status(201).json({ message: "Student registered successfully" });
    } catch (err) {
      console.error("Error in POST /students:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
});

app.use("/api", router);

// Database initialization - create tables if they don't exist
async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // Create demo_slots table
    await sql`
      CREATE TABLE IF NOT EXISTS demo_slots (
        id SERIAL PRIMARY KEY,
        time TIMESTAMP NOT NULL,
        capacity INTEGER DEFAULT 4,
        booked INTEGER DEFAULT 0
      )
    `;
    
    // Create students table
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(8) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone_number VARCHAR(12) NOT NULL,
        project_name TEXT NOT NULL,
        demo_slot_id INTEGER REFERENCES demo_slots(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Check if we need to add some initial demo slots
    const slotCount = await sql`SELECT COUNT(*) FROM demo_slots`;
    
    if (slotCount[0].count === '0') {
      // Add some default demo slots if none exist
      await sql`
        INSERT INTO demo_slots (time, capacity) VALUES
        ('2025-05-01 09:00:00', 4),
        ('2025-05-01 10:00:00', 4),
        ('2025-05-01 11:00:00', 4),
        ('2025-05-01 13:00:00', 4),
        ('2025-05-01 14:00:00', 4),
        ('2025-05-01 15:00:00', 4),
        ('2025-05-02 09:00:00', 4),
        ('2025-05-02 10:00:00', 4),
        ('2025-05-02 11:00:00', 4),
        ('2025-05-02 13:00:00', 4),
        ('2025-05-02 14:00:00', 4),
        ('2025-05-02 15:00:00', 4)
      `;
      console.log("Demo slots initialized");
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

// Start the server
ViteExpress.listen(app, PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initializeDatabase();
});

export default app;