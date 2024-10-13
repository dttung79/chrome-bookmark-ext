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
            li.classList.add("category-item");

            const categoryName = document.createElement("span");
            categoryName.textContent = category.name;
            categoryName.classList.add("category-name");
            categoryName.addEventListener("click", () => {
                showBookmarksForCategory(category.name);
            });

            const actionContainer = document.createElement("div");
            actionContainer.classList.add("category-actions");

            // Edit button (pencil icon)
            const editBtn = document.createElement("button");
            editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
            editBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                editCategory(category) 
            });

            // Delete button (trash icon)
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteCategory(category.name) 
            });

            actionContainer.appendChild(editBtn);
            actionContainer.appendChild(deleteBtn);

            li.appendChild(categoryName);
            li.appendChild(actionContainer);
            categoryList.appendChild(li);
        });
    });
}

function deleteCategory(categoryName) {
    if (confirm(`Are you sure you want to delete the category "${categoryName}" and all its bookmarks?`)) {
        chrome.runtime.sendMessage({ action: 'deleteCategory', categoryName }, (response) => {
            if (response.success) {
                displayCategories();
            } else {
                alert('Failed to delete category. Please try again.');
            }
        });
    }
}

function editCategory(category) {
    const editSection = document.getElementById('edit-category');
    const editNameInput = document.getElementById('edit-category-name');
    const editOldNameInput = document.getElementById('edit-category-old-name');

    // Populate the form with the current category data
    editNameInput.value = category.name;
    editOldNameInput.value = category.name;

    // Show the edit section
    editSection.classList.remove('hidden');
}

// Save the edited category
document.getElementById('edit-category-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const oldCategoryName = document.getElementById('edit-category-old-name').value;
    const newCategoryName = document.getElementById('edit-category-name').value;

    if (newCategoryName.trim() === '') {
        alert('Category name cannot be empty');
        return;
    }

    chrome.storage.sync.get(['categories'], (data) => {
        const categories = data.categories || [];
        const updatedCategories = categories.map(category => {
            if (category.name === oldCategoryName) {
                return { ...category, name: newCategoryName };
            }
            return category;
        });

        chrome.storage.sync.set({ categories: updatedCategories }, () => {
            document.getElementById('edit-category').classList.add('hidden');
            displayCategories();
        });
    });
});

// Cancel editing category
document.getElementById('cancel-edit-category').addEventListener('click', () => {
    document.getElementById('edit-category').classList.add('hidden');
});