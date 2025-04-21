import path from "node:path";
import url from "node:url";
import { defineConfig } from "vite";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
	build: {
		target: "esnext",
		rollupOptions: {
			input: {
				main: path.resolve(dirname, "index.html"),
				newRecipe: path.resolve(dirname, "recipes/new/index.html"),
			},
		},
	},
});
