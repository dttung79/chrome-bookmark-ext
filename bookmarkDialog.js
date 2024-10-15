function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "showLoading") {
            document.getElementById('loading-dialog').classList.remove('hidden');
            document.getElementById('bookmark-dialog').classList.add('hidden');
        }

        if (request.action === "loadData") {
            const { title, url, author, tags } = request.data;

            // Change loading dialog text to "Load completed"
            document.getElementById('loading-dialog').querySelector('p').textContent = "Load completed";

            // Optionally, you can add a timeout to keep the loading message visible for a moment
            setTimeout(() => {
                // Hide loading dialog
                document.getElementById('loading-dialog').classList.add('hidden');
                document.getElementById('bookmark-dialog').classList.remove('hidden');

                // Populate the form with the received data
                document.getElementById('bookmark-name').value = title;
                document.getElementById('bookmark-url').value = url;
                document.getElementById('bookmark-author').value = author;
                document.getElementById('bookmark-tags').value = tags; // Ensure this element exists in HTML

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
            }, 1000); // Adjus
        }
    });

    document.getElementById('bookmark-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('bookmark-name').value;
        const category = document.getElementById('bookmark-category').value;
        const tags = document.getElementById('bookmark-tags').value.split(' ');
        const author = document.getElementById('bookmark-author').value; // Get the author value
        const url = document.getElementById('bookmark-url').value; // Get the URL value

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
