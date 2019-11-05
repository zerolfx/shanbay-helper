function hint() {
  $('.sentence-word-input').not('.right-answer').first().each(function (idx, e) {
    e.value = e.getAttribute('data')
  });
}

setInterval(function() {
  const ele = document.querySelector('#test-or-preview > div.operations-container.row-fluid.no-space > div.span2.btn-hint');
  if (ele && ele.innerText === "提示(1)") {
    ele.setAttribute("data-content", "不消耗提示数（扇贝助手）");
    ele.setAttribute("content", "不消耗提示数（扇贝助手）");
    ele.innerHTML = ele.innerHTML.replace("提示", "免费提示");
    ele.setAttribute("class", ele.className.replace("span2", "span4"));
    const eleNext = ele.nextElementSibling;
    eleNext.setAttribute("class", eleNext.className.replace("span8", "span6"));
    //  thanks to https://codeday.me/en/qa/20190305/3259.html
    ele.addEventListener('click', function (event) {
      hint();
      event.stopPropagation();
    }, true);
    document.querySelector('#test-or-preview').addEventListener('keydown', (e) => {
      if (e.key === "1") {
        hint();
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }
}, 500);
