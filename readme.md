### 特性

#### 单词详情页

+ 用柯林斯词典替换了扇贝的内置词典，也就是可以免费享受到柯林斯词典。
+ 单词显示音节划分。
+ 增加侧栏用于显示词组短语，同近义词，同根词，词语辨析。
+ 将“我的笔记”和“共享笔记”合并，我的笔记中的内容会显示在共享笔记的上方。

#### 听力句子练习页

+ 听力提示将不消耗提示数（支持快捷键使用）。

### 除扇贝外任意网页

这部分感谢 [maicss/chrome-shanbay-v2](https://github.com/maicss/chrome-shanbay-v2) 提供的大部分代码，这里只是对于失效 API 进行了替换。

+ 双击或者选中后右键菜单自动弹出释义，可以一键添加到生词本或者重置单词熟练度。（选项中可以设置自动发音和中英文释义。）
+ 定时提醒背单词（默认间隔三小时）。

### 开发中特性

注：如果没什么人使用的话，将不会更新新特性。

### 已知问题

+ 在文本框内选中查词，弹出框位置固定在左上角。

### 如何安装

+ 对于能访问 Chrome 应用商店的 Chrome 浏览器用户，请直接访问 [Chrome 应用商店页面](https://chrome.google.com/webstore/detail/扇贝助手重制版/acihicpdedimbfbgeoieoblpojeidlcn)，点击添加到 Chrome 即可（支持自动更新）。
+ 对于不能访问 Chrome 应用商店的非 Chrome 浏览器用户（要求是 Chromium 内核的浏览器，如 360 极速浏览器和 QQ 浏览器），请前往 [release 页面](https://github.com/zerolfx/shanbay-helper/releases) 下载 crx 文件，双击打开或者拖拽至浏览器内。
+ 如果以上方法都不行，这里是终极方案：
  + 请前往 [release 页面](https://github.com/zerolfx/shanbay-helper/releases) 下载 zip 文件，解压到某一个本地目录（该目录必须保留，删除后会导致之后安装的插件失效）。
  + 在浏览器的菜单中，找到扩展程序并打开。
  + 勾选“开发者模式”。
  + 选择“加载已解压的扩展程序”并选择刚刚解压后的那个目录，确认后即可完成安装。
  
### 题外话

+ 为什么要写这个插件？
  + 作为课程项目
  + 原有的扇贝 Chrome 插件在扇贝网页版大修之后主要功能失效了，而且作者不再维护（至少好几个月）。
  + 作为曾经的扇贝用户还是对扇贝有点感情的。
+ 为什么不支持网页查词及添加到生词本功能？因为不想做重复劳动，这里推荐和[这个插件](https://github.com/maicss/chrome-shanbay-v2)配合使用。

### For Developer

+ open Developer mode in [chrome://extensions/](chrome://extensions/)
+ click "Load unpacked" button
+ select the directory of this project
+ develop & enjoy yourself

