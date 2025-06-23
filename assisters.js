const seasonSelect = document.getElementById('seasonSelect');
const top5List = document.getElementById('top5List');

const PROXY_URL = 'https://nba-backend-5fx5.onrender.com/';

// Populate season options from 2000 to 2025
function populateSeasons(start = 2000, end = new Date().getFullYear()) {
  for (let year = end; year >= start; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    seasonSelect.appendChild(option);
  }
}

async function fetchAllPlayerData(season) {
  let players = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(`${PROXY_URL}/playerdatatotals?season=${season}&pageSize=100&pageNumber=${page}`);
      if (res.status === 404) break;
      const data = await res.json();
      if (data.length === 0) break;
      players = players.concat(data);
      page++;
    } catch (e) {
      console.error(e);
      break;
    }
  }

  return players;
}

function renderTop5(players) {
  top5List.innerHTML = '';
  players.forEach((p, index) => {
    const li = document.createElement('li');
    li.className = 'player-item';
    li.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="name">${p.playerName}</span>
      <span class="team">${p.team}</span>
      <span class="assists">${p.assists} assists</span>`;
    top5List.appendChild(li);
  });
}

async function updateTop5(season) {
  const allData = await fetchAllPlayerData(season);
  const valid = allData.filter(p => typeof p.assists === 'number' && !isNaN(p.assists));
  const sorted = valid.sort((a, b) => b.assists - a.assists).slice(0, 10);
  renderTop5(sorted);
}

populateSeasons(2000, 2025);

// Fetch data for initial season (optional, to show something by default)
updateTop5(new Date().getFullYear());

seasonSelect.addEventListener('change', () => {
  updateTop5(seasonSelect.value);
});

document.getElementById('menuBtn')?.addEventListener('click', () => {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
});
