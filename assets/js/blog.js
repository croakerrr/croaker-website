/**
 * Blog System
 * Handles loading, filtering, and displaying blog posts with search functionality.
 * 
 * @author Liam Hughes
 */
let allPosts = [];
let filteredPosts = [];
let activeFilters = { year: null, language: null, category: null, sort: 'newest' };
let searchTerm = '';

function getTagColor(tagValue, tagType) {
  // Color based on filter category type
  switch(tagType) {
    case 'year':
      return 'blue';
    case 'language': 
      return 'orange';
    case 'topic':
      return 'green';
    default:
      return 'gray';
  }
}

function isNewestPost(post) {
  if (!allPosts.length) return false;
  
  // Find the post with the most recent date
  const newestPost = allPosts.reduce((newest, current) => {
    const newestDate = parseDate(newest.date);
    const currentDate = parseDate(current.date);
    return currentDate > newestDate ? current : newest;
  });
  
  return post.id === newestPost.id;
}

function setupFilters() {
  // Extract unique values, with fallback to original blog defaults when no posts exist
  const years = allPosts.length > 0 ? 
    [...new Set(allPosts.map(p => p.year))].sort((a, b) => b - a) : 
    [2026];
    
  // Only show predefined language and topic categories in filters
  // Custom tags get mapped to these predefined categories when used in posts
  const languages = ['web-technologies', 'java', 'python'];
  const categories = ['university', 'project-update', 'misc'];
  
  // Create filter options
  createFilterOptions('year-options', years, 'year');
  createFilterOptions('language-options', languages, 'language');
  createFilterOptions('category-options', categories, 'category');
}

async function loadBlogPosts() {
  try {
    const response = await fetch('/api/get-posts');
    allPosts = await response.json();
    
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;
    
    // Setup filters
    setupFilters();
    
    // Sort options event listeners
    document.querySelectorAll('#sort-options [data-sort]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#sort-options [data-sort]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeFilters.sort = e.target.dataset.sort;
        updateSortIndicator();
        applyFilters();
      });
    });
    
    // Search input
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    
    if (searchInput && searchClearBtn) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        applyFilters();
        updateSearchIcon();
      });
      
      searchClearBtn.addEventListener('click', () => {
        if (searchTerm) {
          clearSearch();
        }
      });
    }
    
    function clearSearch() {
      searchInput.value = '';
      searchTerm = '';
      applyFilters();
      updateSearchIcon();
    }
    
    function updateSearchIcon() {
      const searchIcon = searchClearBtn.querySelector('.search-icon');
      const clearIcon = searchClearBtn.querySelector('.clear-icon');
      if (searchTerm) {
        if (searchIcon) searchIcon.style.display = 'none';
        if (clearIcon) clearIcon.style.display = 'block';
      } else {
        if (searchIcon) searchIcon.style.display = 'block';
        if (clearIcon) clearIcon.style.display = 'none';
      }
    }
    
    // Initial render
    updateSortIndicator();
    applyFilters();
    
  } catch (error) {
    console.error('Error loading blog posts:', error);
  }
}

function openPostModal(post) {
  const modal = document.getElementById('post-modal');
  const modalDate = document.getElementById('modal-date');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const modalTags = document.getElementById('modal-tags');
  const modalAuthor = document.getElementById('modal-author');
  
  if (modalDate) {
    let dateHTML = post.date;
    
    // Add badges for pinned and newest posts (without emojis, to the right)
    if (post.pinned) {
      dateHTML += ' <span class="pinned-post-badge">PINNED</span>';
    } else if (isNewestPost(post)) {
      dateHTML += ' <span class="new-post-badge">NEW POST!</span>';
    }
    
    modalDate.innerHTML = dateHTML;
  }
  if (modalTitle) modalTitle.textContent = post.title;
  
  // Handle content with optional image
  if (modalContent) {
    let contentHTML = post.content.replace(/\n/g, '</p><p>');
    contentHTML = '<p>' + contentHTML + '</p>';
    
    if (post.image) {
      contentHTML = '<div class="blog-post-image"><img src="' + post.image + '" alt="' + post.title + '"></div>' + contentHTML;
    }
    
    modalContent.innerHTML = contentHTML;
  }
  
  if (modalTags) {
    const filterTags = [
      { value: post.year.toString(), type: 'year' },
      { value: post.language, type: 'language' }, 
      { value: post.category, type: 'topic' }
    ].filter(tag => tag.value && tag.value !== 'null' && tag.value !== null && tag.value.trim() !== '' && tag.value.toLowerCase() !== 'null');
    
    const tagsHTML = filterTags.map(tag => {
      const tagColor = getTagColor(tag.value, tag.type);
      return '<span class="blog-tag" data-color="' + tagColor + '">' + tag.value + '</span>';
    }).join('');
    modalTags.innerHTML = tagsHTML;
  }
  
  if (modalAuthor) {
    modalAuthor.innerHTML = '@ ' + post.author + ' <span class="admin-badge">admin</span>';
  }
  
  // Calculate scrollbar width to prevent content jump
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = scrollbarWidth + 'px';
  
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closePostModal() {
  const modal = document.getElementById('post-modal');
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
  
  // Remove padding compensation
  document.body.style.paddingRight = '';
}

function createFilterOptions(containerId, values, filterType) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // "All" button
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-option active';
  allBtn.textContent = 'all';
  allBtn.dataset.value = null;
  allBtn.addEventListener('click', () => {
    container.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    activeFilters[filterType] = null;
    applyFilters();
  });
  container.appendChild(allBtn);
  
  // Value buttons
  values.forEach(value => {
    const btn = document.createElement('button');
    btn.className = 'filter-option';
    btn.textContent = value;
    btn.dataset.value = value;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters[filterType] = value;
      applyFilters();
    });
    container.appendChild(btn);
  });
}

function parseDate(dateString) {
  // Handle both DD/MM/YYYY and MM/DD/YYYY formats
  console.log('Parsing date:', dateString);
  
  if (!dateString) return new Date(0);
  
  // Check if it's in DD/MM/YYYY format (day > 12) or MM/DD/YYYY format
  const parts = dateString.split('/');
  if (parts.length !== 3) return new Date(dateString); // fallback to native parsing
  
  const [first, second, year] = parts.map(Number);
  
  // If first part > 12, assume DD/MM/YYYY format
  if (first > 12) {
    const date = new Date(year, second - 1, first);
    console.log('Parsed as DD/MM/YYYY:', date);
    return date;
  } else {
    // Assume MM/DD/YYYY format or could be either
    const date = new Date(year, first - 1, second);
    console.log('Parsed as MM/DD/YYYY:', date);
    return date;
  }
}

function applyFilters() {
  // Filter by active filters
  filteredPosts = allPosts.filter(post => {
    const matchesYear = !activeFilters.year || post.year == activeFilters.year;
    const matchesLanguage = !activeFilters.language || post.language === activeFilters.language;
    const matchesCategory = !activeFilters.category || post.category === activeFilters.category;
    
    // Search functionality
    let matchesSearch = true;
    if (searchTerm) {
      const searchInTitle = post.title.toLowerCase().includes(searchTerm);
      const searchInContent = post.content.toLowerCase().includes(searchTerm);
      const searchInTags = post.tags && post.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      );
      const searchInAuthor = post.author && post.author.toLowerCase().includes(searchTerm);
      
      matchesSearch = searchInTitle || searchInContent || searchInTags || searchInAuthor;
    }
    
    return matchesYear && matchesLanguage && matchesCategory && matchesSearch;
  });
  
  // Apply sorting
  if (activeFilters.sort === 'newest') {
    filteredPosts.sort((a, b) => {
      // First sort by pinned status (pinned posts first)
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Then sort by date
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB - dateA;
    });
  } else if (activeFilters.sort === 'oldest') {
    filteredPosts.sort((a, b) => {
      // First sort by pinned status (pinned posts first)
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Then sort by date
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA - dateB;
    });
  }
  
  updateSortIndicator();
  renderPosts();
}

function updateSortIndicator() {
  const sortText = document.getElementById('sort-text');
  if (sortText) {
    sortText.textContent = 'sorted by: ' + activeFilters.sort;
  }
}

function renderPosts() {
  const blogList = document.getElementById('blog-list');
  if (!blogList) return;
  
  blogList.innerHTML = '';
  
  if (filteredPosts.length === 0) {
    blogList.innerHTML = '<div class="empty-state">no posts found matching your search criteria</div>';
    return;
  }
  
  filteredPosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'blog-post';
    postElement.dataset.postId = post.id;
    
    // Generate tags only for filter categories (year, language, topic) that have values
    const filterTags = [
      { value: post.year.toString(), type: 'year' },
      { value: post.language, type: 'language' }, 
      { value: post.category, type: 'topic' }
    ].filter(tag => tag.value && tag.value !== 'null' && tag.value !== null && tag.value.trim() !== '' && tag.value.toLowerCase() !== 'null');
    
    const tagsHTML = filterTags.map(tag => {
      const tagColor = getTagColor(tag.value, tag.type);
      return '<span class="blog-tag" data-color="' + tagColor + '">' + tag.value + '</span>';
    }).join('');
    
    // Check if post is newest (and not pinned)
    const newPostLabel = (isNewestPost(post) && !post.pinned) ? '<span class="new-post-badge">NEW POST!</span>' : '';
    
    // Check if post is pinned
    const pinnedLabel = post.pinned ? '<span class="pinned-post-badge">PINNED</span>' : '';
    
    // Add thumbnail area - always present for consistent layout
    const thumbnailHTML = post.image ? 
      '<div class="blog-post-thumbnail"><img src="' + post.image + '" alt="' + post.title + '"></div>' : 
      '<div class="blog-post-thumbnail blog-post-thumbnail-placeholder"></div>';
    
    postElement.innerHTML = '<div class="blog-post-content">' +
      '<div class="blog-post-header">' +
        '<div class="blog-post-meta">' +
          '<span>' + post.date + '</span>' + pinnedLabel + newPostLabel +
        '</div>' +
      '</div>' +
      '<h2 class="blog-post-title">' + post.title + '</h2>' +
      '<p class="blog-post-excerpt">' + post.excerpt + '</p>' +
      '<div class="blog-post-footer">' +
        '<div class="blog-post-tags">' + tagsHTML + '</div>' +
        '<div class="blog-post-author">@ ' + post.author + ' <span class="admin-badge">admin</span></div>' +
      '</div>' +
    '</div>' + thumbnailHTML;
    
    // Add click handler for modal
    postElement.addEventListener('click', () => {
      openPostModal(post);
    });
    
    blogList.appendChild(postElement);
  });
}

// Initialize modal functionality
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
  
  // Modal functionality
  const modal = document.getElementById('post-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalBackdrop = modal && modal.querySelector('.modal-backdrop');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closePostModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closePostModal);
  }
  
  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePostModal();
    }
  });
});