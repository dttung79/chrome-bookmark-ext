// Function to get all categories with bookmarks
function getCategories(callback) {
    chrome.storage.sync.get(['categories'], (data) => {
        callback(data.categories || []);
    });
}

// Function to save categories
function saveCategories(categories, callback) {
    chrome.storage.sync.set({ categories }, () => {
        if (callback) {
            callback();
        }
    });
}

// Function to add a new bookmark to a category
function addBookmarkToCategory(categoryName, bookmark, callback) {
    getCategories((categories) => {
        const category = categories.find(c => c.name === categoryName);
        if (category) {
            category.bookmarks.push(bookmark);
            saveCategories(categories, callback);
        }
    });
}

// Function to delete a bookmark by its ID
function deleteBookmark(bookmarkId, callback) {
    getCategories((categories) => {
        const updatedCategories = categories.map(category => {
            category.bookmarks = category.bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
            return category;
        });
        saveCategories(updatedCategories, callback);
    });
}

// Function to delete a category by its name (also removes all bookmarks in that category)
function deleteCategory(categoryName, callback) {
    getCategories((categories) => {
        const updatedCategories = categories.filter(category => category.name !== categoryName);
        saveCategories(updatedCategories, callback);
    });
}

// Function to search bookmarks by tags
function searchBookmarksByTags(tags, callback) {
    getCategories((categories) => {
        const matchedBookmarks = [];
        categories.forEach(category => {
            category.bookmarks.forEach(bookmark => {
                if (tags.every(tag => bookmark.tags.includes(tag))) {
                    matchedBookmarks.push(bookmark);
                }
            });
        });
        callback(matchedBookmarks);
    });
}
