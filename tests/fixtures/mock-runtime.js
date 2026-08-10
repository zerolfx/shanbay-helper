(() => {
  const runtime = {
    lastError: null,
    sendMessage(request, callback) {
      window.__shanbayHelperMessages.push(request);

      if (request.word === "missing") {
        window.setTimeout(
          () => callback({ ok: false, error: "暂未找到这个词的柯林斯释义" }),
          10
        );
        return;
      }

      fetch("dictionary.html")
        .then((response) => response.text())
        .then((html) => {
          callback({
            ok: true,
            html: html.replaceAll("example", request.word),
            sourceUrl: `https://dict.youdao.com/w/eng/${request.word}`
          });
        });
    }
  };

  window.__shanbayHelperMessages = [];
  window.chrome = { runtime };

  document.querySelector("#change-word").addEventListener("click", () => {
    document.querySelector('[class*="VocabPronounce_word"]').textContent = "sample";
  });

  document.querySelector("#missing-word").addEventListener("click", () => {
    document.querySelector('[class*="VocabPronounce_word"]').textContent = "missing";
  });
})();
