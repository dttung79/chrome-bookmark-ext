document.addEventListener("DOMContentLoaded", () => {
  const bookmarkShortcutInput = document.getElementById("bookmark-shortcut");
  const browseShortcutInput = document.getElementById("browse-shortcut");
  const searchShortcutInput = document.getElementById("search-shortcut");
  const settingsForm = document.getElementById("settings-form");

  // Load existing settings when the settings page is opened
  chrome.storage.sync.get(['shortcuts'], (data) => {
      const shortcuts = data.shortcuts || {};
      bookmarkShortcutInput.value = shortcuts.bookmarkShortcut || "Command+E";
      browseShortcutInput.value = shortcuts.browseShortcut || "Command+B";
      searchShortcutInput.value = shortcuts.searchShortcut || "Command+S";
  });

  // Save the updated settings when the form is submitted
  settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const shortcuts = {
          bookmarkShortcut: bookmarkShortcutInput.value.trim() || "Command+E",
          browseShortcut: browseShortcutInput.value.trim() || "Command+B",
          searchShortcut: searchShortcutInput.value.trim() || "Command+S"
      };

      chrome.storage.sync.set({ shortcuts }, () => {
          alert("Settings saved!");
      });
  });
});
