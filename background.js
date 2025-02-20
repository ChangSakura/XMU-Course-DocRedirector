// 监听所有发往 wps.xmu.edu.cn 的请求
chrome.webRequest.onCompleted.addListener(
  (details) => {
    // 排除非 Tab 发起的请求
    if (details.tabId < 0) return;

    // 获取当前请求所属的 tab 信息
    chrome.tabs.get(details.tabId, (tab) => {
      if (!tab || !tab.url) return;

      // 判断当前页面是否为目标页面（例如：https://lnt.xmu.edu.cn/course/*）
      const targetPagePattern = /^https:\/\/lnt\.xmu\.edu\.cn\/course\/[^\/]+/;

      if (!targetPagePattern.test(tab.url)) return;

      try {
        const urlObj = new URL(details.url);
        const params = urlObj.searchParams;
        // 检查必须存在的参数和 lang 参数的值
        if (
          params.has('_w_appid') &&
          params.has('_w_third_appid') &&
          params.has('_w_third_file_id') &&
          params.has('route_key') &&
          params.get('lang') === 'zh-CN' &&
          // 检查是否包含需要剔除的参数
          params.has('simple') &&
          params.has('hidecmb') &&
          params.has('readonly')
        ) {
          // 删除不需要的参数
          params.delete('simple');
          params.delete('hidecmb');
          params.delete('readonly');

          // 构造新的 URL
          const newUrl = urlObj.toString();

          // 打开新的链接（这里选择新建 Tab，你也可以选择在当前 Tab 中跳转）
          chrome.tabs.create({ url: newUrl });
        }
      } catch (e) {
        console.error("解析 URL 出错:", e);
      }
    });
  },
  {
    // 只监听 office 链接的请求（可以根据实际情况调整过滤规则）
    urls: ["https://wps.xmu.edu.cn/weboffice/office/*"]
  }
);
