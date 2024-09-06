// Helper: Truncate long text and append '...'
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

// Create Edit button
function createEditButton(bookmark) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();  // Prevent the URL from opening
        editBookmark(bookmark);  // Open the edit dialog
    });
    return editBtn;
}

// Create Delete button
function createDeleteButton(bookmarkId) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();  // Prevent the URL from opening
        deleteBookmark(bookmarkId);
    });
    return deleteBtn;
}

// Show section by ID
function showSection(sectionId) {
    document.querySelectorAll("div").forEach(div => div.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");
}
