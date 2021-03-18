window.addEventListener('DOMContentLoaded', () => {
  setInterval(function () {
    fetch('http://127.0.0.1:6721/session')
      .then((response) => response.json())
      .then((data) => renderHTML(data));
  }, 1000);
});

/**
 * render HTML with session API Data
 * @param {*} sessionData see https://github.com/Ajedi32/echovr_api_docs
 */
function renderHTML(sessionData) {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  console.log(sessionData);

  const isPlaying = sessionData.game_status === 'playing';
  const game_clock_display = sessionData.game_clock_display.split('.')[0];
  const orange_points = sessionData.orange_points;
  const blue_points = sessionData.blue_points;
  const orange_team = sessionData.teams[1].players.map((p) => { return {
    level: p.level,
    name: p.name,
    point: p.stats.points,
    assists: p.stats.assists,
    saves: p.stats.saves,
    stuns: p.stats.stuns,
    ping: p.ping
  };});
  const blue_team = sessionData.teams[0].players.map((p) => { return {
    level: p.level,
    name: p.name,
    point: p.stats.points,
    assists: p.stats.assists,
    saves: p.stats.saves,
    stuns: p.stats.stuns,
    ping: p.ping
  };});

  replaceText(
    'game-clock-display',
    sessionData.game_clock_display.split('.')[0]
  );
}
