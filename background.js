// Initialize storage if not already set
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['categories', 'shortcuts'], (data) => {
      if (!data.categories) {
          chrome.storage.sync.set({ categories: [] });
      }
      if (!data.shortcuts) {
          chrome.storage.sync.set({ shortcuts: { bookmarkShortcut: "Command+E" } });
      }
  });
});

// Listen for shortcut to bookmark the current page
chrome.commands.onCommand.addListener((command) => {
  if (command === "bookmark-current-page") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          let activeTab = tabs[0];
          chrome.storage.sync.get(['categories'], (data) => {
              chrome.windows.create({
                  url: "bookmarkDialog.html?title=" + encodeURIComponent(activeTab.title) + "&url=" + encodeURIComponent(activeTab.url),
                  type: "popup",
                  width: 400,
                  height: 400
              });
          });
      });
  }
});

// Handle bookmark deletion
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'deleteBookmark') {
      chrome.storage.sync.get(['categories'], (data) => {
          const updatedCategories = data.categories.map(category => {
              return {
                  ...category,
                  bookmarks: category.bookmarks.filter(bookmark => bookmark.id !== message.bookmarkId)
              };
          });
          chrome.storage.sync.set({ categories: updatedCategories }, () => {
              sendResponse({ success: true });
          });
      });
      return true;
  }

  if (message.action === 'deleteCategory') {
      chrome.storage.sync.get(['categories'], (data) => {
          const updatedCategories = data.categories.filter(category => category.name !== message.categoryName);
          chrome.storage.sync.set({ categories: updatedCategories }, () => {
              sendResponse({ success: true });
          });
      });
      return true;
  }
});
