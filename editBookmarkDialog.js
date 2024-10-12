document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookmarkId = urlParams.get("id");

    const bookmarkNameInput = document.getElementById("edit-bookmark-name");
    const bookmarkCategorySelect = document.getElementById("edit-bookmark-category");
    const bookmarkTagsInput = document.getElementById("edit-bookmark-tags");
    const bookmarkAuthorInput = document.getElementById("edit-bookmark-author"); // New input for author
    const editBookmarkForm = document.getElementById("edit-bookmark-form");

    // Populate categories into the dropdown
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];

        // Populate category options
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            bookmarkCategorySelect.appendChild(option);
        });

        // Find the bookmark based on ID and populate form fields
        categories.forEach(category => {
            const bookmark = category.bookmarks.find(b => b.id === bookmarkId);
            if (bookmark) {
                bookmarkNameInput.value = bookmark.name;
                bookmarkCategorySelect.value = category.name;
                bookmarkTagsInput.value = bookmark.tags.join("; ");
                bookmarkAuthorInput.value = bookmark.author; // Populate author field
            }
        });
    });

    // Save changes on form submission
    editBookmarkForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const updatedBookmark = {
            name: bookmarkNameInput.value,
            tags: bookmarkTagsInput.value.split(';').map(tag => tag.trim()),
            category: bookmarkCategorySelect.value,
            author: bookmarkAuthorInput.value, // Include author in updated bookmark
        };

        chrome.storage.sync.get(['categories'], (data) => {
            const categories = data.categories || [];

            // Find and update the bookmark in the storage
            categories.forEach(category => {
                const bookmarkIndex = category.bookmarks.findIndex(b => b.id === bookmarkId);
                if (bookmarkIndex !== -1) {
                    category.bookmarks.splice(bookmarkIndex, 1);  // Remove from the old category
                }
            });

            // Add the updated bookmark to the new category
            const newCategory = categories.find(c => c.name === updatedBookmark.category);
            if (newCategory) {
                newCategory.bookmarks.push({
                    id: bookmarkId,
                    name: updatedBookmark.name,
                    tags: updatedBookmark.tags,
                    author: updatedBookmark.author, // Include author in new bookmark
                    url: urlParams.get("url"),  // Keep the original URL
                    addedDate: urlParams.get("addedDate"),  // Keep the original added date
                });
            }

            // Save the updated categories back to storage
            chrome.storage.sync.set({ categories }, () => {
                window.close();  // Close the popup after saving
            });
        });
    });
});
