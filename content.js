/**
 * 等待页面上出现指定的元素（第 n 个匹配）
 * 当 n 为 1 时，返回第一个匹配的元素（效果同原 waitForElement）
 * @param {string} selector - CSS 选择器
 * @param {number} [n=1] - 返回第 n 个匹配的元素（从 1 开始计数）
 * @param {number} [timeout=10000] - 超时时间（毫秒）
 * @returns {Promise<Element>}
 */
function waitForElement(selector, n = 1, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 100;
    let timeElapsed = 0;
    const interval = setInterval(() => {
      const elements = document.querySelectorAll(selector);
      if (elements.length >= n) {
        clearInterval(interval);
        resolve(elements[n - 1]);
      }
      timeElapsed += intervalTime;
      if (timeElapsed >= timeout) {
        clearInterval(interval);
        if (n === 1) {
          reject(new Error(`元素 "${selector}" 在 ${timeout} 毫秒内未找到`));
        } else {
          reject(new Error(`找不到第 ${n} 个匹配选择器 "${selector}" 的元素`));
        }
      }
    }, intervalTime);
  });
}

/**
 * 等待页面中下载完成：检测页面中是否还存在 loading 动画
 * 当 .loading-content 元素不存在时，视为下载完成
 * @param {number} [timeout=15000] - 超时时间（毫秒）
 * @returns {Promise<void>}
 */
function waitForDownloadComplete(timeout = 15000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 500;
    let timeElapsed = 0;
    const interval = setInterval(() => {
      const loadingContent = document.querySelector(".loading-content");
      if (!loadingContent) {
        clearInterval(interval);
        console.log("检测到下载完成：加载动画已消失");
        resolve();
      }
      timeElapsed += intervalTime;
      if (timeElapsed >= timeout) {
        clearInterval(interval);
        console.warn("等待下载完成超时");
        reject(new Error("Timeout waiting for download to complete"));
      }
    }, intervalTime);
  });
}

/**
 * 模拟一系列点击操作：
 * 1. 点击菜单按钮
 * 2. 点击“导出”菜单项
 * 3. 点击“导出为 PDF”菜单项
 * 4. 点击最终的导出按钮
 * 5. 如果启用自动关闭，则等待页面加载完成后关闭页面
 */
async function simulateClicks() {
  try {
    // 1. 点击菜单按钮（匹配带有 kd-button-icon 类的按钮）
    await waitForElement("button.kd-button-icon");
    await new Promise(resolve => setTimeout(resolve, 500));
    const menuButton = await waitForElement("button.kd-button-icon");
    menuButton.click();
    console.log("菜单按钮已点击");

    // 2. 点击“导出”菜单项（匹配包含 component-menu-item、sub-menu-item、header-menu-item 的 div）
    await waitForElement("div.component-menu-item.sub-menu-item.header-menu-item");
    await new Promise(resolve => setTimeout(resolve, 500));
    const exportMenuItem = await waitForElement("div.component-menu-item.sub-menu-item.header-menu-item");
    exportMenuItem.click();
    console.log("‘导出’菜单项已点击");

    // 3. 点击“导出为 PDF”菜单项
    // 遍历所有 header-menu-item 的 div，查找文本中包含“导出为 PDF”的那个
    await new Promise(resolve => setTimeout(resolve, 1000));
    const menuItems = document.querySelectorAll("div.component-menu-item.header-menu-item");
    let exportPdfItem = null;
    menuItems.forEach(item => {
      if (item.textContent.includes("导出为 PDF")) {
        exportPdfItem = item;
      }
    });
    if (exportPdfItem) {
      exportPdfItem.click();
      console.log("‘导出为 PDF’菜单项已点击");
    } else {
      console.warn("未找到‘导出为 PDF’菜单项");
      return;
    }

    // 4. 点击最终的导出按钮（匹配具有 export-pdf-button 类的按钮）
    await waitForElement("button.export-pdf-button");
    await new Promise(resolve => setTimeout(resolve, 100));
    const exportButton = await waitForElement("button.export-pdf-button");
    exportButton.click();
    console.log("导出按钮已点击");

    // 5. 检查是否启用自动关闭功能，并等待页面加载完成后关闭页面
    chrome.storage.sync.get("autoCloseEnabled", (data) => {
      if (data.autoCloseEnabled) {
        console.log("启用自动关闭，等待页面加载完成...");
        waitForDownloadComplete().then(() => {
          console.log("页面加载完成，关闭当前页面");
          window.close();
        }).catch(() => {
          console.warn("等待下载完成超时，仍然关闭页面");
          window.close();
        });
      } else {
        console.log("未启用自动关闭，保持页面不关闭");
      }
    });
  } catch (error) {
    console.error("执行点击操作时出错：", error);
  }
}

// 根据设置判断是否启用下载自动化
chrome.storage.sync.get("downloadAutomationEnabled", (data) => {
  if (data.downloadAutomationEnabled) {
    console.log("Download automation enabled");
    window.addEventListener("load", simulateClicks);
  } else {
    console.log("Download automation not enabled");
  }
});
