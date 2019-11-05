setInterval(function() {
  const selector = '#root > div > div > div > div > div:nth-child(1) > div > div > div > div:nth-child(6) > div.span9 > div > div > div:nth-child(2) > div:nth-child({child})';
  const s1 = selector.replace("{child}", "1");
  const s2 = selector.replace("{child}", "2");
  let ele = document.querySelector(s2);
  if (ele && ele.className.indexOf("hide") !== -1) {
    ele.setAttribute("class", ele.className.replace("hide", ""));
    $(s2).after($(s1));
  }
}, 500);
