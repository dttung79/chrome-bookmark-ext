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
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            let activeTab = tabs[0];
            
            let url = new URL(activeTab.url);
            let author = url.pathname.split('/')[1]; // Extract the author from the URL

            // Send request to get post data
            fetch(`https://xmarkbe.onrender.com/get_post?content=${encodeURIComponent(activeTab.title)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Received data from server:', data);
                    const { name, tags } = data;
                    if (!name && (!tags || tags.length === 0)) {
                        console.warn('Server returned empty data');
                    }
                    
                    // Join tags array into a comma-separated string
                    const tagsString = Array.isArray(tags) ? tags.join(', ') : '';

                    chrome.windows.create({
                        url: `bookmarkDialog.html?title=${encodeURIComponent(name || activeTab.title)}&url=${encodeURIComponent(activeTab.url)}&author=${encodeURIComponent(author)}&tags=${encodeURIComponent(tagsString)}`,
                        type: "popup",
                        width: 400,
                        height: 400
                    });
                })
                .catch(error => {
                    console.error('Error fetching or processing post data:', error);
                    // If there's an error, open the dialog with default values
                    chrome.windows.create({
                        url: `bookmarkDialog.html?title=${encodeURIComponent(activeTab.title)}&url=${encodeURIComponent(activeTab.url)}&author=${encodeURIComponent(author)}`,
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

let categoriesWindowId = null;
