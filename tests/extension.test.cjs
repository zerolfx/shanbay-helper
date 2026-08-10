const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(projectRoot, "manifest.json");
const backgroundPath = path.join(projectRoot, "src", "js", "background.js");
const contentScriptPath = path.join(projectRoot, "src", "js", "words.js");
const hyphenCorePath = path.join(projectRoot, "third-party", "hyphen.js");
const hyphenPatternsPath = path.join(
  projectRoot,
  "third-party",
  "hyphen-en-us.js"
);

function createResponse({
  ok = true,
  status = 200,
  html = "<html><body>dictionary</body></html>",
  url = "https://dict.youdao.com/w/eng/example",
  contentLength = null
} = {}) {
  return {
    ok,
    status,
    url,
    headers: {
      get(name) {
        return name.toLowerCase() === "content-length" ? contentLength : null;
      }
    },
    async text() {
      return html;
    }
  };
}

function loadBackground(fetchImplementation) {
  let listener;
  const source = fs.readFileSync(backgroundPath, "utf8");
  const context = {
    AbortController,
    URL,
    URLSearchParams,
    clearTimeout,
    fetch: fetchImplementation,
    setTimeout,
    chrome: {
      runtime: {
        onMessage: {
          addListener(callback) {
            listener = callback;
          }
        }
      }
    }
  };

  vm.runInNewContext(source, context, { filename: backgroundPath });
  assert.equal(typeof listener, "function");
  return listener;
}

function dispatch(listener, request) {
  return new Promise((resolve, reject) => {
    const keepChannelOpen = listener(request, {}, resolve);
    if (keepChannelOpen !== true) {
      reject(new Error("message channel was not kept open"));
    }
  });
}

test("manifest uses MV3 with minimal host access", () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.service_worker, "src/js/background.js");
  assert.equal(manifest.action, undefined);
  assert.deepEqual(manifest.host_permissions, ["https://dict.youdao.com/*"]);
  assert.equal(manifest.permissions, undefined);
  assert.deepEqual(manifest.content_scripts[0].js, [
    "third-party/hyphen-en-us.js",
    "third-party/hyphen.js",
    "src/js/words.js"
  ]);
  assert.deepEqual(manifest.content_scripts[0].matches, [
    "https://web.shanbay.com/wordsweb/*"
  ]);
});

test("service worker encodes a word and returns dictionary HTML", async () => {
  let capturedUrl;
  let capturedOptions;
  const listener = loadBackground(async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return createResponse({
      html: "<html><div id=\"collinsResult\"></div></html>",
      url
    });
  });

  const response = await dispatch(listener, {
    type: "shanbay-helper:lookup",
    word: "ice cream"
  });

  assert.equal(response.ok, true);
  assert.match(capturedUrl, /ice%20cream$/);
  assert.equal(capturedOptions.credentials, "omit");
  assert.equal(capturedOptions.referrerPolicy, "no-referrer");
  assert.match(response.html, /collinsResult/);
});

test("service worker rejects an empty word without fetching", async () => {
  let fetchCount = 0;
  const listener = loadBackground(async () => {
    fetchCount += 1;
    return createResponse();
  });

  const response = await dispatch(listener, {
    type: "shanbay-helper:lookup",
    word: "   "
  });

  assert.equal(response.ok, false);
  assert.match(response.error, /无效/);
  assert.equal(fetchCount, 0);
});

test("service worker reports an upstream HTTP failure", async () => {
  const listener = loadBackground(async () =>
    createResponse({ ok: false, status: 503 })
  );

  const response = await dispatch(listener, {
    type: "shanbay-helper:lookup",
    word: "example"
  });

  assert.equal(response.ok, false);
  assert.match(response.error, /HTTP 503/);
});

test("vendored en-US rules provide local word-division points", () => {
  const context = vm.createContext({ clearTimeout, setTimeout });
  vm.runInContext(fs.readFileSync(hyphenPatternsPath, "utf8"), context, {
    filename: hyphenPatternsPath
  });
  vm.runInContext(fs.readFileSync(hyphenCorePath, "utf8"), context, {
    filename: hyphenCorePath
  });

  const hyphenate = context.createHyphenator(
    context.hyphenationPatternsEnUs,
    { html: false, hyphenChar: "·", minWordLength: 5 }
  );

  assert.equal(hyphenate("beautiful"), "beau·ti·ful");
  assert.equal(hyphenate("cat"), "cat");
});

test("unknown messages are ignored", () => {
  const listener = loadBackground(async () => createResponse());
  assert.equal(listener({ type: "unrelated" }, {}, () => {}), false);
});

test("content script never injects remote HTML directly", () => {
  const source = fs.readFileSync(contentScriptPath, "utf8");
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.doesNotMatch(source, /insertAdjacentHTML\s*\(/);
  assert.doesNotMatch(source, /eval\s*\(/);
  assert.doesNotMatch(source, /Wiktionary|Wordsmyth/i);
  assert.match(source, /new DOMParser\(\)/);
  assert.match(source, /new MutationObserver\(/);
  assert.match(source, /createHyphenator/);
});
