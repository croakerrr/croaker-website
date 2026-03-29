// Page transition system
class PageTransition {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        // Create transition overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition';
        
        // Add croaker logo to transition
        const logo = document.createElement('img');
        logo.src = '/images/croaker-logo.png';
        logo.alt = 'Croaker Logo';
        logo.className = 'croaker-logo-transition';
        this.overlay.appendChild(logo);
        
        document.body.appendChild(this.overlay);

        // Handle navigation clicks
        this.setupNavigation();
        
        // Handle page load
        this.handlePageLoad();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a[href]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if it's the current page or external link
                if (this.isCurrentPage(href) || href.startsWith('http') || href.startsWith('mailto:')) {
                    return;
                }

                e.preventDefault();
                this.navigateToPage(href);
            });
        });
    }

    isCurrentPage(href) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const targetPage = href.split('/').pop();
        
        // Handle index.html as root
        const normalizedCurrent = currentPage === '' ? 'index.html' : currentPage;
        const normalizedTarget = targetPage === '' ? 'index.html' : targetPage;
        
        return normalizedCurrent === normalizedTarget;
    }

    navigateToPage(href) {
        // Immediately hide all potential flash-causing elements
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.visibility = 'hidden';
        }
        
        // Hide filter dots specifically (these are likely causing the circular flash)
        const filterDots = document.querySelectorAll('.filter-dot');
        filterDots.forEach(dot => {
            dot.style.display = 'none';
        });
        
        // Hide other potentially problematic circular elements
        const problematicElements = document.querySelectorAll('.search-container, .filter-container, .nav-logo, .nav-logo-large, .close-modal-btn');
        problematicElements.forEach(el => el.style.visibility = 'hidden');
        
        // Trigger slide in animation
        this.overlay.classList.add('active');
        
        // Start logo animation immediately
        const logo = this.overlay.querySelector('.croaker-logo-transition');
        if (logo) {
            // Reset any previous animation
            logo.style.animation = 'none';
            // Force reflow then apply animation
            logo.offsetHeight;
            logo.style.animation = 'croakerSmoothWobble 1.2s ease-out';
        }
        
        // Navigate after screen wipe completes
        setTimeout(() => {
            window.location.href = href;
        }, 500);
    }

    handlePageLoad() {
        // Start with overlay covering screen, then slide out
        this.overlay.style.transform = 'translateX(0)';
        
        // Restore theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.visibility = 'visible';
        }
        
        // Restore filter dots specifically
        const filterDots = document.querySelectorAll('.filter-dot');
        filterDots.forEach(dot => {
            dot.style.display = '';
        });
        
        // Restore other elements
        const problematicElements = document.querySelectorAll('.search-container, .filter-container, .nav-logo, .nav-logo-large, .close-modal-btn');
        problematicElements.forEach(el => el.style.visibility = 'visible');
        
        // Start logo animation on page load too
        const logo = this.overlay.querySelector('.croaker-logo-transition');
        if (logo) {
            // Reset any previous animation
            logo.style.animation = 'none';
            // Force reflow then apply animation
            logo.offsetHeight;
            logo.style.animation = 'croakerSmoothWobble 1.2s ease-out';
        }
        
        // Slide out overlay on page load
        setTimeout(() => {
            this.overlay.classList.add('exit');
            
            // Reset overlay state after exit animation
            setTimeout(() => {
                this.overlay.classList.remove('active');
                this.overlay.classList.remove('exit');
                this.overlay.style.transform = '';
                // Reset logo animation after it completes
                if (logo) {
                    logo.style.animation = '';
                }
            }, 500);
        }, 50);
    }
}

// Initialize page transitions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PageTransition();
});

// Handle browser back/forward buttons
window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
        // Page was loaded from cache (back/forward button)
        const overlay = document.querySelector('.page-transition');
        const themeToggle = document.getElementById('theme-toggle');
        
        if (overlay) {
            overlay.classList.remove('active');
            overlay.classList.add('exit');
            setTimeout(() => {
                overlay.classList.remove('exit');
            }, 500);
        }
        
        // Ensure theme toggle is visible
        if (themeToggle) {
            themeToggle.style.visibility = 'visible';
        }
    }
});