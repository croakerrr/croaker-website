/**
 * Navigation System
 * Handles the collapsible sidebar navigation for the Croaker portfolio site.
 * Creates a modern slide-out navigation with backdrop overlay.
 * 
 * @author Liam Hughes
 */
class Navigation {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    // Initialise the navigation system
    init() {
        this.createNavigation();
        this.setupEventListeners();
    }

    // Build the navigation elements and inject into the DOM
    createNavigation() {
        // Create the hamburger menu toggle button
        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.innerHTML = `
            <svg viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;

        // Create backdrop overlay for mobile interaction
        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';

        // Build the main navigation sidebar
        const sidebar = document.createElement('nav');
        sidebar.className = 'nav-sidebar';
        
        const currentPage = this.getCurrentPage();
        const basePath = this.getBasePath();
        
        sidebar.innerHTML = `
            <div class="nav-header">
                <img src="${basePath}images/croaker-logo.png" alt="Croaker" class="nav-logo">
                <span class="nav-title">croaker</span>
            </div>
            <div class="nav-links">
                <a href="${basePath}index.html" ${currentPage === 'index.html' ? 'class="active"' : ''}>home</a>
                <a href="${basePath}pages/projects.html" ${currentPage === 'projects.html' ? 'class="active"' : ''}>projects</a>
                <a href="${basePath}pages/cv.html" ${currentPage === 'cv.html' ? 'class="active"' : ''}>cv</a>
                <a href="${basePath}pages/blog.html" ${currentPage === 'blog.html' ? 'class="active"' : ''}>blog</a>
                <a href="${basePath}admin/index.html" ${currentPage === 'index.html' && window.location.pathname.includes('admin') ? 'class="active"' : ''}>login</a>
            </div>
        `;

        // Inject navigation elements into the page
        document.body.appendChild(toggle);
        document.body.appendChild(backdrop);
        document.body.appendChild(sidebar);

        // Store references for later use
        this.toggle = toggle;
        this.backdrop = backdrop;
        this.sidebar = sidebar;
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

    // Set up all event listeners for navigation interaction
    setupEventListeners() {
        // Toggle button click handler
        this.toggle.addEventListener('click', () => this.toggleNav());
        
        // Backdrop click to close navigation
        this.backdrop.addEventListener('click', () => this.closeNav());
        
        // Escape key support for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeNav();
            }
        });

        // Handle navigation clicks with smooth page transitions
        this.sidebar.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip transition for current page or external links
                if (this.isCurrentPage(href) || href.startsWith('http') || href.startsWith('mailto:')) {
                    return;
                }

                e.preventDefault();
                this.closeNav();
                
                // Allow nav to close before navigating for smooth UX
                setTimeout(() => {
                    if (window.pageTransition) {
                        window.pageTransition.navigateToPage(href);
                    } else {
                        window.location.href = href;
                    }
                }, 300);
            });
        });
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

    // Toggle navigation open/closed state
    toggleNav() {
        if (this.isOpen) {
            this.closeNav();
        } else {
            this.openNav();
        }
    }

    // Open the navigation sidebar
    openNav() {
        this.isOpen = true;
        this.sidebar.classList.add('open');
        this.backdrop.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    // Close the navigation sidebar
    closeNav() {
        this.isOpen = false;
        this.sidebar.classList.remove('open');
        this.backdrop.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scroll
    }
}

// Initialise navigation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Skip navigation on admin pages to prevent conflicts
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage.includes('admin') || window.location.pathname.includes('/admin')) {
        console.log('Navigation: Skipping initialisation on admin page');
        return;
    }
    
    // Clean up any existing navigation elements
    const oldNav = document.querySelector('nav:not(.nav-sidebar)');
    if (oldNav) {
        oldNav.remove();
    }
    
    // Create the navigation system
    window.navigation = new Navigation();
});