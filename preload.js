const PIXI = require('pixi.js');
const ARENA_WIDTH = 640; // width of echo-arena.png
const ARENA_HEIGHT = 258; // height of echo-arena.png
const CENTER_X = ARENA_WIDTH / 2;
const CENTER_Y = ARENA_HEIGHT / 2;

const app = new PIXI.Application({
  width: ARENA_WIDTH,
  height: ARENA_HEIGHT,
  antialias: true,
  transparent: false,
});

app.loader.add('echo-arena.png').load(setup);

function setup() {
  let map = new PIXI.Sprite(app.loader.resources['echo-arena.png'].texture);
  app.stage.addChild(map);
}

let fetchURL = 'http://127.0.0.1:6721/session';

require('electron').ipcRenderer.on('settingURL', (event, message) => {
  fetchURL = message;
  console.log('fetchURL: ' + fetchURL);
});

window.addEventListener('DOMContentLoaded', () => {
  setInterval(function () {
    fetch(fetchURL)
      .then((response) => response.json())
      .then((data) => renderHTML(data))
      .catch(console.error);
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
  if (!game_status) {
    // if it isn't in game. not render.
    return;
  }

  // SCORE BOARD
  const game_clock_display = sessionData.game_clock_display.split('.')[0];
  replaceText('game-clock-display', game_clock_display);

  const orange_points = sessionData.orange_points;
  replaceText('orange-points', zeroPaddingString(orange_points));

  const blue_points = sessionData.blue_points;
  replaceText('blue-points', zeroPaddingString(blue_points));

  // ORANGE TEAM STATS
  const empty_player = {
    no: '',
    name: '',
    possession_time: '',
    shots_taken: '',
    point: '',
    assists: '',
    assists: '',
    saves: '',
    stuns: '',
    ping: '',
    level: '',
  };

  const orange_team = sessionData.teams[1].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      name: p.name,
      possession_time: Math.round(p.stats.possession_time),
      shots_taken: p.stats.shots_taken,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      stuns: p.stats.stuns,
      ping: p.ping,
      level: p.level,
      team: 'ORANGE',
    };
  });

  const MAX_PLAYERS = 5;
  for (let i = 0; i < MAX_PLAYERS; i++) {
    let p = orange_team[i];
    if (!p) p = empty_player;
    document.getElementById('o-no-' + i).innerText = p.no;
    document.getElementById('o-nm-' + i).innerText = p.name;
    document.getElementById('o-ps-' + i).innerText = p.possession_time;
    document.getElementById('o-sh-' + i).innerText = p.shots_taken;
    document.getElementById('o-pt-' + i).innerText = p.point;
    document.getElementById('o-as-' + i).innerText = p.assists;
    document.getElementById('o-sv-' + i).innerText = p.saves;
    document.getElementById('o-st-' + i).innerText = p.stuns;
    document.getElementById('o-pn-' + i).innerText = p.ping;
    document.getElementById('o-lv-' + i).innerText = p.level;
  }

  // BLUE TEAM STATS
  const blue_team = sessionData.teams[0].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      name: p.name,
      possession_time: Math.round(p.stats.possession_time),
      shots_taken: p.stats.shots_taken,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      stuns: p.stats.stuns,
      ping: p.ping,
      level: p.level,
      team: 'BLUE',
    };
  });
  for (let i = 0; i < MAX_PLAYERS; i++) {
    let p = blue_team[i];
    if (!p) p = empty_player;
    document.getElementById('b-no-' + i).innerText = p.no;
    document.getElementById('b-nm-' + i).innerText = p.name;
    document.getElementById('b-ps-' + i).innerText = p.possession_time;
    document.getElementById('b-sh-' + i).innerText = p.shots_taken;
    document.getElementById('b-pt-' + i).innerText = p.point;
    document.getElementById('b-as-' + i).innerText = p.assists;
    document.getElementById('b-sv-' + i).innerText = p.saves;
    document.getElementById('b-st-' + i).innerText = p.stuns;
    document.getElementById('b-pn-' + i).innerText = p.ping;
    document.getElementById('b-lv-' + i).innerText = p.level;
  }
}

let graphicses = [];
let texts = [];

/**
 * render Map with session API Data
 * @param {*} sessionData
 * @returns
 */
function renderMap(sessionData) {
  const game_status = sessionData.game_status;
  if (!game_status) {
    // if it isn't in game. not render.
    return;
  }

  graphicses.forEach((g) => {
    g.clear();
  });
  graphicses.clear = [];
  texts.forEach((t) => {
    t.destroy();
  });
  texts = [];

  // position : [x, y, z]
  // <- +z, A -x, V +x. -> -z
  // Areana z: -50 ~ + 50,  x -20 ~ +20
  const SCALE = 8; // scale of position to pixi
  const TEXT_SIZE = 18;
  const TEXT_OFFSET = 1;

  // ORANGE TEAM
  const orange_team_players = sessionData.teams[1].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      possession: p.possession,
      position: p.head.position,
      team: 'ORANGE',
    };
  });
  // BLUE TEAM
  const blue_team_players = sessionData.teams[0].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      possession: p.possession,
      position: p.head.position,
      team: 'BLUE',
    };
  });

  // TEAM PLAYERS
  const team_players = orange_team_players.concat(blue_team_players);
  for (const p of team_players) {
    const p_x = CENTER_X - p.position[2] * SCALE;
    const p_y = CENTER_Y + p.position[0] * SCALE;

    const graphics = new PIXI.Graphics();
    if (p.possession) {
      graphics.lineStyle(5, 0xffffff);
    } else {
      graphics.lineStyle(0);
    }

    if (p.team === 'ORANGE') {
      graphics.beginFill(0xff8b00, 1);
    } else {
      graphics.beginFill(0x009afe, 1);
    }

    graphics.drawCircle(p_x, p_y, 16);
    graphics.endFill();
    app.stage.addChild(graphics);
    graphicses.push(graphics);

    const text = new PIXI.Text(p.no, {
      fontFamily: 'Arial',
      fontSize: TEXT_SIZE,
      fill: 0xffffff,
      align: 'center',
    });
    text.x = p_x - TEXT_SIZE / 2 - TEXT_OFFSET;
    text.y = p_y - TEXT_SIZE / 2 - TEXT_OFFSET;
    app.stage.addChild(text);
    texts.push(text);
  }

  // DISC
  const disc_position = sessionData.disc.position; // [x, y, z]
  const disc_x = CENTER_X - disc_position[2] * SCALE;
  const disc_y = CENTER_Y + disc_position[0] * SCALE;
  const graphics = new PIXI.Graphics();
  graphics.lineStyle(0);
  graphics.beginFill(0xffffff, 1);
  graphics.drawCircle(disc_x, disc_y, 8);
  graphics.endFill();
  app.stage.addChild(graphics);
  graphicses.push(graphics);
}
