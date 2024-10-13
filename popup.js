document.addEventListener("DOMContentLoaded", () => {
  // Set popup size
  document.body.style.width = 'auto';
  document.body.style.height = 'auto';
  document.body.style.minWidth = '200px';
  document.body.style.minHeight = '150px';

  const browseCategoriesBtn = document.getElementById("browse-categories-btn");
  const addCategoryBtn = document.getElementById("add-category-btn");
  const searchBtn = document.getElementById("search-btn");
  const backBtnBrowse = document.getElementById("back-btn");
  const backBtnAdd = document.getElementById("back-btn-add");
  const backBtnSearch = document.getElementById("back-btn-search");
  const addCategorySubmit = document.getElementById("add-category-submit");
  const newCategoryName = document.getElementById("new-category-name");
  const searchTags = document.getElementById("search-tags");
  const searchResults = document.getElementById("search-results");

  // Show Browse Categories Section
  browseCategoriesBtn.addEventListener("click", () => {
      showSection("browse-categories");
      displayCategories();
  });

  // Show Add Category Section and focus on the textbox
  addCategoryBtn.addEventListener("click", () => {
      showSection("add-category"); // Show the Add Category section
      newCategoryName.focus(); // Focus on the Add Category textbox
  });

  // Show Search Bookmarks Section and focus on the search box
  searchBtn.addEventListener("click", () => {
      showSection("search-bookmarks");
      searchTags.value = ''; // Clear input field
      searchResults.innerHTML = ''; // Clear previous results
      searchTags.focus(); // Focus on the search textbox
  });

  // Back Buttons
  backBtnBrowse.addEventListener("click", () => showSection("main"));
  backBtnAdd.addEventListener("click", () => showSection("main"));
  backBtnSearch.addEventListener("click", () => showSection("main"));

  // Add new category
  addCategorySubmit.addEventListener("click", () => addNewCategory(newCategoryName));

  // Live Search bookmarks by tags
  searchTags.addEventListener("input", () => liveSearchBookmarks(searchTags.value.trim(), searchResults));
});

function resizePopup() {
    const body = document.body;
    const html = document.documentElement;

    const height = Math.max(body.scrollHeight, body.offsetHeight, 
                            html.clientHeight, html.scrollHeight, html.offsetHeight);
    const width = Math.max(body.scrollWidth, body.offsetWidth, 
                           html.clientWidth, html.scrollWidth, html.offsetWidth);

    chrome.runtime.sendMessage({
        action: 'resizePopup',
        width: Math.min(1000, width + 40), // Increase max width to 1000px and add more padding
        height: Math.min(800, height + 40) // Increase max height to 800px and add more padding
    });
}
