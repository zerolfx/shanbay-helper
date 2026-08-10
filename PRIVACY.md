# 扇贝助手重制版隐私政策

生效日期：2026 年 8 月 10 日  
适用版本：0.2.0 及以后版本

## 概要

扇贝助手重制版只为扇贝单词网页版补充词典内容。扩展不收集扇贝账号、Cookie、学习记录、浏览历史或身份信息，不包含广告、分析或跟踪代码，也不会向扩展开发者发送任何数据。

## 扩展读取和传输的数据

扩展只在 `https://web.shanbay.com/wordsweb/` 页面运行，并读取页面当前显示的英文单词，以便展示与该单词对应的补充释义。

为了查询释义，扩展会把当前单词作为 HTTPS 请求路径的一部分发送到 `https://dict.youdao.com/`。请求不携带 Cookie，且不发送来源页面地址。词典返回内容只用于生成当前页面中的释义、例句、词组、近义词和词语辨析。

断词参考由扩展包内的本地规则计算，不会为此连接第三方服务。

## 存储与保留

词典结果只保存在 Chrome 扩展 Service Worker 的内存缓存中，最长约 15 分钟；浏览器回收 Service Worker 时缓存也会消失。扩展不使用 Chrome 存储、本地数据库或云端服务器保存用户数据。

## 数据共享与用途限制

除上述为完成用户主动学习操作而向有道词典发送当前单词外，扩展不会出售、出租、转移或共享用户数据，也不会将数据用于广告、信用评估或任何与扩展单一用途无关的目的。

本扩展对从 Chrome API 获得的信息的使用和转移将遵守 [Chrome Web Store 用户数据政策](https://developer.chrome.com/docs/webstore/program-policies/user-data)，包括 Limited Use（有限使用）要求。

## 权限说明

- `https://web.shanbay.com/wordsweb/*`：在扇贝单词学习和详情页面读取当前单词并显示补充词典面板。
- `https://dict.youdao.com/*`：查询当前单词对应的公开词典页面。

扩展不申请标签页、浏览历史、Cookie、账户身份或后台常驻权限。

## 政策变更与联系

本政策如有实质变更，会在本页面更新日期，并随新版扩展一同发布。问题或隐私请求可在 [GitHub Issues](https://github.com/zerolfx/shanbay-helper/issues) 提交。

---

# Shanbay Helper Rebuilt Privacy Policy

Effective date: August 10, 2026  
Applies to version 0.2.0 and later

Shanbay Helper Rebuilt runs only on `https://web.shanbay.com/wordsweb/`. It reads the English word currently shown on the page so it can display supplemental dictionary information.

The current word is sent over HTTPS to `https://dict.youdao.com/` as part of the request path. Requests omit cookies and the referring page. Responses are used only to render definitions, examples, phrases, synonyms, and usage comparisons. Word-division hints are computed locally.

Dictionary responses are cached only in the extension Service Worker's memory for up to approximately 15 minutes and disappear when that worker is discarded. The extension does not use Chrome storage, a local database, or a developer-operated server. It does not collect account details, cookies, study records, browsing history, or identity data, and contains no advertising, analytics, or tracking code. Data is not sold or used for purposes unrelated to the extension's single purpose.

The use and transfer of information received from Chrome APIs will adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data), including the Limited Use requirements.

Questions or privacy requests may be submitted through [GitHub Issues](https://github.com/zerolfx/shanbay-helper/issues).
