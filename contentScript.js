chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showBookmarkPopup') {
        showBookmarkPopup(request.title, request.url, request.author);
    }
});

function showBookmarkPopup(title, url, author) {
    // Create the popup container
    const popup = document.createElement('div');
    popup.id = 'bookmark-popup';
    popup.style.position = 'fixed';
    popup.style.top = '10%';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '10000';
    popup.style.borderRadius = '8px';

    // Create the form elements
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Title:';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = title;
    titleInput.style.width = '100%';

    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'URL:';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = url;
    urlInput.style.width = '100%';

    const authorLabel = document.createElement('label');
    authorLabel.textContent = 'Author:';
    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.value = author;
    authorInput.style.width = '100%';

    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Category:';
    const categorySelect = document.createElement('select');
    categorySelect.style.width = '100%';

    const tagsLabel = document.createElement('label');
    tagsLabel.textContent = 'Tags:';
    const tagsInput = document.createElement('input');
    tagsInput.type = 'text';
    tagsInput.placeholder = 'Enter tags separated by semicolon';
    tagsInput.style.width = '100%';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.marginTop = '10px';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.padding = '10px';
    saveButton.style.borderRadius = '5px';
    saveButton.style.cursor = 'pointer';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginTop = '10px';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.padding = '10px';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.marginLeft = '10px';

    // Append elements to the popup
    popup.appendChild(titleLabel);
    popup.appendChild(titleInput);
    popup.appendChild(urlLabel);
    popup.appendChild(urlInput);
    popup.appendChild(authorLabel);
    popup.appendChild(authorInput);
    popup.appendChild(categoryLabel);
    popup.appendChild(categorySelect);
    popup.appendChild(tagsLabel);
    popup.appendChild(tagsInput);
    popup.appendChild(saveButton);
    popup.appendChild(cancelButton);

    // Append the popup to the body
    document.body.appendChild(popup);

    // Populate the category dropdown
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    });

    // Handle save button click
    saveButton.addEventListener('click', () => {
        const newBookmark = {
            id: Date.now().toString(), // Generate a unique ID for the bookmark
            name: titleInput.value,
            url: urlInput.value,
            author: authorInput.value,
            tags: tagsInput.value.split(';').map(tag => tag.trim())
        };

        const categoryName = categorySelect.value;

        chrome.storage.sync.get(['categories'], (data) => {
            const categories = data.categories || [];
            const category = categories.find(c => c.name === categoryName);

            if (category) {
                category.bookmarks.push(newBookmark);
            } else {
                categories.push({ name: categoryName, bookmarks: [newBookmark] });
            }

            chrome.storage.sync.set({ categories }, () => {
                // Remove the popup
                document.body.removeChild(popup);
            });
        });
    });

    // Handle cancel button click
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}