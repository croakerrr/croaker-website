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
        // Fade out theme toggle during transition
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.transition = 'opacity 0.25s ease-out';
            themeToggle.style.opacity = '0';
        }
        
        // Trigger slide in animation
        this.overlay.classList.add('active');
        
        // Navigate after animation completes
        setTimeout(() => {
            window.location.href = href;
        }, 250); // Half of the transition duration
    }

    handlePageLoad() {
        // Start with overlay covering screen, then slide out
        this.overlay.style.transform = 'translateX(0)';
        
        // Ensure theme toggle is visible on page load
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.opacity = '1';
            themeToggle.style.transition = 'all 0.2s ease';
        }
        
        // Slide out overlay on page load
        setTimeout(() => {
            this.overlay.classList.add('exit');
            
            // Reset overlay state after exit animation
            setTimeout(() => {
                this.overlay.classList.remove('exit');
                this.overlay.style.transform = '';
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
            themeToggle.style.opacity = '1';
        }
    }
});