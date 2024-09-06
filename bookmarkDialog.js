document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageTitle = urlParams.get("title");
    const pageUrl = urlParams.get("url");

    const bookmarkNameInput = document.getElementById("bookmark-name");
    const bookmarkCategorySelect = document.getElementById("bookmark-category");
    const bookmarkTagsInput = document.getElementById("bookmark-tags");
    const bookmarkForm = document.getElementById("bookmark-form");

    // Set the bookmark name (page title) in the input field
    bookmarkNameInput.value = pageTitle || "";

    // Populate categories into the dropdown
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            bookmarkCategorySelect.appendChild(option);
        });
    });

    // Generate default tags (e.g., from page title or URL)
    const defaultTags = generateDefaultTags(pageTitle, pageUrl);
    bookmarkTagsInput.value = defaultTags.join('; ');  // Separate default tags by semicolon

    // Form submission: Save the bookmark with the original URL
    bookmarkForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const bookmark = {
            id: generateUniqueId(),
            name: bookmarkNameInput.value,
            url: pageUrl,  // Save the original URL here
            category: bookmarkCategorySelect.value,
            tags: bookmarkTagsInput.value.split(';').map(tag => tag.trim()),  // Separate tags by semicolon and trim whitespace
            addedDate: new Date().toLocaleString()
        };

        chrome.storage.sync.get(['categories'], (data) => {
            const categories = data.categories || [];
            const category = categories.find(c => c.name === bookmark.category);
            if (category) {
                category.bookmarks.push(bookmark);
            }
            chrome.storage.sync.set({ categories }, () => {
                window.close();  // Close the popup after saving
            });
        });
    });

    // Helper: Generate default tags from title or URL
    function generateDefaultTags(title, url) {
        const titleWords = title ? title.split(/\s+/) : [];
        const domain = new URL(url).hostname.replace('www.', '');
        return [...titleWords.slice(0, 3), domain];  // Limit title words to 3
    }

    // Helper: Generate a unique ID for each bookmark
    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
});
