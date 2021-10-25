const PIXI = require('pixi.js');
const ARENA_WIDTH = 640; // width of echo-arena.png
const ARENA_HEIGHT = 258; // height of echo-arena.png
const CENTER_X = ARENA_WIDTH / 2;
const CENTER_Y = ARENA_HEIGHT / 2;

// Set up PIXI.js app
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

// Sent Message Listener
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
  }, 500);

  document.getElementById('map').appendChild(app.view);
});

/**
 * Padding 0
 * @param {*} n
 * @returns
 */
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

  console.log(sessionData); // for debug

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
  if (sessionData.orange_round_score !== undefined)
    replaceText('orange-points-round', sessionData.orange_round_score);
  if (sessionData.blue_round_score !== undefined)
    replaceText('blue-points-round', sessionData.blue_round_score);

  const game_status = sessionData.game_status;
  if (
    !game_status ||
    game_status === 'round_over' ||
    game_status === 'post_match'
  ) {
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
    possession: false,
    stunned: false,
    possession_time: '',
    shots_taken: '',
    point: '',
    assists: '',
    saves: '',
    steals: '',
    stuns: '',
    ping: '',
    level: '',
  };

  const orange_team = sessionData.teams[1].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      name: p.name,
      possession: p.possession,
      stunned: p.stunned,
      possession_time: Math.round(p.stats.possession_time),
      shots_taken: p.stats.shots_taken,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      steals: p.stats.steals,
      stuns: p.stats.stuns,
      ping: p.ping,
      level: p.level,
      team: 'ORANGE',
    };
  });

  const MAX_PLAYERS = 5;
  const orange_total = {
    possession_time: 0,
    shots_taken: 0,
    point: 0,
    assists: 0,
    saves: 0,
    steals: 0,
    stuns: 0,
  };
  for (let i = 0; i < MAX_PLAYERS; i++) {
    let p = orange_team[i];
    if (!p) p = empty_player;
    document.getElementById('o-no-' + i).innerText = p.no;
    document.getElementById('o-nm-' + i).innerText = p.name;

    if (p.possession) {
      document.getElementById('o-no-' + i).classList.remove('nopossess');
      document.getElementById('o-no-' + i).classList.add('possess');
      document.getElementById('o-nm-' + i).classList.remove('nopossess');
      document.getElementById('o-nm-' + i).classList.add('possess');
    } else {
      document.getElementById('o-no-' + i).classList.remove('possess');
      document.getElementById('o-no-' + i).classList.add('nopossess');
      document.getElementById('o-nm-' + i).classList.remove('possess');
      document.getElementById('o-nm-' + i).classList.add('nopossess');
    }

    if (p.stunned) {
      document.getElementById('o-no-' + i).classList.remove('nostuned');
      document.getElementById('o-no-' + i).classList.add('stuned');
      document.getElementById('o-nm-' + i).classList.remove('nostuned');
      document.getElementById('o-nm-' + i).classList.add('stuned');
    } else {
      document.getElementById('o-no-' + i).classList.remove('stuned');
      document.getElementById('o-no-' + i).classList.add('nostuned');
      document.getElementById('o-nm-' + i).classList.remove('stuned');
      document.getElementById('o-nm-' + i).classList.add('nostuned');
    }

    document.getElementById('o-ps-' + i).innerText = p.possession_time;
    document.getElementById('o-as-' + i).innerText = p.assists;
    document.getElementById('o-sv-' + i).innerText = p.saves;
    document.getElementById('o-sl-' + i).innerText = p.steals;
    document.getElementById('o-st-' + i).innerText = p.stuns;
    document.getElementById('o-sh-' + i).innerText = p.shots_taken;
    document.getElementById('o-pt-' + i).innerText = p.point;
    document.getElementById('o-pn-' + i).innerText = p.ping;
    document.getElementById('o-lv-' + i).innerText = p.level;

    if (p !== empty_player) {
      orange_total.possession_time += parseInt(p.possession_time);
      orange_total.assists += parseInt(p.assists);
      orange_total.saves += parseInt(p.saves);
      orange_total.steals += parseInt(p.steals);
      orange_total.stuns += parseInt(p.stuns);
      orange_total.shots_taken += parseInt(p.shots_taken);
      orange_total.point += parseInt(p.point);
    }
  }

  // BLUE TEAM STATS
  const blue_team = sessionData.teams[0].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      name: p.name,
      possession_time: Math.round(p.stats.possession_time),
      possession: p.possession,
      stunned: p.stunned,
      shots_taken: p.stats.shots_taken,
      point: p.stats.points,
      assists: p.stats.assists,
      saves: p.stats.saves,
      steals: p.stats.steals,
      stuns: p.stats.stuns,
      ping: p.ping,
      level: p.level,
      team: 'BLUE',
    };
  });

  const blue_total = {
    possession_time: 0,
    shots_taken: 0,
    point: 0,
    assists: 0,
    saves: 0,
    steals: 0,
    stuns: 0,
  };
  for (let i = 0; i < MAX_PLAYERS; i++) {
    let p = blue_team[i];
    if (!p) p = empty_player;
    document.getElementById('b-no-' + i).innerText = p.no;
    document.getElementById('b-nm-' + i).innerText = p.name;

    if (p.possession) {
      document.getElementById('b-no-' + i).classList.remove('nopossess');
      document.getElementById('b-no-' + i).classList.add('possess');
      document.getElementById('b-nm-' + i).classList.remove('nopossess');
      document.getElementById('b-nm-' + i).classList.add('possess');
    } else {
      document.getElementById('b-no-' + i).classList.remove('possess');
      document.getElementById('b-no-' + i).classList.add('nopossess');
      document.getElementById('b-nm-' + i).classList.remove('possess');
      document.getElementById('b-nm-' + i).classList.add('nopossess');
    }

    if (p.stunned) {
      document.getElementById('b-no-' + i).classList.remove('nostuned');
      document.getElementById('b-no-' + i).classList.add('stuned');
      document.getElementById('b-nm-' + i).classList.remove('nostuned');
      document.getElementById('b-nm-' + i).classList.add('stuned');
    } else {
      document.getElementById('b-no-' + i).classList.remove('stuned');
      document.getElementById('b-no-' + i).classList.add('nostuned');
      document.getElementById('b-nm-' + i).classList.remove('stuned');
      document.getElementById('b-nm-' + i).classList.add('nostuned');
    }

    document.getElementById('b-ps-' + i).innerText = p.possession_time;
    document.getElementById('b-sh-' + i).innerText = p.shots_taken;
    document.getElementById('b-sv-' + i).innerText = p.saves;
    document.getElementById('b-sl-' + i).innerText = p.steals;
    document.getElementById('b-st-' + i).innerText = p.stuns;
    document.getElementById('b-pt-' + i).innerText = p.point;
    document.getElementById('b-as-' + i).innerText = p.assists;
    document.getElementById('b-pn-' + i).innerText = p.ping;
    document.getElementById('b-lv-' + i).innerText = p.level;

    if (p !== empty_player) {
      blue_total.possession_time += parseInt(p.possession_time);
      blue_total.assists += parseInt(p.assists);
      blue_total.saves += parseInt(p.saves);
      blue_total.steals += parseInt(p.steals);
      blue_total.stuns += parseInt(p.stuns);
      blue_total.shots_taken += parseInt(p.shots_taken);
      blue_total.point += parseInt(p.point);
    }
  }

  function percentage(target_num, other_num) {
    target_num = parseInt(target_num);
    other_num = parseInt(other_num);
    if (target_num <= 0 || target_num + other_num <= 0) return 0 + '%';
    return Math.round((target_num / (target_num + other_num)) * 100) + '%';
  }

  document.getElementById('o-nm-t').innerText = 'TOTAL';
  document.getElementById('o-ps-t').innerText = percentage(
    orange_total.possession_time,
    blue_total.possession_time
  );
  document.getElementById('o-sh-t').innerText = percentage(
    orange_total.shots_taken,
    blue_total.shots_taken
  );
  document.getElementById('o-sv-t').innerText = percentage(
    orange_total.saves,
    blue_total.saves
  );
  document.getElementById('o-sl-t').innerText = percentage(
    orange_total.steals,
    blue_total.steals
  );
  document.getElementById('o-st-t').innerText = percentage(
    orange_total.stuns,
    blue_total.stuns
  );
  document.getElementById('o-as-t').innerText = percentage(
    orange_total.assists,
    blue_total.assists
  );

  document.getElementById('b-nm-t').innerText = 'TOTAL';
  document.getElementById('b-ps-t').innerText = percentage(
    blue_total.possession_time,
    orange_total.possession_time
  );
  document.getElementById('b-sh-t').innerText = percentage(
    blue_total.shots_taken,
    orange_total.shots_taken
  );
  document.getElementById('b-sv-t').innerText = percentage(
    blue_total.saves,
    orange_total.saves
  );
  document.getElementById('b-sl-t').innerText = percentage(
    blue_total.steals,
    orange_total.steals
  );
  document.getElementById('b-st-t').innerText = percentage(
    blue_total.stuns,
    orange_total.stuns
  );
  document.getElementById('b-as-t').innerText = percentage(
    blue_total.assists,
    orange_total.assists
  );
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
  if (
    !game_status ||
    game_status === 'round_over' ||
    game_status === 'post_match'
  ) {
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
      stunned: p.stunned,
      position: p.head.position,
      team: 'ORANGE',
    };
  });
  // BLUE TEAM
  const blue_team_players = sessionData.teams[0].players.map((p) => {
    return {
      no: zeroPaddingString(p.number),
      possession: p.possession,
      stunned: p.stunned,
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
      if (p.stunned) {
        graphics.beginFill(0xa85b00, 1);
      } else {
        graphics.beginFill(0xff8b00, 1);
      }
    } else {
      if (p.stunned) {
        graphics.beginFill(0x0062a1, 1);
      } else {
        graphics.beginFill(0x009afe, 1);
      }
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
  graphics.lineStyle(3, 0xffffff);
  graphics.drawCircle(disc_x, disc_y, 8);
  app.stage.addChild(graphics);
  graphicses.push(graphics);
}
