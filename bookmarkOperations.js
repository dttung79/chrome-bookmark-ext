// Helper function to create a bookmark list item
function createBookmarkTableRow(bookmark) {
    const tr = document.createElement("tr");

    // Author column
    const authorTd = document.createElement("td");
    authorTd.classList.add("author-column");
    const authorLink = document.createElement("a");
    authorLink.textContent = truncateText(bookmark.author, 15);
    authorLink.href = `https://x.com/${bookmark.author}`;
    authorLink.target = "_blank";
    authorLink.title = bookmark.author;
    authorTd.appendChild(authorLink);

    // Post column
    const postTd = document.createElement("td");
    postTd.classList.add("post-column");
    const nameLink = document.createElement("a");
    nameLink.textContent = truncateText(bookmark.name, 50);
    nameLink.href = bookmark.url;
    nameLink.target = "_blank";
    nameLink.title = bookmark.name;
    postTd.appendChild(nameLink);

    // Actions column
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("actions-column");
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("bookmark-actions");

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editBookmark(bookmark);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteBookmark(bookmark.id);
    });

    actionContainer.appendChild(editBtn);
    actionContainer.appendChild(deleteBtn);
    actionsTd.appendChild(actionContainer);

    tr.appendChild(authorTd);
    tr.appendChild(postTd);
    tr.appendChild(actionsTd);

    return tr;
}
function showBookmarksForCategory(categoryName) {
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        const category = categories.find(c => c.name === categoryName);
        if (category) {
            const table = document.createElement("table");
            table.classList.add("bookmark-table");
            const categoryList = document.getElementById("category-list");
            categoryList.innerHTML = "";    // hide category section
            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th>Author</th>
                    <th>Post</th>
                    <th>Actions</th>
                </tr>
            `;
            table.appendChild(thead);
            
            const tbody = document.createElement("tbody");
            category.bookmarks.forEach(bookmark => {
                const tr = createBookmarkTableRow(bookmark);
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            
            categoryList.appendChild(table);
        }
    });
}

function displaySearchResults(bookmarks, searchResults) {
    searchResults.innerHTML = "";
    
    const table = document.createElement("table");
    table.classList.add("bookmark-table");
    
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Author</th>
            <th>Post</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement("tbody");
    bookmarks.forEach(bookmark => {
        const tr = createBookmarkTableRow(bookmark);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    searchResults.appendChild(table);
}

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
    
    const table = document.createElement("table");
    table.classList.add("bookmark-table");
    
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Author</th>
            <th>Post</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement("tbody");
    bookmarks.forEach(bookmark => {
        const tr = createBookmarkTableRow(bookmark);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    searchResults.appendChild(table);
}

function editBookmark(bookmark) {
    const editSection = document.getElementById('edit-bookmark');
    const editNameInput = document.getElementById('edit-bookmark-name');
    const editUrlInput = document.getElementById('edit-bookmark-url');
    const editAuthorInput = document.getElementById('edit-bookmark-author');
    const editTagsInput = document.getElementById('edit-bookmark-tags');
    const editCategorySelect = document.getElementById('edit-bookmark-category');
    const editBookmarkId = document.getElementById('edit-bookmark-id');

    // Check if all required elements exist
    if (!editSection || !editNameInput || !editUrlInput || !editAuthorInput || 
        !editTagsInput || !editCategorySelect || !editBookmarkId) {
        console.error('One or more edit form elements are missing');
        return;
    }

    // Populate the form with the current bookmark data
    editNameInput.value = bookmark.name;
    editUrlInput.value = bookmark.url;
    editAuthorInput.value = bookmark.author;
    editTagsInput.value = bookmark.tags.join('; ');
    editBookmarkId.value = bookmark.id;

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
            if (category.name === newCategory) {
                // If this is the new category, add the bookmark if it's not already there
                const existingBookmarkIndex = category.bookmarks.findIndex(b => b.id === bookmarkId);
                if (existingBookmarkIndex === -1) {
                    category.bookmarks.push(updatedBookmark);
                } else {
                    category.bookmarks[existingBookmarkIndex] = updatedBookmark;
                }
                bookmarkUpdated = true;
                return { ...category, bookmarks: category.bookmarks };
            } else {
                // For other categories, remove the bookmark if it exists
                return { ...category, bookmarks: category.bookmarks.filter(b => b.id !== bookmarkId) };
            }
        });
    
        // If the bookmark wasn't found in any existing category, create a new one
        if (!bookmarkUpdated) {
            updatedCategories.push({ name: newCategory, bookmarks: [updatedBookmark] });
        }
    
        chrome.storage.sync.set({ categories: updatedCategories }, () => {
            document.getElementById('edit-bookmark').classList.add('hidden');
            displayCategories();
        });
    });
});

// Cancel editing
document.addEventListener("DOMContentLoaded", () => {
    const cancelEditButton = document.getElementById('cancel-edit-bookmark');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            document.getElementById('edit-bookmark').classList.add('hidden');
        });
    }
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
