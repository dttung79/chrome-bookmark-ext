// Helper function to create a bookmark list item
function createBookmarkListItem(bookmark) {
    const li = document.createElement("li");
    li.classList.add("bookmark-item");

    // Create a link for the author
    const authorLink = document.createElement("a");
    authorLink.textContent = truncateText(bookmark.author, 15);
    authorLink.href = `https://x.com/${bookmark.author}`;
    authorLink.target = "_blank";  // Open in a new tab
    authorLink.title = bookmark.author;  // Show full name on hover
    authorLink.className = 'author-link'; // Add a class for CSS styling

    // Create a separator with spaces
    const separator = document.createTextNode(" | ");

    // Create a link for the bookmark name
    const nameLink = document.createElement("a");
    nameLink.textContent = truncateText(bookmark.name, 50);
    nameLink.href = bookmark.url;
    nameLink.target = "_blank";  // Open in a new tab
    nameLink.title = bookmark.name;  // Show full name on hover
    nameLink.className = 'name-link'; // Add a class for CSS styling

    li.appendChild(authorLink);  // Add the author link to the list item
    li.appendChild(separator);  // Add the separator to the list item
    li.appendChild(nameLink);  // Add the name link to the list item

    // alert html of li
    //alert(li.outerHTML);

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

    return li;
}

// Display bookmarks for a specific category
function showBookmarksForCategory(categoryName) {
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        const category = categories.find(c => c.name === categoryName);
        if (category) {
            const categoryList = document.getElementById("category-list");
            categoryList.innerHTML = "";
            category.bookmarks.forEach(bookmark => {
                const li = createBookmarkListItem(bookmark);
                categoryList.appendChild(li);
            });
        }
    });
}

// Live Search bookmarks by tags
// Live Search bookmarks by tags
function liveSearchBookmarks(searchQuery, searchResults) {
    const tags = searchQuery.split(' ').map(tag => tag.trim().toLowerCase());
    if (tags.length === 0 || tags[0] === '') {
        searchResults.innerHTML = ''; // Clear search results if no tags are entered
        return;
    }

    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        const matchedBookmarks = [];
        categories.forEach(category => {
            category.bookmarks.forEach(bookmark => {
                const bookmarkTags = bookmark.tags.map(tag => tag.toLowerCase());
                if (tags.every(searchTag =>
                    bookmarkTags.some(bookmarkTag => bookmarkTag.includes(searchTag))
                )) {
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
        const li = createBookmarkListItem(bookmark);
        searchResults.appendChild(li);
    });
}

// Edit bookmark
function editBookmark(bookmark) {
    const editSection = document.getElementById('edit-bookmark');
    const editNameInput = document.getElementById('edit-bookmark-name');
    const editUrlInput = document.getElementById('edit-bookmark-url');
    const editAuthorInput = document.getElementById('edit-bookmark-author');
    const editTagsInput = document.getElementById('edit-bookmark-tags');
    const editCategorySelect = document.getElementById('edit-bookmark-category');

    // Populate the form with the current bookmark data
    editNameInput.value = bookmark.name;
    editUrlInput.value = bookmark.url;
    editAuthorInput.value = bookmark.author;
    editTagsInput.value = bookmark.tags.join('; ');
    document.getElementById('edit-bookmark-id').value = bookmark.id;

    // Populate the category dropdown
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        editCategorySelect.innerHTML = ''; // Clear existing options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            if (category.bookmarks.some(b => b.id === bookmark.id)) {
                option.selected = true;
            }
            editCategorySelect.appendChild(option);
        });
    });

    // Show the edit section
    editSection.classList.remove('hidden');
}

// Save the edited bookmark
document.getElementById('edit-bookmark-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const bookmarkId = document.getElementById('edit-bookmark-id').value;
    const updatedBookmark = {
        id: bookmarkId,
        name: document.getElementById('edit-bookmark-name').value,
        url: document.getElementById('edit-bookmark-url').value,
        author: document.getElementById('edit-bookmark-author').value,
        tags: document.getElementById('edit-bookmark-tags').value.split(';').map(tag => tag.trim())
    };

    const newCategory = document.getElementById('edit-bookmark-category').value;

    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        let bookmarkUpdated = false;

        const updatedCategories = categories.map(category => {
            const updatedBookmarks = category.bookmarks.map(b => {
                if (b.id === bookmarkId) {
                    bookmarkUpdated = true;
                    return updatedBookmark;
                }
                return b;
            });

            if (category.name === newCategory) {
                if (!bookmarkUpdated) {
                    updatedBookmarks.push(updatedBookmark);
                }
                return { ...category, bookmarks: updatedBookmarks };
            } else {
                return { ...category, bookmarks: updatedBookmarks.filter(b => b.id !== bookmarkId) };
            }
        });

        chrome.storage.sync.set({ categories: updatedCategories }, () => {
            document.getElementById('edit-bookmark').classList.add('hidden');
            displayCategories();
        });
    });
});

// Cancel editing
document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-bookmark').classList.add('hidden');
});

// Delete bookmark
function deleteBookmark(bookmarkId) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
        chrome.runtime.sendMessage({ action: 'deleteBookmark', bookmarkId }, (response) => {
            if (response.success) {
                displayCategories();
            }
        });
    }
}
