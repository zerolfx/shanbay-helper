function sideBar(response) {
  const main = document.querySelector('.span12');
  main.setAttribute('class', main.className.replace("span12", "span8"));
  main.setAttribute('style', '');
  const side = document.createElement('div');
  side.setAttribute('class', 'span4');
  side.setAttribute('id', 'sidebar');
  let sideHTML = "";
  response.extra.forEach((x) => {
    if (x.html) {
      sideHTML += `
            <div class="sidebar-block">
              <div class="sidebar-content">
                <b>${x.name}</b>
                ${x.html}
              </div>
            </div>
          `
    }
  });
  side.innerHTML = sideHTML;
  main.parentElement.appendChild(side);
}

function rank(response) {
  if (!response.rank) return;
  const tab = document.querySelector("div[class^=index_switch]");
  tab.appendChild(document.createTextNode(response.rank));
}

setInterval(() => {
  const ele = $("div[class^='BayTrans_paraphrase']");
  if (ele.length > 0 && ele[0].parentElement.attributes["id"] === undefined) {
    ele[0].parentElement.setAttribute('id', 'collinsResult');
    const word = $("div[class^='VocabPronounce_word']")[0].innerText;
    chrome.runtime.sendMessage(word, function(response) {
      ele.replaceWith(response.collins);
      sideBar(response);
      rank(response);
    });
  }
}, 1000);
