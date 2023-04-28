const form = document.querySelector('form');
const input = document.querySelector('#pokemon-name');
const result = document.querySelector('#result');
const filter = document.querySelector('#type-filter');
const seeAllButton = document.querySelector('#see-all');

const API_URL = 'https://pokeapi.co/api/v2/pokemon';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const pokemonName = input.value.trim().toLowerCase();

  fetch(`${API_URL}/${pokemonName}`)
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
        types: data.types.map(type => type.type.name),
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map(ability => ability.ability.name).join(', '),
        stats: data.stats.map(stat => {
          return { name: stat.stat.name, value: stat.base_stat };
        })
      };
      displayPokemon(pokemon);
    })
    .catch(error => {
      result.innerHTML = `<p id="error">${error.message}</p>`;
    });
});

filter.addEventListener('change', () => {
  const selectedType = filter.value;
  displayPokemonList(selectedType);
});

seeAllButton.addEventListener('click', () => {
  displayPokemonList('all');
  filter.value = 'all';
});

function displayPokemon(pokemon) {
  result.innerHTML = `
    <div class="pokemon">
      <img src="${pokemon.image}" alt="${pokemon.name}">
      <h2>${pokemon.name}</h2>
      <p>ID: ${pokemon.id}</p>
      <p>Type: ${pokemon.types.join(', ')}</p>
      <p>Height: ${pokemon.height / 10} m</p>
      <p>Weight: ${pokemon.weight / 10} kg</p>
      <p>Abilities: ${pokemon.abilities}</p>
      <div class="stats">
        ${pokemon.stats.map(stat => `<p class="${getStatClass(stat.name)}">${stat.name}: ${stat.value}</p>`).join('')}
      </div>
    </div>
  `;
}

function getStatClass(statName) {
  switch (statName) {
    case 'hp':
      return 'green';
    case 'attack':
      return 'red';
    case 'defense':
      return 'blue';
    case 'special-attack':
      return 'purple';
    case 'special-defense':
      return 'orange';
    case 'speed':
      return 'light-blue';
    default:
      return '';
  }
}



function displayPokemonList(selectedType) {
  fetch(`${API_URL}?limit=151`)
    .then(response => response.json())
    .then(data => {
      const pokemonList = data.results.map((result, index) => {
        return {
          name: result.name,
          id: index + 1,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
          url: result.url,
          types: []
        };
      });

      const pokemonPromises = pokemonList.map(pokemon => {
        return fetch(pokemon.url).then(response => response.json());
      });

      Promise.all(pokemonPromises)
        .then(results => {
          results.forEach((data, index) => {
            pokemonList[index].types = data.types.map(type => type.type.name);
          });
          const filteredPokemonList = filterPokemonByType(pokemonList, selectedType);
          const pokemonHTML = filteredPokemonList
            .map(pokemon => {
              return `
                <div class="pokemon">
                  <img src="${pokemon.image}" alt="${pokemon.name}">
                  <h2>${pokemon.name}</h2>
                  <p>ID: ${pokemon.id}</p>
                  <p>Type: ${pokemon.types.join(', ')}</p>
                </div>
              `;
            })
            .join('');
          result.innerHTML = pokemonHTML;
        })
        .catch(error => {
          result.innerHTML = `<p id="error">${error.message}</p>`;
        });
    })
    .catch(error => {
      result.innerHTML = `<p id="error">${error.message}</p>`;
    });
}

function filterPokemonByType(pokemonList, selectedType) {
  if (selectedType === 'all') {
    return pokemonList;
  }
  return pokemonList.filter(pokemon => pokemon.types.includes(selectedType));
}
