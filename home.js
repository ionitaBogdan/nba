const seasonSelect = document.getElementById('seasonSelect');

const PROXY_URL = 'https://nba-backend-5fx5.onrender.com';

// Populate season options from 2000 to 2025
function populateSeasonOptions(start = 2000, end = new Date().getFullYear()) {
  seasonSelect.innerHTML = '';
  for (let year = end; year >= start; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    seasonSelect.appendChild(option);
  }
}

async function fetchAllPlayerData(season) {
  let allPlayers = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    try {
      const res = await fetch(`${PROXY_URL}/playerdatatotals?season=${season}&pageSize=100&pageNumber=${page}`);
      
      if (res.status === 404) {
        hasMore = false;
        break;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.length === 0) {
        hasMore = false;
      } else {
        allPlayers = allPlayers.concat(data);
        page++;
      }
    } catch (err) {
      console.error(`Error on page ${page}:`, err);
      hasMore = false;
    }
  }

  return allPlayers;
}

async function fetchTopPlayerData(sortBy, season) {
  const allData = await fetchAllPlayerData(season);
  const validPlayers = allData.filter(p => typeof p[sortBy] === 'number' && !isNaN(p[sortBy]));
  const sorted = validPlayers.sort((a, b) => b[sortBy] - a[sortBy]);
  return sorted[0] || null;
}

function renderPlayerCard(player, statKey, elementId) {
  const container = document.getElementById(elementId);
  if (!player) {
    container.innerHTML = `<p class="text-red-500">No data for ${statKey}</p>`;
    return;
  }

  container.innerHTML = `
    <h3 class="text-lg font-bold">${player.playerName}</h3>
    <p><strong>Team:</strong> ${player.team}</p>
    <p><strong>${statKey}:</strong> ${player[statKey]}</p>`;
}

async function updateSeasonLeaders(season) {
  try {
    const [points, assists, steals] = await Promise.all([
      fetchTopPlayerData('points', season),
      fetchTopPlayerData('assists', season),
      fetchTopPlayerData('steals', season)
    ]);

    renderPlayerCard(points, 'points', 'topScorer');
    renderPlayerCard(assists, 'assists', 'topAssister');
    renderPlayerCard(steals, 'steals', 'topSteals');
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

populateSeasonOptions(2000, 2025);
seasonSelect.value = 2025;
updateSeasonLeaders(seasonSelect.value);

seasonSelect.addEventListener('change', () => {
  updateSeasonLeaders(seasonSelect.value);
});

document.getElementById('menuBtn')?.addEventListener('click', () => {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
});



