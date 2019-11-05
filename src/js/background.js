chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
  const url = `https://dict.youdao.com/w/eng/${request}`;
  $.get(url, (data) => {
    const doc = $('<div></div>');
    doc.html(data);
    const res = {};
    res.collins = doc.find('#collinsResult').find('.ol')[0].outerHTML;
    sendResponse(res);
  });
  return true;
});
