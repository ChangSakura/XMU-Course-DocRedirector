document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get({
    urlListenerEnabled: true,
    downloadAutomationEnabled: false,
    autoCloseEnabled: false
  }, function (settings) {
    // 初始化开关状态
    document.getElementById('urlListenerToggle').checked = settings.urlListenerEnabled;
    document.getElementById('downloadAutomationToggle').checked = settings.downloadAutomationEnabled;

    // 如果下载自动化禁用，强制关闭自动关闭功能
    if (!settings.downloadAutomationEnabled) {
      settings.autoCloseEnabled = false;
      chrome.storage.sync.set({ autoCloseEnabled: false });
    }

    document.getElementById('autoCloseToggle').checked = settings.autoCloseEnabled;
    document.getElementById('autoCloseToggle').disabled = !settings.downloadAutomationEnabled;
  });

  // 监听设置变化
  document.getElementById('urlListenerToggle').addEventListener('change', function (e) {
    chrome.storage.sync.set({ urlListenerEnabled: e.target.checked });
  });

  document.getElementById('downloadAutomationToggle').addEventListener('change', function (e) {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ downloadAutomationEnabled: isEnabled }, () => {
      const autoCloseToggle = document.getElementById('autoCloseToggle');
      autoCloseToggle.disabled = !isEnabled;

      // 当禁用下载自动化时，同时关闭自动关闭功能
      if (!isEnabled) {
        autoCloseToggle.checked = false;
        chrome.storage.sync.set({ autoCloseEnabled: false });
      }
    });
  });

  document.getElementById('autoCloseToggle').addEventListener('change', function (e) {
    if (document.getElementById('downloadAutomationToggle').checked) {
      chrome.storage.sync.set({ autoCloseEnabled: e.target.checked });
    }
  });
});