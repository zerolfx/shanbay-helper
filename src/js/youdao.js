setInterval(() => {
  const ele = $("div[class^='BayTrans_paraphrase']");
  if (ele.length > 0) {
    ele[0].parentElement.setAttribute('id', 'collinsResult');
    const word = $("div[class^='VocabPronounce_word']")[0].innerText;
    chrome.runtime.sendMessage(word, function(response) {
      ele.replaceWith(response.collins)
    });
  }
}, 500);
