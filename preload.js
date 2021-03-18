window.addEventListener('DOMContentLoaded', () => {
  setInterval(function () {
    fetch('http://127.0.0.1:6721/session')
      .then((response) => response.json())
      .then((data) => renderHTML(data));
  }, 1000);
});

function zeroPaddingString(n) {
  if (n < 10) {
    return '0' + n;
  } else {
    return n;
  }
}

/**
 * render HTML with session API Data
 * @param {*} sessionData see https://github.com/Ajedi32/echovr_api_docs
 */
function renderHTML(sessionData) {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  const sessionid = sessionData.sessionid;
  replaceText('sessionid', sessionid);

  const game_status = sessionData.game_status;

  if (!game_status) {
    return;
  }

  const game_clock_display = sessionData.game_clock_display.split('.')[0];
  replaceText('game-clock-display', game_clock_display);

  const orange_points = sessionData.orange_points;
  replaceText('orange-points', zeroPaddingString(orange_points));

  const blue_points = sessionData.blue_points;
  replaceText('blue-points', zeroPaddingString(blue_points));

  const orange_team = sessionData.teams[1].players.map((p) => {
    return {
      level: p.level,
      name: p.name,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      stuns: p.stats.stuns,
      ping: p.ping
    };
  });

  for (let i = 0; i < 5; i++) {
    let p = orange_team[i];
    if (!p) p = { level: '', name: '', point: '', assists: '', assists: '', saves: '', stuns: '', ping: '' };
    document.getElementById('o-lv-' + i).innerText = p.level;
    document.getElementById('o-nm-' + i).innerText = p.name;
    document.getElementById('o-pt-' + i).innerText = p.point;
    document.getElementById('o-as-' + i).innerText = p.assists;
    document.getElementById('o-sv-' + i).innerText = p.saves;
    document.getElementById('o-st-' + i).innerText = p.stuns;
    document.getElementById('o-pn-' + i).innerText = p.ping;
  }

  const blue_team = sessionData.teams[0].players.map((p) => {
    return {
      level: p.level,
      name: p.name,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      stuns: p.stats.stuns,
      ping: p.ping
    };
  });

  console.log(blue_team);

  for (let i = 0; i < 5; i++) {
    let p = blue_team[i];
    if (!p) p = { level: '', name: '', point: '', assists: '', assists: '', saves: '', stuns: '', ping: '' };
    document.getElementById('b-lv-' + i).innerText = p.level;
    document.getElementById('b-nm-' + i).innerText = p.name;
    document.getElementById('b-pt-' + i).innerText = p.point;
    document.getElementById('b-as-' + i).innerText = p.assists;
    document.getElementById('b-sv-' + i).innerText = p.saves;
    document.getElementById('b-st-' + i).innerText = p.stuns;
    document.getElementById('b-pn-' + i).innerText = p.ping;
  }


}
