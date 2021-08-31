function getOuterHTML(e) {
  return e.length > 0 ? e[0].outerHTML : undefined;
}

function getInnerHTML(e) {
  return e.length > 0 ? e[0].innerHTML : undefined;
}


const devMode = !('update_url' in chrome.runtime.getManifest());

const debugLogger = (level = 'log', ...msg) => {
  if (devMode) console[level](...msg)
};

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  debugLogger('log', req);
  switch (req.action) {
    case 'collins':
      $.get(`https://dict.youdao.com/w/eng/${req.word}`, (data) => {
        const doc = $('<div></div>');
        doc.html(data);
        const res = {};
        res.collins = getOuterHTML(doc.find('#collinsResult').find('.ol'));
        res.rank = getInnerHTML(doc.find('span.via.rank'));
        res.extra = [
          { name: "词组短语", html: getInnerHTML(doc.find('#wordGroup')) },
          { name: "同近义词", html: getInnerHTML(doc.find('#synonyms')) },
          { name: "同根词", html: getInnerHTML(doc.find('#relWordTab')) },
          { name: "词语辨析", html: getInnerHTML(doc.find('#discriminate')) },
        ];
        debugLogger('log', res);
        sendResponse(res);
      });
      return true;
    case 'wordsmyth':
      $.get(`https://www.wordsmyth.net/?ent=${req.word}`, (data) => {
        const doc = $('<div></div>');
        doc.html(data);
        const res = {};
        res.syllabification = getInnerHTML(doc.find('.headword.syl'));
        debugLogger('log', res);
        sendResponse(res);
      });
      return true;
    default:
      throw Error('Invalid action type')
  }
});
