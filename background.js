// 存储监听器引用
let listener1, listener2;

const handler1 = (details) => {
  if (details.tabId < 0) return;

  chrome.tabs.get(details.tabId, (tab) => {
    if (!tab?.url) return;

    const targetPagePattern = /^https:\/\/lnt\.xmu\.edu\.cn\/course\/[^\/]+/;
    if (!targetPagePattern.test(tab.url)) return;

    try {
      const urlObj = new URL(details.url);
      const params = urlObj.searchParams;

      if (
        params.has('_w_appid') &&
        params.has('_w_third_appid') &&
        params.has('_w_third_file_id') &&
        params.has('route_key') &&
        params.get('lang') === 'zh-CN' &&
        params.has('simple') &&
        params.has('hidecmb') &&
        params.has('readonly')
      ) {
        params.delete('simple');
        params.delete('hidecmb');
        params.delete('readonly');
        chrome.tabs.create({ url: urlObj.toString() });
      }
    } catch (e) {
      console.error("解析 URL 出错:", e);
    }
  });
};

const handler2 = (details) => {
  if (details.tabId < 0) return;

  chrome.tabs.get(details.tabId, (tab) => {
    if (!tab?.url) return;

    const targetPagePattern = /^https:\/\/lnt\.xmu\.edu\.cn\/course\/[^\/]+/;
    if (!targetPagePattern.test(tab.url)) return;

    const downloadPattern = /^https:\/\/c-media\.xmu\.edu\.cn\/.*$/;
    const isLogo = details.url.includes('logo.png');

    if (downloadPattern.test(details.url) && !isLogo && details.statusCode === 200 && details.fromCache) {
      chrome.tabs.create({ url: details.url, active: false });
    }
  });
};

// 注册监听器
function registerListeners() {
  unregisterListeners();

  listener1 = chrome.webRequest.onCompleted.addListener(handler1, {
    urls: ["https://wps.xmu.edu.cn/weboffice/office/*"]
  });

  listener2 = chrome.webRequest.onCompleted.addListener(handler2, {
    urls: ["https://c-media.xmu.edu.cn/*"]
  });
}

// 注销监听器
function unregisterListeners() {
  if (listener1) {
    chrome.webRequest.onCompleted.removeListener(listener1);
    listener1 = null;
  }
  if (listener2) {
    chrome.webRequest.onCompleted.removeListener(listener2);
    listener2 = null;
  }
}

// 初始化监听器状态
chrome.storage.sync.get({ urlListenerEnabled: true }, ({ urlListenerEnabled }) => {
  if (urlListenerEnabled) registerListeners();
});

// 监听设置变化
chrome.storage.onChanged.addListener((changes) => {
  if (changes.urlListenerEnabled) {
    changes.urlListenerEnabled.newValue ? registerListeners() : unregisterListeners();
  }
});