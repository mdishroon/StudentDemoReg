// Import our styles (stylesheet imports are handled by Vite, normally this
// doesn't work in browsers).
import "./style.css";

const recipeGrid = document.querySelector(".recipes");

// Make a request to our server to get the recipes
const response = await fetch("/api/recipes");

// Since we sent our recipes as JSON on the server, we need to parse it as such
const recipes = await response.json();

for (const recipe of recipes) {
	let ingredients = "";
	let instructions = "";

	for (const ingr of recipe.ingredients) {
		ingredients += `<li>${ingr}</li>`;
	}

	for (const step of recipe.instructions) {
		instructions += `<li><p>${step}</p></li>`;
	}

	// Note: this is a pretty awkward way to render html. Normally you would use a
	// templating engine or a framework like React or Vue; 9/10 times you don't
	// directly edit an element's innerHTML because it could lead to XSS attacks.
	recipeGrid.innerHTML += `
		<div class="card">
			<img class="image" src="${recipe.image_url}" alt="${recipe.name}" />

			<hgroup class="header">
				<h2 class="title">${recipe.name}</h3>
				<p class="description">${recipe.description}</p>
			</hgroup>

			<div role="separator"></div>

			<div class="content-container">
				<div class="content">
					<div class="info ingredients">
						<h3>Ingredients</h3>
						<ul class="list">${ingredients}</ul>
					</div>

					<div class="info instructions">
						<h3>Instructions</h3>
						<ol class="list">${instructions}</ol>
					</div>
				</div>

				<div class="scroll-shadow"></div>
			</div>
		</div>
	`;
}
