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

async function loadBlogPosts() {
  try {
    const response = await fetch('/api/get-posts');
    allPosts = await response.json();
    
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;
    
    // Extract unique values, with fallback to original blog defaults when no posts exist
    const years = allPosts.length > 0 ? 
      [...new Set(allPosts.map(p => p.year))].sort((a, b) => b - a) : 
      [2026];
      
    const languages = allPosts.length > 0 ?
      [...new Set(allPosts.map(p => p.language))].sort() :
      ['web technologies', 'java', 'python'];
      
    const categories = allPosts.length > 0 ?
      [...new Set(allPosts.map(p => p.category))].sort() :
      ['university', 'project-update', 'misc'];
    
    // Create filter options
    createFilterOptions('year-options', years, 'year');
    createFilterOptions('language-options', languages, 'language');
    createFilterOptions('category-options', categories, 'category');
    
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
    const searchIcon = searchClearBtn.querySelector('.search-icon');
    const clearIcon = searchClearBtn.querySelector('.clear-icon');
    
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
    
    function updateSearchIcon() {
      if (searchTerm) {
        searchIcon.style.display = 'none';
        clearIcon.style.display = 'block';
        searchClearBtn.style.cursor = 'pointer';
      } else {
        searchIcon.style.display = 'block';
        clearIcon.style.display = 'none';
        searchClearBtn.style.cursor = 'default';
      }
    }
    
    function clearSearch() {
      searchInput.value = '';
      searchTerm = '';
      applyFilters();
      updateSearchIcon();
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
  
  if (modalDate) modalDate.textContent = post.date;
  if (modalTitle) modalTitle.textContent = post.title;
  if (modalContent) modalContent.innerHTML = `<p>${post.content.replace(/\n/g, '</p><p>')}</p>`;
  if (modalTags) {
    const filterTags = [
      { value: post.year.toString(), type: 'year' },
      { value: post.language, type: 'language' }, 
      { value: post.category, type: 'topic' }
    ];
    
    const tagsHTML = filterTags.map(tag => {
      const tagColor = getTagColor(tag.value, tag.type);
      return `<span class="blog-tag" data-color="${tagColor}">${tag.value}</span>`;
    }).join('');
    modalTags.innerHTML = tagsHTML;
  }
  if (modalAuthor) {
    modalAuthor.innerHTML = `@ ${post.author} <span class="admin-badge">admin</span>`;
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
  // Convert DD/MM/YYYY to Date object
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
}

function applyFilters() {
  // Filter by active filters
  filteredPosts = allPosts.filter(post => {
    const matchesYear = !activeFilters.year || post.year == activeFilters.year;
    const matchesLanguage = !activeFilters.language || post.language === activeFilters.language;
    const matchesCategory = !activeFilters.category || post.category === activeFilters.category;
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm) || 
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm);
    
    return matchesYear && matchesLanguage && matchesCategory && matchesSearch;
  });
  
  // Sort by search relevance first if there's a search term
  if (searchTerm) {
    filteredPosts.sort((a, b) => {
      const aScore = calculateSearchScore(a);
      const bScore = calculateSearchScore(b);
      if (aScore !== bScore) return bScore - aScore; // Higher score first
      // Then sort by date
      return activeFilters.sort === 'newest' 
        ? parseDate(b.date) - parseDate(a.date)
        : parseDate(a.date) - parseDate(b.date);
    });
  } else {
    // Sort by date only
    if (activeFilters.sort === 'newest') {
      filteredPosts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    } else {
      filteredPosts.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    }
  }
  
  updateSortIndicator();
  renderPosts();
}

function updateSortIndicator() {
  const sortText = document.getElementById('sort-text');
  if (sortText) {
    sortText.textContent = `sorted by: ${activeFilters.sort}`;
  }
}

function calculateSearchScore(post) {
  let score = 0;
  const lower = searchTerm;
  
  if (post.title.toLowerCase().includes(lower)) score += 3;
  if (post.excerpt.toLowerCase().includes(lower)) score += 2;
  if (post.content.toLowerCase().includes(lower)) score += 1;
  
  return score;
}

function getTagType(tag) {
  // Language/Technology tags
  const languageTags = ['javascript', 'python', 'java', 'rust', 'sql', 'web', 'css', 'html', 'c', 'systems'];
  if (languageTags.some(lang => tag.toLowerCase().includes(lang))) return 'language';
  
  // Learning/Educational tags  
  const learningTags = ['learning', 'tutorial', 'basics', 'intro', 'fundamentals', 'theory', 'algorithms', 'big-o'];
  if (learningTags.some(learn => tag.toLowerCase().includes(learn))) return 'learning';
  
  // Project/Development tags
  const projectTags = ['project', 'portfolio', 'development', 'build', 'design', 'web', 'app'];
  if (projectTags.some(proj => tag.toLowerCase().includes(proj))) return 'project';
  
  // Academic/University tags
  const academicTags = ['coursework', 'university', 'assignment', 'exam', 'study', 'research', 'analysis', 'performance'];
  if (academicTags.some(acad => tag.toLowerCase().includes(acad))) return 'academic';
  
  // Default to general
  return 'general';
}

function renderPosts() {
  const blogList = document.getElementById('blog-list');
  if (!blogList) return;
  
  blogList.innerHTML = '';
  
  if (filteredPosts.length === 0) {
    blogList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="21 21-4.35-4.35"></path>
        </svg>
        <p>no posts found</p>
      </div>
    `;
    return;
  }
  
  filteredPosts.forEach((post, index) => {
    const postElement = document.createElement('article');
    postElement.className = 'blog-post';
    postElement.dataset.postId = post.id;
    
    // Generate tags only for filter categories (year, language, topic)
    const filterTags = [
      { value: post.year.toString(), type: 'year' },
      { value: post.language, type: 'language' }, 
      { value: post.category, type: 'topic' }
    ];
    
    const tagsHTML = filterTags.map(tag => {
      const tagColor = getTagColor(tag.value, tag.type);
      return `<span class="blog-tag" data-color="${tagColor}">${tag.value}</span>`;
    }).join('');
    
    // Check if post is newest
    const newPostLabel = isNewestPost(post) ? '<span class="new-post-badge">NEW POST!</span>' : '';
    
    postElement.innerHTML = `
      <div class="blog-post-header">
        <div class="blog-post-meta">
          <span>${post.date}</span>
          ${newPostLabel}
        </div>
      </div>
      <h3 class="blog-post-title">${post.title}</h3>
      <p class="blog-post-excerpt">${post.excerpt}</p>
      <div class="blog-post-footer">
        <div class="blog-post-tags">
          ${tagsHTML}
        </div>
        <div class="blog-post-author">
          @ ${post.author} <span class="admin-badge">admin</span>
        </div>
      </div>
    `;
    
    // Add click handler for modal
    postElement.addEventListener('click', () => {
      openPostModal(post);
    });
    
    blogList.appendChild(postElement);
  });
}

// Modal functionality
function openPostModal(post) {
  const modal = document.getElementById('post-modal');
  const modalDate = document.getElementById('modal-date');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const modalTags = document.getElementById('modal-tags');
  const modalAuthor = document.getElementById('modal-author');
  
  if (modalDate) modalDate.textContent = post.date;
  if (modalTitle) modalTitle.textContent = post.title;
  if (modalContent) modalContent.innerHTML = `<p>${post.content.replace(/\n/g, '</p><p>')}</p>`;
  if (modalTags) {
    const filterTags = [
      { value: post.year.toString(), type: 'year' },
      { value: post.language, type: 'language' }, 
      { value: post.category, type: 'topic' }
    ];
    
    const tagsHTML = filterTags.map(tag => {
      const tagColor = getTagColor(tag.value, tag.type);
      return `<span class="blog-tag" data-color="${tagColor}">${tag.value}</span>`;
    }).join('');
    modalTags.innerHTML = tagsHTML;
  }
  if (modalAuthor) {
    modalAuthor.innerHTML = `@ ${post.author} <span class="admin-badge">admin</span>`;
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

// Initialize modal functionality
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
  
  // Modal functionality
  const modal = document.getElementById('post-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalBackdrop = modal?.querySelector('.modal-backdrop');
  
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
