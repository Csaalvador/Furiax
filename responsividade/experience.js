// Add this JavaScript code before the closing </body> tag
// or inside an existing script tag

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Elements
    const mobileTrigger = document.getElementById('mobileTrigger');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    
    // If mobile menu elements don't exist, exit early
    if (!mobileTrigger || !mobileNavMenu || !mobileMenuClose || !mobileMenuOverlay) {
        console.log('Mobile menu elements not found');
        return;
    }
    
    // Show swipe hint for first-time users (if localStorage not set)
    if (!localStorage.getItem('furiax_mobile_hint_shown')) {
        // Hide hint after 5 seconds and set localStorage
        setTimeout(() => {
            const swipeIndicator = document.getElementById('swipeIndicator');
            if (swipeIndicator) {
                swipeIndicator.style.opacity = '0';
                setTimeout(() => {
                    swipeIndicator.style.display = 'none';
                }, 500);
            }
            localStorage.setItem('furiax_mobile_hint_shown', 'true');
        }, 5000);
    } else {
        // Hide swipe indicator if user has seen it before
        const swipeIndicator = document.getElementById('swipeIndicator');
        if (swipeIndicator) {
            swipeIndicator.style.display = 'none';
        }
    }
    
    // Toggle menu function
    function toggleMenu() {
        mobileNavMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        hamburgerIcon.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Add animation to main content if present
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            if (mobileNavMenu.classList.contains('active')) {
                mainContent.style.transform = 'translateX(30px)';
                mainContent.style.opacity = '0.9';
            } else {
                mainContent.style.transform = 'translateX(0)';
                mainContent.style.opacity = '1';
            }
        }
    }
    
    // Close menu function
    function closeMenu() {
        if (mobileNavMenu.classList.contains('active')) {
            mobileNavMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            hamburgerIcon.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Reset main content
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.transform = 'translateX(0)';
                mainContent.style.opacity = '1';
            }
        }
    }
    
    // Event listeners
    mobileTrigger.addEventListener('click', toggleMenu);
    mobileMenuClose.addEventListener('click', closeMenu);
    mobileMenuOverlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking on navigation items
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });
    
    // Touch gestures for swipe to open/close menu
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 70; // Minimum distance for swipe to register
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });
    
    function handleSwipeGesture() {
        const swipeDistance = touchEndX - touchStartX;
        
        // Right swipe from edge to open menu
        if (swipeDistance > minSwipeDistance && !mobileNavMenu.classList.contains('active') && touchStartX < 30) {
            toggleMenu();
        }
        
        // Left swipe to close menu
        if (swipeDistance < -minSwipeDistance && mobileNavMenu.classList.contains('active')) {
            closeMenu();
        }
    }
    
    // Close menu on resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileNavMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Set the active menu item based on current page
    function highlightActivePage() {
        const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.mobile-nav-item');
        
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href) {
                // Get the filename from the path
                const currentFile = currentPath.split('/').pop();
                const itemFile = href.split('/').pop();
                
                if (currentFile === itemFile) {
                    item.classList.add('active');
                }
            }
        });
    }
    
    // Update user info from localStorage if available
    function updateUserInfo() {
        try {
            const userData = localStorage.getItem('furiax_current_user');
            if (userData) {
                const user = JSON.parse(userData);
                const usernameElement = document.getElementById('mobileUsername');
                const userRoleElement = document.getElementById('mobileUserRole');
                
                if (usernameElement && user.username) {
                    usernameElement.textContent = user.username;
                }
                
                if (userRoleElement && user.title) {
                    userRoleElement.textContent = user.title;
                }
            }
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    }
    
    // Call initialization functions
    highlightActivePage();
    updateUserInfo();
    
    console.log('Mobile menu initialized');
});