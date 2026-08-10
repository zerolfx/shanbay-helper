# 扇贝助手重制版隐私政策

生效日期：2026 年 8 月 10 日  
适用版本：0.2.1 及以后版本

## 概要

扇贝助手重制版只为扇贝单词网页版补充词典内容。扩展不收集扇贝账号、Cookie、学习记录、浏览历史或身份信息，不包含广告、分析或跟踪代码，也不会向扩展开发者发送任何数据。

## 扩展读取和传输的数据

扩展只在 `https://web.shanbay.com/wordsweb/` 页面运行，并读取页面当前显示的英文单词或词组，以便展示对应的补充释义。页面打开或切换到新的单词或词组、且页面已显示原释义时，查询会自动进行，不需要用户另行点击查询按钮。

为了查询释义，扩展会把当前单词或词组作为 HTTPS 请求路径的一部分发送到 `https://dict.youdao.com/`。请求不携带 Cookie，且不发送来源页面地址。与任何 HTTPS 请求一样，有道可能接收到 IP 地址、User-Agent 等完成网络通信所需的技术信息，并依其自身政策处理；扩展开发者不会接收这些信息。词典返回内容只用于生成当前页面中的释义、例句、词组、近义词和词语辨析。

断词参考由扩展包内的本地规则计算，不会为此连接第三方服务。

## 存储与保留

词典结果只保存在 Chrome 扩展 Service Worker 的内存缓存中。缓存条目的有效期为 15 分钟；过期后不再使用，并在下一次查询时清理。浏览器回收 Service Worker 时，所有内存缓存也会消失。扩展不使用 Chrome 存储、本地数据库或云端服务器保存用户数据。

## 数据共享与用途限制

除上述为完成用户学习操作而向有道词典发送当前单词或词组外，扩展不会出售、出租、转移或共享用户数据，也不会将数据用于广告、信用评估或任何与扩展单一用途无关的目的。

本扩展对从 Chrome API 获得的信息的使用和转移将遵守 [Chrome Web Store 用户数据政策](https://developer.chrome.com/docs/webstore/program-policies/user-data)，包括 Limited Use（有限使用）要求。

## 权限说明

- `https://web.shanbay.com/wordsweb/*`：在扇贝单词学习和详情页面读取当前单词或词组并显示补充词典面板。
- `https://dict.youdao.com/*`：查询当前单词或词组对应的公开词典页面。

扩展不申请标签页、浏览历史、Cookie、账户身份或后台常驻权限。

## 政策变更与联系

本政策如有实质变更，会在本页面更新日期，并随新版扩展一同发布。问题或隐私请求可在 [GitHub Issues](https://github.com/zerolfx/shanbay-helper/issues) 提交。

---

# Shanbay Helper Rebuilt Privacy Policy

Effective date: August 10, 2026  
Applies to version 0.2.1 and later

Shanbay Helper Rebuilt runs only on `https://web.shanbay.com/wordsweb/`. It reads the English word or phrase currently shown on the page so it can display supplemental dictionary information. The lookup happens automatically when the page opens or switches to a new entry and the native definition is available.

The current word or phrase is sent over HTTPS to `https://dict.youdao.com/` as part of the request path. Requests omit cookies and the referring page. Like any HTTPS service, Youdao may receive technical information required for network communication, such as an IP address and User-Agent, under its own policies; the extension developer does not receive this information. Responses are used only to render definitions, examples, phrases, synonyms, and usage comparisons. Word-division hints are computed locally.

Dictionary responses are cached only in the extension Service Worker's memory. Cache entries are valid for 15 minutes; expired entries are not reused and are removed on the next lookup. All entries disappear when the worker is discarded. The extension does not use Chrome storage, a local database, or a developer-operated server. It does not collect account details, cookies, study records, browsing history, or identity data, and contains no advertising, analytics, or tracking code. Data is not sold or used for purposes unrelated to the extension's single purpose.

The use and transfer of information received from Chrome APIs will adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data), including the Limited Use requirements.

Questions or privacy requests may be submitted through [GitHub Issues](https://github.com/zerolfx/shanbay-helper/issues).
