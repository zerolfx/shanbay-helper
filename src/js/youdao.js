setInterval(() => {
  const ele = $("div[class^='BayTrans_paraphrase']");
  if (ele.length > 0 && ele[0].parentElement.attributes["id"] === undefined) {
    ele[0].parentElement.setAttribute('id', 'collinsResult');
    const word = $("div[class^='VocabPronounce_word']")[0].innerText;
    chrome.runtime.sendMessage(word, function(response) {
      ele.replaceWith(response.collins);
      const main = $('#root > div > div > div > div > div:nth-child(1) > div > div')[0];
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
              <b>${x.name}</b>
              ${x.html}
            </div>
          `
        }
      });
      side.innerHTML = sideHTML;
      main.parentElement.appendChild(side);
    });
  }
}, 500);
