// This file handles all of the server-side logic for the application.

import fs from "node:fs/promises";

// Server (https://expressjs.com/)
import express from "express";

// Parsing forms sent from the client
import formidable from "formidable";

// Seamless integration for Express with Vite during development
import ViteExpress from "vite-express";

// Interacting with our database
import { neon } from "@neondatabase/serverless";

// Uploading and storing images
import { put } from "@vercel/blob";

const app = express();
const router = express.Router();

// Connect to the database
const sql = neon(process.env.DATABASE_URL);

// Prefix all routes with "/api"
app.use("/api", router);

/**
 * Corresponds to: GET /api/recipes
 * Returns a list of all recipes in the database to be displayed on the homepage
 */
router.get("/recipes", async (req, res) => {
	const recipes = await sql`SELECT * FROM recipes`;

	// Send the recipes back to the client as JSON
	res.json(recipes);
});

/**
 * Corresponds to: POST /api/recipes
 * Creates a new recipe in the database and redirects to the homepage
 */
router.post("/recipes", async (req, res) => {
	const form = formidable();
	const [fields, files] = await form.parse(req);

	const image = files.image[0];

	// Convert textarea inputs into an array by splitting on newlines and trimming
	// any trailing/leading whitespace
	const ingredients = fields.ingredients[0].split("\n").map((i) => i.trim());
	const instructions = fields.instructions[0].split("\n").map((i) => i.trim());

	// Read the uploaded file into a buffer
	const buffer = await fs.readFile(image.filepath);

	// Upload the image to our blob storage and get the URL to be stored in the
	// database
	const blob = await put(image.originalFilename, buffer, {
		access: "public",
	});

	// Insert the recipe into the database
	await sql`
		INSERT INTO recipes (name, description, image_url, ingredients, instructions)
		VALUES (${fields.name[0]}, ${fields.description[0]}, ${blob.url}, ${ingredients}, ${instructions})
	`;

	// Redirect to the homepage
	res.redirect(303, "/");
});

// Starts the server and listens on port 5173
// http://localhost:5173
ViteExpress.listen(app, 5173, () => {
	console.log("Server is listening on port 5173.");
});

// We're exporting so Vercel can reuse it
export default app;
