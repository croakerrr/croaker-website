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
            this.animateLogo(logo);
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
            this.animateLogo(logo);
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
                    logo.style.transform = '';
                    logo.style.opacity = '';
                }
            }, 500);
        }, 50);
    }

    animateLogo(logo) {
        const duration = 1200; // 1.2 seconds
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            let opacity, scale, rotation;
            
            if (progress <= 0.1) {
                // 0-10%: Fade in and start growing
                const t = progress / 0.1;
                opacity = 0.3 * t;
                scale = 0.1 + (0.3 * t); // 0.1 to 0.4
                rotation = -1 * t;
            } else if (progress <= 0.25) {
                // 10-25%: Continue growing with wobble
                const t = (progress - 0.1) / 0.15;
                opacity = 0.3 + (0.4 * t); // 0.3 to 0.7
                scale = 0.4 + (0.5 * t); // 0.4 to 0.9
                rotation = -1 + (2 * t); // -1 to 1
            } else if (progress <= 0.4) {
                // 25-40%: Peak size with wobble
                const t = (progress - 0.25) / 0.15;
                opacity = 0.7 + (0.3 * t); // 0.7 to 1
                scale = 0.9 + (0.25 * t); // 0.9 to 1.15
                rotation = 1 + (-1.5 * t); // 1 to -0.5
            } else if (progress <= 0.55) {
                // 40-55%: Slight wobble
                const t = (progress - 0.4) / 0.15;
                opacity = 1;
                scale = 1.15 + (-0.1 * t); // 1.15 to 1.05
                rotation = -0.5 + (1 * t); // -0.5 to 0.5
            } else if (progress <= 0.7) {
                // 55-70%: Final wobble
                const t = (progress - 0.55) / 0.15;
                opacity = 1;
                scale = 1.05 + (0.05 * t); // 1.05 to 1.1
                rotation = 0.5 + (-0.8 * t); // 0.5 to -0.3
            } else if (progress <= 0.85) {
                // 70-85%: Start shrinking
                const t = (progress - 0.7) / 0.15;
                opacity = 1 - (0.2 * t); // 1 to 0.8
                scale = 1.1 + (-0.4 * t); // 1.1 to 0.7
                rotation = -0.3 + (0.5 * t); // -0.3 to 0.2
            } else if (progress <= 0.95) {
                // 85-95%: Continue shrinking and fading
                const t = (progress - 0.85) / 0.1;
                opacity = 0.8 - (0.6 * t); // 0.8 to 0.2
                scale = 0.7 - (0.4 * t); // 0.7 to 0.3
                rotation = 0.2 + (-0.2 * t); // 0.2 to 0
            } else {
                // 95-100%: Final fade out
                const t = (progress - 0.95) / 0.05;
                opacity = 0.2 - (0.2 * t); // 0.2 to 0
                scale = 0.3 - (0.2 * t); // 0.3 to 0.1
                rotation = 0;
            }
            
            logo.style.opacity = opacity;
            logo.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset logo styles when animation completes
                logo.style.opacity = '0';
                logo.style.transform = 'scale(0.1) rotate(0deg)';
            }
        };
        
        requestAnimationFrame(animate);
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