// Display bookmarks for a specific category
function showBookmarksForCategory(categoryName) {
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        const category = categories.find(c => c.name === categoryName);
        if (category) {
            const categoryList = document.getElementById("category-list");
            categoryList.innerHTML = "";
            category.bookmarks.forEach(bookmark => {
                const li = document.createElement("li");
                li.classList.add("bookmark-item");

                // Create a link for the bookmark name
                const a = document.createElement("a");
                a.textContent = truncateText(bookmark.name, 50);
                a.href = bookmark.url;
                a.target = "_blank";  // Open in a new tab
                a.title = bookmark.name;  // Show full name on hover

                li.appendChild(a);  // Add the hyperlink to the list item

                // Create the action container for edit and delete buttons
                const actionContainer = document.createElement("div");
                actionContainer.classList.add("bookmark-actions");

                // Edit button (pencil icon)
                const editBtn = document.createElement("button");
                editBtn.innerHTML = `<i class="fas fa-edit"></i>`; // Font Awesome Edit icon
                editBtn.addEventListener("click", (e) => {
                    e.stopPropagation();  // Prevent the URL from opening
                    editBookmark(bookmark);  // Open the edit dialog
                });

                // Delete button (trash icon)
                const deleteBtn = document.createElement("button");
                deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`; // Font Awesome Delete icon
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();  // Prevent the URL from opening
                    deleteBookmark(bookmark.id);  // Delete the bookmark
                });

                // Append edit and delete buttons to the action container
                actionContainer.appendChild(editBtn);
                actionContainer.appendChild(deleteBtn);

                // Append the action container to the list item
                li.appendChild(actionContainer);

                // Append the list item to the category list
                categoryList.appendChild(li);
            });
        }
    });

}

// Live Search bookmarks by tags
function liveSearchBookmarks(searchQuery, searchResults) {
    const tags = searchQuery.split(';').map(tag => tag.trim().toLowerCase());  // Separate input by semicolon and convert to lowercase
    if (tags.length === 0 || tags[0] === '') {
        searchResults.innerHTML = ''; // Clear search results if no tags are entered
        return;
    }

    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        const matchedBookmarks = [];
        categories.forEach(category => {
            category.bookmarks.forEach(bookmark => {
                const bookmarkTags = bookmark.tags.map(tag => tag.toLowerCase());  // Convert bookmark tags to lowercase
                if (tags.every(tag => bookmarkTags.includes(tag))) {
                    matchedBookmarks.push(bookmark);
                }
            });
        });
        displaySearchResults(matchedBookmarks, searchResults);
    });
}

// Display search results for bookmarks
function displaySearchResults(bookmarks, searchResults) {
    searchResults.innerHTML = "";
    bookmarks.forEach(bookmark => {
        const li = document.createElement("li");
        li.classList.add("bookmark-item");

        // Create a link for the bookmark name
        const a = document.createElement("a");
        a.textContent = `${truncateText(bookmark.name, 50)} (${bookmark.addedDate})`;
        a.href = bookmark.url;
        a.target = "_blank";  // Open in a new tab
        a.title = bookmark.name;  // Show full name on hover

        li.appendChild(a);  // Add the hyperlink to the list item

        // Create the action container for edit and delete buttons
        const actionContainer = document.createElement("div");
        actionContainer.classList.add("bookmark-actions");

        // Edit button (pencil icon)
        const editBtn = document.createElement("button");
        editBtn.innerHTML = `<i class="fas fa-edit"></i>`; // Font Awesome Edit icon
        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();  // Prevent the URL from opening
            editBookmark(bookmark);  // Open the edit dialog
        });

        // Delete button (trash icon)
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`; // Font Awesome Delete icon
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();  // Prevent the URL from opening
            deleteBookmark(bookmark.id);  // Delete the bookmark
        });

        // Append edit and delete buttons to the action container
        actionContainer.appendChild(editBtn);
        actionContainer.appendChild(deleteBtn);

        // Append the action container to the list item
        li.appendChild(actionContainer);

        // Append the list item to the search results
        searchResults.appendChild(li);
    });
}

// Edit bookmark
function editBookmark(bookmark) {
    // Open the new edit bookmark dialog with query parameters for prepopulation
    const editUrl = `editBookmarkDialog.html?id=${bookmark.id}&url=${bookmark.url}&addedDate=${bookmark.addedDate}`;
    chrome.windows.create({
        url: editUrl,
        type: "popup",
        width: 400,
        height: 400
    });
}
// Delete bookmark
function deleteBookmark(bookmarkId) {
    chrome.runtime.sendMessage({ action: 'deleteBookmark', bookmarkId }, (response) => {
        if (response.success) {
            displayCategories();
        }
    });
}
