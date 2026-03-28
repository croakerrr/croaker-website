/**
 * Fixed Sidebar Navigation System
 * Creates a permanent sidebar navigation that's always visible on the left.
 * Includes navigation links and theme toggle integrated into the sidebar.
 * 
 * @author Liam Hughes
 */
class Navigation {
    constructor() {
        this.init();
    }

    // Initialise the navigation system
    init() {
        this.createNavigation();
        this.setupEventListeners();
    }

    // Build the navigation sidebar and inject into the DOM
    createNavigation() {
        // Create the fixed navigation sidebar
        const sidebar = document.createElement('nav');
        sidebar.className = 'nav-sidebar-fixed';
        
        const currentPage = this.getCurrentPage();
        const basePath = this.getBasePath();
        
        sidebar.innerHTML = `
            <div class="nav-header">
                <img src="${basePath}images/croaker-handwritten.png" alt="Croaker" class="nav-logo-handwritten">
            </div>
            <div class="nav-links">
                <a href="${basePath}index.html" ${currentPage === 'index.html' && !window.location.pathname.includes('admin') ? 'class="active"' : ''}>
                    <span>home</span>
                </a>
                <a href="${basePath}pages/projects.html" ${currentPage === 'projects.html' ? 'class="active"' : ''}>
                    <span>projects</span>
                </a>
                <a href="${basePath}pages/cv.html" ${currentPage === 'cv.html' ? 'class="active"' : ''}>
                    <span>cv</span>
                </a>
                <a href="${basePath}pages/blog.html" ${currentPage === 'blog.html' ? 'class="active"' : ''}>
                    <span>blog</span>
                </a>
            </div>
            <div class="nav-footer">
                <a href="${basePath}admin/index.html" class="admin-link ${window.location.pathname.includes('admin') ? 'active' : ''}">
                    <span>admin [cms]</span>
                </a>
                <button class="theme-toggle-sidebar" id="theme-toggle-nav" title="Toggle light/dark mode">
                    <svg class="theme-icon" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                </button>
            </div>
        `;

        // Inject navigation into the page
        document.body.appendChild(sidebar);

        // Store reference
        this.sidebar = sidebar;
    }

    // Set up event listeners
    setupEventListeners() {
        // Handle navigation clicks with smooth page transitions
        this.sidebar.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip transition for current page or external links
                if (this.isCurrentPage(href) || href.startsWith('http') || href.startsWith('mailto:')) {
                    return;
                }

                e.preventDefault();
                
                // Navigate with page transition if available
                if (window.pageTransition) {
                    window.pageTransition.navigateToPage(href);
                } else {
                    window.location.href = href;
                }
            });
        });

        // Theme toggle functionality
        const themeToggle = this.sidebar.querySelector('#theme-toggle-nav');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            });
        }
    }

    // Determine the correct base path based on current location
    getBasePath() {
        const path = window.location.pathname;
        
        // If we're in a subdirectory (pages/, admin/), go up one level
        if (path.includes('/pages/') || path.includes('/admin/')) {
            return '../';
        }
        
        // If we're at the root level, no prefix needed
        return '';
    }

    // Determine the current page filename
    getCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return currentPage === '' ? 'index.html' : currentPage;
    }

    // Check if a link points to the current page
    isCurrentPage(href) {
        const currentPage = this.getCurrentPage();
        const targetPage = href.split('/').pop();
        
        const normalizedCurrent = currentPage === '' ? 'index.html' : currentPage;
        const normalizedTarget = targetPage === '' ? 'index.html' : targetPage;
        
        return normalizedCurrent === normalizedTarget;
    }
}

// Initialise navigation when the page loads - now works on ALL pages including admin
document.addEventListener('DOMContentLoaded', () => {
    // Clean up any existing navigation elements
    const oldNav = document.querySelector('nav:not(.nav-sidebar-fixed)');
    if (oldNav) {
        oldNav.remove();
    }
    
    // Remove old theme toggle if it exists
    const oldThemeToggle = document.querySelector('#theme-toggle:not(#theme-toggle-nav)');
    if (oldThemeToggle) {
        oldThemeToggle.remove();
    }
    
    // Create the navigation system
    window.navigation = new Navigation();
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }
});