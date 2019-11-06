function getHTML(e) {
  return e.length > 0 ? e[0].outerHTML : undefined;
}

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
  const url = `https://dict.youdao.com/w/eng/${request}`;
  $.get(url, (data) => {
    const doc = $('<div></div>');
    doc.html(data);
    const res = {};
    res.collins = getHTML(doc.find('#collinsResult').find('.ol'));
    res.extra = [
      { name: "词组短语", html: getHTML(doc.find('#wordGroup')) },
      { name: "同近义词", html: getHTML(doc.find('#synonyms')) },
      { name: "同根词", html: getHTML(doc.find('#relWordTab')) },
      { name: "词语辨析", html: getHTML(doc.find('#discriminate')) },
    ];
    console.log(res);
    sendResponse(res);
  });
  return true;
});
