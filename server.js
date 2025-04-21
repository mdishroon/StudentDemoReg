// Remove this line if you're using form parsing with formidable
// app.use(express.json()); <- REMOVE this or only use for JSON-based routes

// Inside router.post:
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
		  demoDate,
		  demoTime
		} = fields;
  
		// Validation
		if (
		  !fullName || !email || !studentId || !number ||
		  !projectDescription || !demoDate || !demoTime
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
  
		const demo_slot = `${demoDate} ${demoTime}`;
  
		// Insert the student into the database
		await sql`
		  INSERT INTO students (student_id, name, email, phone_number, project_name, demo_slot)
		  VALUES (${studentId}, ${fullName}, ${email}, ${number}, ${projectDescription}, ${demo_slot})
		`;
  
		res.status(201).json({ message: "Student registered successfully" });
	  } catch (err) {
		console.error("Error in POST /students:", err);
		res.status(500).json({ error: "Server error" });
	  }
	});
  });

  // Starts the server and listens on port 5173
ViteExpress.listen(app, 5173, () => {
	console.log("Server is listening on port 5173.");
  });
  
  // We're exporting so Vercel can reuse it
  export default app;
  