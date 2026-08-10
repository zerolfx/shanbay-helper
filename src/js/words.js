(() => {
  "use strict";

  const ROOT_ID = "shanbay-helper-root";
  const NATIVE_HIDDEN_CLASS = "shanbay-helper-native-hidden";
  const SELECTORS = {
    studyPage: '[class*="StudyPage_studyPage"]',
    word: '[class*="VocabPronounce_word"]',
    paraphrase: '[class*="BayTrans_paraphrase"]'
  };

  const state = {
    root: null,
    word: "",
    wordElement: null,
    nativeTranslation: null,
    requestToken: 0,
    scanTimer: 0
  };

  const hyphenateEnglish = (() => {
    try {
      if (
        typeof globalThis.createHyphenator !== "function" ||
        !Array.isArray(globalThis.hyphenationPatternsEnUs)
      ) {
        return null;
      }

      return globalThis.createHyphenator(
        globalThis.hyphenationPatternsEnUs,
        {
          async: false,
          html: false,
          hyphenChar: "·",
          minWordLength: 5
        }
      );
    } catch {
      return null;
    }
  })();

  function normalizeText(value) {
    const text = typeof value === "string" ? value : value?.textContent || "";
    return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  function cloneWithout(element, selectors) {
    if (!element) {
      return null;
    }

    const clone = element.cloneNode(true);
    clone.querySelectorAll(selectors).forEach((node) => node.remove());
    return clone;
  }

  function parseSense(element, index) {
    const translation = element.querySelector(".collinsMajorTrans");
    if (!translation) {
      return null;
    }

    const order = normalizeText(translation.querySelector(".collinsOrder")) || `${index + 1}.`;
    const labels = Array.from(translation.querySelectorAll(".additional"))
      .map(normalizeText)
      .filter(Boolean);
    const definition = normalizeText(
      cloneWithout(translation, ".collinsOrder, .additional")
    );

    if (!definition) {
      return null;
    }

    const examples = Array.from(element.querySelectorAll(".exampleLists .examples"))
      .map((example) => {
        const lines = Array.from(example.querySelectorAll("p"))
          .map(normalizeText)
          .filter(Boolean);

        if (!lines.length) {
          const text = normalizeText(example);
          return text ? { text, translation: "" } : null;
        }

        return {
          text: lines[0],
          translation: lines.slice(1).join(" ")
        };
      })
      .filter(Boolean)
      .slice(0, 8);

    return {
      order,
      labels: labels.slice(0, 4),
      definition,
      examples
    };
  }

  function parsePhrases(documentNode) {
    return Array.from(documentNode.querySelectorAll("#wordGroup p.wordGroup"))
      .map((element) => {
        const term = normalizeText(element.querySelector(".contentTitle"));
        const description = normalizeText(
          cloneWithout(element, ".contentTitle, .century21")
        );
        return term && description ? { term, description } : null;
      })
      .filter(Boolean)
      .slice(0, 16);
  }

  function parseSynonyms(documentNode) {
    return Array.from(documentNode.querySelectorAll("#synonyms li"))
      .map((labelElement) => {
        let valuesElement = labelElement.nextElementSibling;
        while (valuesElement && valuesElement.tagName !== "P") {
          valuesElement = valuesElement.nextElementSibling;
        }

        const values = valuesElement
          ? Array.from(valuesElement.querySelectorAll(".contentTitle"))
              .map(normalizeText)
              .filter(Boolean)
          : [];

        return values.length
          ? { label: normalizeText(labelElement), values: values.slice(0, 16) }
          : null;
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  function parseDiscrimination(documentNode) {
    const root = documentNode.querySelector("#discriminate");
    if (!root) {
      return null;
    }

    const overview = normalizeText(root.querySelector(".title span"));
    const introduction = Array.from(root.querySelectorAll(".collapse-content > p"))
      .map(normalizeText)
      .find((text) => text && !text.includes("来源于")) || "";
    const items = Array.from(root.querySelectorAll(".wordGroup p"))
      .map((element) => {
        const term = normalizeText(element.querySelector(".contentTitle"));
        const description = normalizeText(cloneWithout(element, ".contentTitle"));
        return term && description ? { term, description } : null;
      })
      .filter(Boolean)
      .slice(0, 16);

    return overview || introduction || items.length
      ? { overview, introduction, items }
      : null;
  }

  function parseDictionaryHtml(html) {
    if (typeof html !== "string" || !html.trim()) {
      throw new Error("词典没有返回可解析的内容");
    }

    const documentNode = new DOMParser().parseFromString(html, "text/html");
    const collins = documentNode.querySelector("#collinsResult");

    if (!collins) {
      throw new Error("暂未找到这个词的柯林斯释义");
    }

    const senses = Array.from(collins.querySelectorAll(".ol > li"))
      .map(parseSense)
      .filter(Boolean)
      .slice(0, 30);

    if (!senses.length) {
      throw new Error("暂未找到这个词的柯林斯释义");
    }

    return {
      title: normalizeText(collins.querySelector(".title")),
      phonetic: normalizeText(collins.querySelector(".phonetic")),
      rank: normalizeText(collins.querySelector("span.via.rank")),
      senses,
      phrases: parsePhrases(documentNode),
      synonyms: parseSynonyms(documentNode),
      discrimination: parseDiscrimination(documentNode)
    };
  }

  function wordDivisionFor(word) {
    if (!hyphenateEnglish || !/^[A-Za-z]+(?:['-][A-Za-z]+)*$/.test(word)) {
      return "";
    }

    try {
      const divided = hyphenateEnglish(word);
      const original = word.toLocaleLowerCase("en-US");
      const restored = divided.replaceAll("·", "").toLocaleLowerCase("en-US");

      return divided.includes("·") && restored === original ? divided : "";
    } catch {
      return "";
    }
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  }

  function findCurrentElements() {
    const studyPage = document.querySelector(SELECTORS.studyPage);
    const scope = studyPage || document;
    const wordElement = scope.querySelector(SELECTORS.word) || document.querySelector(SELECTORS.word);
    const nativeTranslation =
      scope.querySelector(SELECTORS.paraphrase) || document.querySelector(SELECTORS.paraphrase);

    return { wordElement, nativeTranslation };
  }

  function findInsertionAnchor(nativeTranslation) {
    return (
      nativeTranslation.closest('[class*="BayTrans_container"]') ||
      nativeTranslation.parentElement
    );
  }

  function restoreNativeTranslation() {
    state.nativeTranslation?.classList.remove(NATIVE_HIDDEN_CLASS);
  }

  function resetActivePanel() {
    restoreNativeTranslation();
    state.root?.remove();
    state.root = null;
    state.word = "";
    state.wordElement = null;
    state.nativeTranslation = null;
    state.requestToken += 1;
  }

  function createPanel(anchor, word) {
    const root = createElement("section", "shanbay-helper");
    root.id = ROOT_ID;
    root.dataset.word = word;
    root.setAttribute("aria-label", "扇贝助手词典补充");

    const header = createElement("header", "shanbay-helper__header");
    const headingGroup = createElement("div", "shanbay-helper__heading-group");
    headingGroup.append(
      createElement("span", "shanbay-helper__eyebrow", "扇贝助手"),
      createElement("h2", "shanbay-helper__title", "柯林斯补充释义")
    );

    const actions = createElement("div", "shanbay-helper__actions");
    const nativeButton = createElement(
      "button",
      "shanbay-helper__button",
      "显示扇贝原释义"
    );
    nativeButton.type = "button";
    nativeButton.hidden = true;
    nativeButton.addEventListener("click", () => {
      const isHidden = state.nativeTranslation?.classList.toggle(NATIVE_HIDDEN_CLASS);
      nativeButton.textContent = isHidden ? "显示扇贝原释义" : "隐藏扇贝原释义";
    });
    actions.append(nativeButton);
    header.append(headingGroup, actions);

    const body = createElement("div", "shanbay-helper__body");
    body.dataset.role = "body";
    body.setAttribute("aria-live", "polite");
    root.append(header, body);

    root._nativeButton = nativeButton;
    anchor.insertAdjacentElement("afterend", root);
    return root;
  }

  function renderLoading(root) {
    root.classList.remove("shanbay-helper--error");
    const body = root.querySelector('[data-role="body"]');
    const loading = createElement("div", "shanbay-helper__status");
    loading.append(
      createElement("span", "shanbay-helper__spinner"),
      createElement("span", "", "正在加载补充释义…")
    );
    body.replaceChildren(loading);
  }

  function renderError(root, message) {
    root.classList.add("shanbay-helper--error");
    const body = root.querySelector('[data-role="body"]');
    const status = createElement(
      "p",
      "shanbay-helper__status shanbay-helper__status--error",
      message || "补充释义加载失败"
    );
    const retryButton = createElement("button", "shanbay-helper__button", "重试");
    retryButton.type = "button";
    retryButton.addEventListener("click", () => {
      state.word = "";
      scheduleScan(0);
    });
    body.replaceChildren(status, retryButton);
  }

  function appendSenseList(container, senses) {
    const list = createElement("ol", "shanbay-helper__sense-list");

    senses.forEach((sense) => {
      const item = createElement("li", "shanbay-helper__sense");
      const definition = createElement("div", "shanbay-helper__definition");
      definition.append(createElement("span", "shanbay-helper__order", sense.order));

      sense.labels.forEach((label) => {
        definition.append(createElement("span", "shanbay-helper__label", label));
      });

      definition.append(document.createTextNode(sense.definition));
      item.append(definition);

      if (sense.examples.length) {
        const examples = createElement("div", "shanbay-helper__examples");
        sense.examples.forEach((example) => {
          const block = createElement("div", "shanbay-helper__example");
          block.append(createElement("p", "shanbay-helper__example-en", example.text));
          if (example.translation) {
            block.append(
              createElement("p", "shanbay-helper__example-zh", example.translation)
            );
          }
          examples.append(block);
        });
        item.append(examples);
      }

      list.append(item);
    });

    container.append(list);
  }

  function appendPairs(container, items) {
    const list = createElement("dl", "shanbay-helper__pairs");
    items.forEach(({ term, description }) => {
      list.append(
        createElement("dt", "shanbay-helper__term", term),
        createElement("dd", "shanbay-helper__description", description)
      );
    });
    container.append(list);
  }

  function createDetails(title, count) {
    const details = createElement("details", "shanbay-helper__details");
    const summary = createElement("summary", "shanbay-helper__summary");
    summary.append(
      document.createTextNode(title),
      createElement("span", "shanbay-helper__count", String(count))
    );
    details.append(summary);
    return details;
  }

  function appendExtras(container, data) {
    if (!data.phrases.length && !data.synonyms.length && !data.discrimination) {
      return;
    }

    const extras = createElement("div", "shanbay-helper__extras");

    if (data.phrases.length) {
      const details = createDetails("词组短语", data.phrases.length);
      appendPairs(details, data.phrases);
      extras.append(details);
    }

    if (data.synonyms.length) {
      const details = createDetails("同近义词", data.synonyms.length);
      const list = createElement("div", "shanbay-helper__synonyms");
      data.synonyms.forEach(({ label, values }) => {
        const group = createElement("p", "shanbay-helper__synonym-group");
        group.append(
          createElement("strong", "", label),
          document.createTextNode(` ${values.join(" · ")}`)
        );
        list.append(group);
      });
      details.append(list);
      extras.append(details);
    }

    if (data.discrimination) {
      const details = createDetails(
        "词语辨析",
        data.discrimination.items.length || 1
      );
      if (data.discrimination.overview) {
        details.append(
          createElement(
            "p",
            "shanbay-helper__overview",
            data.discrimination.overview
          )
        );
      }
      if (data.discrimination.introduction) {
        details.append(
          createElement(
            "p",
            "shanbay-helper__introduction",
            data.discrimination.introduction
          )
        );
      }
      appendPairs(details, data.discrimination.items);
      extras.append(details);
    }

    container.append(extras);
  }

  function safeSourceUrl(sourceUrl, word) {
    const fallback = `https://dict.youdao.com/w/eng/${encodeURIComponent(word)}`;
    try {
      const url = new URL(sourceUrl || fallback);
      return url.origin === "https://dict.youdao.com" ? url.href : fallback;
    } catch {
      return fallback;
    }
  }

  function renderDictionary(root, data, sourceUrl, word) {
    root.classList.remove("shanbay-helper--error");
    const body = root.querySelector('[data-role="body"]');
    const meta = createElement("div", "shanbay-helper__meta");

    const wordDivision = wordDivisionFor(word);
    if (data.title || data.phonetic || wordDivision) {
      const pronunciation = createElement("div", "shanbay-helper__pronunciation");
      if (data.title) {
        pronunciation.append(createElement("strong", "", data.title));
      }
      if (data.phonetic) {
        pronunciation.append(createElement("span", "", data.phonetic));
      }
      if (wordDivision) {
        const division = createElement(
          "span",
          "shanbay-helper__word-division"
        );
        division.title =
          "基于 en-US 排版断词规则；断词点不一定等同于发音音节";
        division.append(
          document.createTextNode(wordDivision),
          createElement("small", "", "断词参考")
        );
        pronunciation.append(division);
      }
      meta.append(pronunciation);
    }

    if (data.rank) {
      meta.append(createElement("span", "shanbay-helper__rank", data.rank));
    }

    const sourceLink = createElement("a", "shanbay-helper__source", "有道词典 ↗");
    sourceLink.href = safeSourceUrl(sourceUrl, word);
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    meta.append(sourceLink);

    const content = createElement("div", "shanbay-helper__content");
    content.append(meta);
    appendSenseList(content, data.senses);
    appendExtras(content, data);
    body.replaceChildren(content);

    state.nativeTranslation?.classList.add(NATIVE_HIDDEN_CLASS);
    root._nativeButton.hidden = false;
    root._nativeButton.textContent = "显示扇贝原释义";
  }

  function requestDictionary(word) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "shanbay-helper:lookup", word },
        (response) => {
          const runtimeError = chrome.runtime.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || "扩展后台暂不可用"));
            return;
          }

          if (!response?.ok) {
            reject(new Error(response?.error || "词典请求失败"));
            return;
          }

          resolve(response);
        }
      );
    });
  }

  async function scanPage() {
    const { wordElement, nativeTranslation } = findCurrentElements();
    const word = normalizeText(wordElement);
    const anchor = nativeTranslation ? findInsertionAnchor(nativeTranslation) : null;

    if (!wordElement || !nativeTranslation || !anchor || !word) {
      if (state.root && (!state.wordElement?.isConnected || !state.nativeTranslation?.isConnected)) {
        resetActivePanel();
      }
      return;
    }

    if (
      state.root?.isConnected &&
      state.word === word &&
      state.wordElement === wordElement &&
      state.nativeTranslation === nativeTranslation
    ) {
      return;
    }

    resetActivePanel();
    const requestToken = state.requestToken;
    const root = createPanel(anchor, word);
    state.root = root;
    state.word = word;
    state.wordElement = wordElement;
    state.nativeTranslation = nativeTranslation;
    renderLoading(root);

    try {
      const response = await requestDictionary(word);
      if (requestToken !== state.requestToken || !root.isConnected) {
        return;
      }

      const dictionary = parseDictionaryHtml(response.html);
      renderDictionary(root, dictionary, response.sourceUrl, word);
    } catch (error) {
      if (requestToken !== state.requestToken || !root.isConnected) {
        return;
      }

      renderError(
        root,
        error instanceof Error ? error.message : "补充释义加载失败"
      );
    }
  }

  function scheduleScan(delay = 120) {
    window.clearTimeout(state.scanTimer);
    state.scanTimer = window.setTimeout(() => {
      scanPage().catch(() => {});
    }, delay);
  }

  function start() {
    const observer = new MutationObserver(() => scheduleScan());
    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });

    window.addEventListener("hashchange", () => scheduleScan(0));
    window.addEventListener("popstate", () => scheduleScan(0));
    scheduleScan(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
