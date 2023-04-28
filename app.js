const form = document.querySelector('form');
const input = document.querySelector('#pokemon-name');
const result = document.querySelector('#result');

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const pokemonName = input.value.trim().toLowerCase();

	fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Pokemon not found!');
			}
			return response.json();
		})
		.then(data => {
			const pokemon = {
				name: data.name,
				id: data.id,
				image: data.sprites.other['official-artwork'].front_default,
				type: data.types.map(type => type.type.name).join(', '),
				height: data.height,
				weight: data.weight,
				abilities: data.abilities.map(ability => ability.ability.name).join(', ')
			};

			result.innerHTML = `
				<div class="pokemon">
					<img src="${pokemon.image}" alt="${pokemon.name}">
					<h2>${pokemon.name}</h2>
					<p>ID: ${pokemon.id}</p>
					<p>Type: ${pokemon.type}</p>
					<p>Height: ${pokemon.height / 10} m</p>
					<p>Weight: ${pokemon.weight / 10} kg</p>
					<p>Abilities: ${pokemon.abilities}</p>
				</div>
			`;
		})
		.catch(error => {
			result.innerHTML = `<p id="error">${error.message}</p>`;
		});
});
