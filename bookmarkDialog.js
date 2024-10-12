function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const url = urlParams.get('url');
    const author = urlParams.get('author'); // Get the author from URL parameters

    document.getElementById('bookmark-name').value = title;
    document.getElementById('bookmark-url').value = url; // Ensure this element exists in HTML
    document.getElementById('bookmark-author').value = author; // Ensure this element exists in HTML

    // Load categories from storage and populate the select element
    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        const categorySelect = document.getElementById('bookmark-category');
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    });

    document.getElementById('bookmark-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('bookmark-name').value;
        const category = document.getElementById('bookmark-category').value;
        const tags = document.getElementById('bookmark-tags').value.split(' ');
        const author = document.getElementById('bookmark-author').value; // Get the author value

        const bookmark = {
            id: generateUniqueId(),
            name,
            url,
            category,
            tags,
            author, // Save the author information
            addedDate: new Date().toISOString()
        };

        chrome.storage.sync.get(['categories'], (data) => {
            const categories = data.categories || [];
            const categoryIndex = categories.findIndex(cat => cat.name === category);
            if (categoryIndex !== -1) {
                categories[categoryIndex].bookmarks.push(bookmark);
            } else {
                categories.push({ name: category, bookmarks: [bookmark] });
            }
            chrome.storage.sync.set({ categories }, () => {
                window.close();
            });
        });
    });
});
