function getOuterHTML(e) {
  return e.length > 0 ? e[0].outerHTML : undefined;
}

function getInnerHTML(e) {
  return e.length > 0 ? e[0].innerHTML : undefined;
}

chrome.runtime.onMessage.addListener(
function({ word, type }, sender, sendResponse) {
  if (type === 'collins') {
    $.get(`https://dict.youdao.com/w/eng/${word}`, (data) => {
      const doc = $('<div></div>');
      doc.html(data);
      const res = {};
      res.collins = getOuterHTML(doc.find('#collinsResult').find('.ol'));
      res.rank = getInnerHTML(doc.find('span.via.rank'));
      res.extra = [
        { name: "词组短语", html: getOuterHTML(doc.find('#wordGroup')) },
        { name: "同近义词", html: getOuterHTML(doc.find('#synonyms')) },
        { name: "同根词", html: getOuterHTML(doc.find('#relWordTab')) },
        { name: "词语辨析", html: getOuterHTML(doc.find('#discriminate')) },
      ];
      console.log(res);
      sendResponse(res);
    });
  } else if (type === 'wordsmyth') {
    $.get(`https://www.wordsmyth.net/?ent=${word}`, (data) => {
      const doc = $('<div></div>');
      doc.html(data);
      const res = {};
      res.syllabification = getInnerHTML(doc.find('.headword.syl'));
      console.log(res);
      sendResponse(res);
    });
  }

  return true;
});
