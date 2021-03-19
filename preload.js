const PIXI = require('pixi.js');
const app = new PIXI.Application({ width: 516, height: 256 });

window.addEventListener('DOMContentLoaded', () => {
  setInterval(function () {
    fetch('http://127.0.0.1:6721/session')
      .then((response) => response.json())
      .then((data) => renderHTML(data));
  }, 1000);

  document.getElementById('map').appendChild(app.view);
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
  document.getElementById('container').style.display = 'block'; // show Table

  renderScoreborad(sessionData);
  renderMap(sessionData);
}


/**
 * render Scoreboard with session API Data
 * @param {*} sessionData 
 * @returns 
 */
function renderScoreborad(sessionData) {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  const sessionid = sessionData.sessionid;
  replaceText('sessionid', sessionid);

  const game_status = sessionData.game_status;
  if (!game_status) { // if it isn't in game. not render.
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
      no: zeroPaddingString(p.number),
      name: p.name,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      stuns: p.stats.stuns,
      ping: p.ping,
      level: p.level
    };
  });
  for (let i = 0; i < 5; i++) {
    let p = orange_team[i];
    if (!p) p = { no: '', name: '', point: '', assists: '', assists: '', saves: '', stuns: '', ping: '', level: '' };
    document.getElementById('o-no-' + i).innerText = p.no;
    document.getElementById('o-nm-' + i).innerText = p.name;
    document.getElementById('o-pt-' + i).innerText = p.point;
    document.getElementById('o-as-' + i).innerText = p.assists;
    document.getElementById('o-sv-' + i).innerText = p.saves;
    document.getElementById('o-st-' + i).innerText = p.stuns;
    document.getElementById('o-pn-' + i).innerText = p.ping;
    document.getElementById('o-lv-' + i).innerText = p.level;
  }

  const blue_team = sessionData.teams[0].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      name: p.name,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      stuns: p.stats.stuns,
      ping: p.ping,
      level: p.level
    };
  });
  for (let i = 0; i < 5; i++) {
    let p = blue_team[i];
    if (!p) p = { no: '', name: '', point: '', assists: '', assists: '', saves: '', stuns: '', ping: '', level: '' };
    document.getElementById('b-no-' + i).innerText = p.no;
    document.getElementById('b-nm-' + i).innerText = p.name;
    document.getElementById('b-pt-' + i).innerText = p.point;
    document.getElementById('b-as-' + i).innerText = p.assists;
    document.getElementById('b-sv-' + i).innerText = p.saves;
    document.getElementById('b-st-' + i).innerText = p.stuns;
    document.getElementById('b-pn-' + i).innerText = p.ping;
    document.getElementById('b-lv-' + i).innerText = p.level;

  }

}


/**
   * render Map with session API Data
   * @param {*} sessionData 
   * @returns 
   */
function renderMap(sessionData) {

  const game_status = sessionData.game_status;
  if (!game_status) { // if it isn't in game. not render.
    return;
  }

  const disc_position = sessionData.disc.position; // [x, y, z]
  const orange_team_players = sessionData.teams[1].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      position: p.head.position
    };
  });
  const blue_team_players = sessionData.teams[0].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      position: p.head.position
    };
  });


}
