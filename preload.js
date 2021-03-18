window.addEventListener('DOMContentLoaded', () => {

  setInterval(function(){
    fetch('http://127.0.0.1:6721/session')
    .then(response => response.json())
    .then(data => renderHTML(data));
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
  replaceText('game-clock-display', sessionData.game_clock_display.split('.')[0])

}
