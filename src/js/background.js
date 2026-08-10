const DICTIONARY_ORIGIN = "https://dict.youdao.com";
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_RESPONSE_BYTES = 2_000_000;
const CACHE_TTL_MS = 15 * 60 * 1_000;

const responseCache = new Map();
const pendingRequests = new Map();

function normalizeWord(value) {
  if (typeof value !== "string") {
    throw new Error("无效的单词");
  }

  const word = value.normalize("NFKC").trim().replace(/\s+/g, " ");

  if (!word || word.length > 80 || /[\u0000-\u001f\u007f]/u.test(word)) {
    throw new Error("无效的单词");
  }

  return word;
}

function dictionaryUrl(word) {
  return `${DICTIONARY_ORIGIN}/w/eng/${encodeURIComponent(word)}`;
}

function pruneCache(cache, now = Date.now()) {
  for (const [word, entry] of cache) {
    if (now - entry.createdAt >= CACHE_TTL_MS) {
      cache.delete(word);
    }
  }
}

async function fetchDictionary(word) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = dictionaryUrl(word);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "omit",
      redirect: "follow",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      throw new Error(`词典请求失败（HTTP ${response.status}）`);
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
      throw new Error("词典响应过大");
    }

    const html = await response.text();
    if (!html || html.length > MAX_RESPONSE_BYTES) {
      throw new Error(html ? "词典响应过大" : "词典返回了空内容");
    }

    return {
      html,
      sourceUrl: response.url || url
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("词典请求超时");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function lookupWord(rawWord) {
  const word = normalizeWord(rawWord);
  const now = Date.now();
  pruneCache(responseCache, now);

  const cached = responseCache.get(word);
  if (cached) {
    return cached.value;
  }

  if (pendingRequests.has(word)) {
    return pendingRequests.get(word);
  }

  const request = fetchDictionary(word)
    .then((value) => {
      responseCache.set(word, { createdAt: Date.now(), value });
      return value;
    })
    .finally(() => {
      pendingRequests.delete(word);
    });

  pendingRequests.set(word, request);
  return request;
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.type !== "shanbay-helper:lookup") {
    return false;
  }

  lookupWord(request.word)
    .then((result) => {
      sendResponse({ ok: true, ...result });
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "词典请求失败"
      });
    });

  return true;
});
