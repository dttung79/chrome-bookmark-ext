// Add new category
function addNewCategory(newCategoryName) {
    const categoryName = newCategoryName.value.trim();
    const errorMsg = document.getElementById("error-msg");

    if (!categoryName) {
        errorMsg.classList.remove("hidden");
        return;
    }

    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        if (categories.some(category => category.name === categoryName)) {
            errorMsg.classList.remove("hidden");
            return;
        }

        categories.push({ name: categoryName, bookmarks: [] });
        chrome.storage.sync.set({ categories }, () => {
            newCategoryName.value = "";
            errorMsg.classList.add("hidden");
            showSection("main");
        });
    });
}

// Display all categories
function displayCategories() {
    const categoryList = document.getElementById("category-list");

    chrome.storage.sync.get(['categories'], (data) => {
        categoryList.innerHTML = "";
        const categories = data.categories || [];
        categories.forEach(category => {
            const li = document.createElement("li");
            li.textContent = category.name;
            li.addEventListener("click", () => {
                showBookmarksForCategory(category.name);
            });
            categoryList.appendChild(li);
        });
    });
}
