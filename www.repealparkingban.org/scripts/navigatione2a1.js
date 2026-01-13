/**
 * navigation.js - Handles responsive navigation menu functionality
 * Detects menu wrapping and toggles between desktop and mobile views
 */
console.log('navigation.js is loading...');
// Self-executing function to avoid polluting global namespace
(function ($) {
    'use strict';

    // Configuration
    const CONFIG = {
        menuSelector: '.menu',
        menuItemSelector: '.menu > li',
        mobileButtonSelector: '.menu-open-button',
        submenuSelector: '.menu > li > ul',
        overlaySelector: '.overlay',
        closeOverlaySelector: '.overlay-close',
        navigationSelector: '#navigation',
        cssBreakpoint: 500,
        resizeThrottleDelay: 50,
        detectionThreshold: 2
    };

    // State tracking
    let state = {
        mobileMenuActive: false,
        overlayOpen: false, // ADD: Track overlay state separately
        triggerWidth: 0,
        lastToggleTime: 0,
        toggleCooldown: 50,
        originalHeaderStyles: {},
        originalNavStyles: {},
        isToggling: false // ADD: Prevent concurrent toggles
    };

    /**
     * Store original styles before modifying
     */
    function storeOriginalStyles() {
        const header = document.querySelector('#header');
        const headWrap = document.querySelector('#headWrap');
        const tinyLogo = document.querySelector('.tinyLogo');
        const desktopMenu = document.querySelector('.menu');

        if (header) {
            state.originalHeaderStyles = {
                position: header.style.position || '',
                top: header.style.top || '',
                left: header.style.left || '',
                right: header.style.right || '',
                zIndex: header.style.zIndex || '',
                background: header.style.background || ''
            };
        }

        if (headWrap) {
            state.originalHeaderStyles.headWrap = {
                position: headWrap.style.position || '',
                top: headWrap.style.top || '',
                left: headWrap.style.left || '',
                right: headWrap.style.right || '',
                zIndex: headWrap.style.zIndex || '',
                background: headWrap.style.background || ''
            };
        }

        if (tinyLogo) {
            state.originalNavStyles.tinyLogo = {
                display: tinyLogo.style.display || ''
            };
        }

        if (desktopMenu) {
            state.originalNavStyles.desktopMenu = {
                display: desktopMenu.style.display || ''
            };
        }
    }

    /**
     * Reset elements to original styles
     */
    function resetToOriginalStyles() {
        const header = document.querySelector('#header');
        const headWrap = document.querySelector('#headWrap');
        const tinyLogo = document.querySelector('.tinyLogo');
        const desktopMenu = document.querySelector('.menu');

        if (header && state.originalHeaderStyles) {
            header.style.position = state.originalHeaderStyles.position;
            header.style.top = state.originalHeaderStyles.top;
            header.style.left = state.originalHeaderStyles.left;
            header.style.right = state.originalHeaderStyles.right;
            header.style.zIndex = state.originalHeaderStyles.zIndex;
            header.style.background = state.originalHeaderStyles.background;
        }

        if (headWrap && state.originalHeaderStyles.headWrap) {
            headWrap.style.position = state.originalHeaderStyles.headWrap.position;
            headWrap.style.top = state.originalHeaderStyles.headWrap.top;
            headWrap.style.left = state.originalHeaderStyles.headWrap.left;
            headWrap.style.right = state.originalHeaderStyles.headWrap.right;
            headWrap.style.zIndex = state.originalHeaderStyles.headWrap.zIndex;
            headWrap.style.background = state.originalHeaderStyles.headWrap.background;
        }

        if (tinyLogo && state.originalNavStyles.tinyLogo) {
            tinyLogo.style.display = state.originalNavStyles.tinyLogo.display;
        }

        if (desktopMenu && state.originalNavStyles.desktopMenu) {
            desktopMenu.style.display = state.originalNavStyles.desktopMenu.display;
        }
    }

    /**
     * Dynamically set overlay padding based on header structure
     */
    function setOverlayPadding() {
        const overlay = document.querySelector('.overlay');

        // Try to get template from multiple sources
        let template = overlay?.dataset?.template;
        if (!template) {
            const navigation = document.querySelector('#navigation');
            template = navigation?.dataset?.template;
        }

        if (template === 'campaign-1') {
            // Campaign-1: No padding needed since everything is hidden
            if (overlay) {
                overlay.style.paddingTop = '0px';
                console.log('Campaign-1: No padding needed');
            }
            return;
        }

        // Campaign-2 and others: Calculate padding normally
        let totalHeight = 0;
        const header = document.querySelector('#header');
        const navigation = document.querySelector('#navigation');
        const headWrap = document.querySelector('#headWrap');

        if (headWrap) {
            totalHeight += headWrap.offsetHeight;
            console.log('HeadWrap height:', headWrap.offsetHeight);
        } else if (header) {
            totalHeight += header.offsetHeight;
            console.log('Header height:', header.offsetHeight);
        }

        if (navigation && navigation.offsetHeight > 0) {
            totalHeight += navigation.offsetHeight;
            console.log('Navigation height:', navigation.offsetHeight);
        }

        if (totalHeight > 0 && overlay) {
            console.log('Total height calculated:', totalHeight);
            overlay.style.paddingTop = totalHeight + 'px';
        } else {
            console.log('Using fallback padding');
            if (overlay) {
                overlay.style.paddingTop = '120px';
            }
        }
    }

    function toggleCPMenu() {
        // FIX: Prevent toggle if already toggling
        if (state.isToggling) {
            return;
        }
        state.isToggling = true;

        const toggle = document.querySelector('.menu-toggle');
        const overlay = document.querySelector('.overlay');

        // Try to get template from multiple sources
        let template = overlay?.dataset?.template;
        if (!template) {
            const navigation = document.querySelector('#navigation');
            template = navigation?.dataset?.template;
        }

        console.log('Template detected:', template);

        // Toggle the X animation
        if (toggle) {
            toggle.classList.toggle('active');
        }

        if (overlay.classList.contains('menu-visible')) {
            // Hide menu
            state.overlayOpen = false; // FIX: Track state
            overlay.classList.remove('menu-visible');

            // FIX: Store navigation state before reset
            const navigation = document.querySelector('#navigation');
            const navHeight = navigation ? navigation.offsetHeight : null;

            // Reset template-specific elements - but maintain mobile state
            if (template === 'campaign-1') {
                resetCampaign1ElementsToMobileState();
            }

            // FIX: Ensure navigation doesn't jump
            if (navigation && navHeight && state.mobileMenuActive) {
                navigation.style.minHeight = navHeight + 'px';
                setTimeout(() => {
                    navigation.style.minHeight = '';
                }, 300);
            }

            // Re-enable body scroll
            document.body.style.overflow = '';

            setTimeout(() => {
                overlay.style.display = 'none';
                state.isToggling = false; // FIX: Reset toggle flag
            }, 250);
        } else {
            // Show menu
            state.overlayOpen = true; // FIX: Track state
            overlay.style.display = 'block';

            // Handle template-specific behavior
            if (template === 'campaign-1') {
                setupCampaign1Menu();
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                setOverlayPadding();
                overlay.classList.add('menu-visible');
                state.isToggling = false; // FIX: Reset toggle flag
            }, 10);
        }
    }

    /**
     * Reset Campaign-1 elements to mobile state (not desktop state)
     */
    function resetCampaign1ElementsToMobileState() {
        const header = document.querySelector('#header');
        const navigation = document.querySelector('#navigation');
        const tinyLogo = document.querySelector('.tinyLogo');
        const desktopMenu = document.querySelector('.menu');

        console.log('Resetting Campaign-1 elements to mobile state');

        // If we're still in mobile mode, keep mobile layout
        if (state.mobileMenuActive) {
            // Show header but keep mobile navigation styling
            if (header) {
                header.style.display = '';
                console.log('Header restored');
            }

            // FIX: Carefully reset only overlay-specific styles while maintaining mobile state
            if (navigation) {
                // Store the current height to prevent jump
                const currentHeight = navigation.offsetHeight;

                // Only reset overlay-specific positioning
                if (navigation.style.position === 'fixed') {
                    navigation.style.position = '';
                    navigation.style.top = '';
                    navigation.style.right = '';
                    navigation.style.left = '';
                    navigation.style.width = '';
                    navigation.style.background = '';
                    navigation.style.padding = '';
                    navigation.style.boxShadow = '';
                    navigation.style.setProperty('border-bottom', '', 'important');
                }

                // Maintain mobile state
                navigation.style.zIndex = '';
                navigation.style.height = '';
                navigation.style.textAlign = 'right';

                // Temporarily maintain height to prevent jump
                navigation.style.minHeight = currentHeight + 'px';
                setTimeout(() => {
                    navigation.style.minHeight = '';
                }, 300);

                console.log('Navigation maintained in mobile state');
            }

            // Ensure tiny logo is shown appropriately
            if (tinyLogo && tinyLogo.style.display === 'none') {
                tinyLogo.style.display = '';
                console.log('Tiny logo restored');
            }

            // Ensure menu stays hidden in mobile mode
            if (desktopMenu) {
                desktopMenu.style.cssText = 'display: none !important; visibility: hidden !important;';
            }

        } else {
            // If we're in desktop mode, do full reset
            resetCampaign1Elements();
        }
    }

    /**
     * Reset Campaign-1 specific elements (full reset for desktop)
     */
    function resetCampaign1Elements() {
        const header = document.querySelector('#header');
        const navigation = document.querySelector('#navigation');
        const tinyLogo = document.querySelector('.tinyLogo');
        const desktopMenu = document.querySelector('.menu');

        console.log('Resetting Campaign-1 elements to desktop');

        // Show header again
        if (header) {
            header.style.display = '';
            console.log('Header restored');
        }

        // Reset navigation to original state
        if (navigation) {
            navigation.style.position = '';
            navigation.style.top = '';
            navigation.style.right = '';
            navigation.style.left = '';
            navigation.style.width = '';
            navigation.style.zIndex = '';
            navigation.style.background = '';
            navigation.style.height = '';
            navigation.style.padding = '';
            navigation.style.boxShadow = '';
            navigation.style.textAlign = '';
            navigation.style.borderBottom = '';
            console.log('Navigation reset to desktop');
        }

        // Show tiny logo and desktop menu
        if (tinyLogo) {
            tinyLogo.style.display = '';
            console.log('Tiny logo restored');
        }
        if (desktopMenu) {
            desktopMenu.style.display = '';
            console.log('Desktop menu restored');
        }
    }

    /**
     * Reset hamburger button to original state
     */
    function resetMenuButton() {
        const toggle = document.querySelector('.menu-toggle');
        if (toggle) {
            toggle.classList.remove('active');
        }
    }

    /**
     * Complete menu reset function
     */
    function resetMenu() {
        const overlay = document.querySelector('.overlay');
        const toggle = document.querySelector('.menu-toggle');

        // Try to get template from multiple sources
        let template = overlay?.dataset?.template;
        if (!template) {
            const navigation = document.querySelector('#navigation');
            template = navigation?.dataset?.template;
        }

        console.log('Resetting menu, template:', template);

        // Hide overlay
        if (overlay) {
            overlay.classList.remove('menu-visible');
            overlay.style.display = 'none';
        }

        // Reset hamburger
        if (toggle) {
            toggle.classList.remove('active');
        }

        // Reset template-specific elements based on current state
        if (template === 'campaign-1') {
            if (state.mobileMenuActive) {
                resetCampaign1ElementsToMobileState();
            } else {
                resetCampaign1Elements();
            }
        }

        // Re-enable body scroll
        document.body.style.overflow = '';

        state.overlayOpen = false; // FIX: Reset overlay state
    }

    /**
     * Initialize menu functionality
     */
    function initMenu() {
        console.log('initMenu() is running...');
        console.log('Looking for:', CONFIG.mobileButtonSelector + " .btn-open");
        console.log('Found buttons:', $(CONFIG.mobileButtonSelector + " .btn-open").length);

        // Store original styles on init
        storeOriginalStyles();

        // Set up hover effects for desktop menu
        $(CONFIG.menuItemSelector).bind("mouseover", showSubmenu);
        $(CONFIG.menuItemSelector).bind("mouseout", hideSubmenu);
        $(CONFIG.submenuSelector).bind("mouseover", keepSubmenuVisible);

        // Mobile menu button click handler
        $(CONFIG.mobileButtonSelector + " .btn-open").on("click", function (e) {
            console.log('Click handler triggered!');
            e.preventDefault();
            e.stopPropagation(); // FIX: Prevent event bubbling
            toggleCPMenu();
        });

        console.log('Click handler attached!');

        // Close overlay handler
        $(CONFIG.closeOverlaySelector).on('click', function () {
            resetMenu();
        });

        // Resize handler with throttling
        let resizeTimer;
        $(window).on('resize', function () {
            const win = $(this);

            // Hide overlay on larger screens and reset everything
            if (win.width() >= CONFIG.cssBreakpoint) {
                resetMenu();
            }

            // Update overlay padding if menu is visible
            const overlay = document.querySelector('.overlay');
            if (overlay && overlay.classList.contains('menu-visible')) {
                setOverlayPadding();
            }

            // Throttled menu wrapping check - ONLY if overlay is not open
            if (!state.overlayOpen) { // FIX: Don't check wrapping when overlay is open
                clearTimeout(resizeTimer);
                checkMenuWrapping();
                resizeTimer = setTimeout(checkMenuWrapping, CONFIG.resizeThrottleDelay);
            }
        });

        // Escape key support
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape') {
                resetMenu();
            }
        });

        // Click outside overlay
        $(CONFIG.overlaySelector).on('click', function (e) {
            if (e.target === this) {
                resetMenu();
            }
        });

        // FIX: Wait for images to load before initial check
        $(window).on('load', function () {
            checkMenuWrapping();
        });

        // Initial check with delay to ensure proper rendering
        setTimeout(checkMenuWrapping, 100);

        // Set up mutation observer for dynamic menu changes
        setupMutationObserver();
    }

    /**
     * Check if menu items are wrapping and toggle mobile/desktop view accordingly
     */
    function checkMenuWrapping() {
        // FIX: Don't check if overlay is open or we're toggling
        if (state.overlayOpen || state.isToggling) {
            return;
        }

        try {
            const windowWidth = $(window).width();
            const now = Date.now();

            // Cooldown check
            if (now - state.lastToggleTime < state.toggleCooldown &&
                ((state.mobileMenuActive && windowWidth <= state.triggerWidth) ||
                    (!state.mobileMenuActive && windowWidth >= state.triggerWidth))) {
                return;
            }

            // Mobile mode recovery
            if (state.mobileMenuActive && windowWidth > state.triggerWidth + 50) { // FIX: Add buffer
                switchToDesktopMode();
                state.lastToggleTime = now;
                return;
            }

            // Hard CSS breakpoint
            if (windowWidth <= CONFIG.cssBreakpoint) {
                if (!state.mobileMenuActive) {
                    switchToMobileMode(windowWidth);
                    state.lastToggleTime = now;
                }
                return;
            }

            // Force layout recalculation to see clamp() values
            const menu = document.querySelector(CONFIG.menuSelector);
            if (menu) {
                menu.offsetHeight; // Force browser to recalculate layout
            }

            // Use requestAnimationFrame to ensure layout is complete
            requestAnimationFrame(() => {
                if (!state.overlayOpen) { // FIX: Double-check overlay isn't open
                    actuallyCheckWrapping(windowWidth, now);
                }
            });

        } catch (e) {
            console.error("Error in checkMenuWrapping:", e);
        }
    }

    function actuallyCheckWrapping(windowWidth, now) {
        // FIX: Final check to ensure overlay isn't open
        if (state.overlayOpen) {
            return;
        }

        const menuItems = $(CONFIG.menuItemSelector + ":visible");
        if (menuItems.length < 2) return;

        // Temporarily allow wrapping for detection
        const menu = document.querySelector(CONFIG.menuSelector);
        const originalFlexWrap = menu.style.flexWrap;
        const originalWhiteSpace = menu.style.whiteSpace;

        // Force wrapping temporarily
        menu.style.flexWrap = 'wrap';
        menu.style.whiteSpace = 'normal';

        // Force layout recalculation
        menu.offsetHeight;

        const firstItem = menuItems.first();
        const firstRect = firstItem[0].getBoundingClientRect();
        const firstTop = firstRect.top;

        let wrapping = false;

        for (let i = 1; i < menuItems.length; i++) {
            const currentRect = $(menuItems[i])[0].getBoundingClientRect();
            const currentTop = currentRect.top;
            const diff = Math.abs(currentTop - firstTop);

            if (diff > CONFIG.detectionThreshold) {
                wrapping = true;
                break;
            }
        }

        // Restore original styles
        menu.style.flexWrap = originalFlexWrap;
        menu.style.whiteSpace = originalWhiteSpace;
        menu.offsetHeight; // Force layout again

        if (wrapping && !state.mobileMenuActive) {
            switchToMobileMode(windowWidth);
            state.lastToggleTime = now;
        } else if (!wrapping && state.mobileMenuActive && windowWidth > state.triggerWidth) {
            switchToDesktopMode();
            state.lastToggleTime = now;
        }
    }

    /**
     * Switch to mobile menu view
     */
    /**
 * Switch to mobile menu view - FIXED VERSION
 */
    function switchToMobileMode(triggerWidth) {
        console.log('switchToMobileMode called');

        const navigation = document.querySelector('#navigation');

        if (navigation) {
            // Store current nav height to prevent jump
            const currentHeight = navigation.offsetHeight;

            const menu = navigation.querySelector('.menu');
            const mobileButton = navigation.querySelector('.menu-open-button');

            if (menu) {
                // FIX: Only modify specific properties instead of replacing all styles
                menu.style.display = 'none';
                menu.style.visibility = 'hidden';
                menu.classList.add('force-hidden');

                // Important flag for CSS specificity if needed
                menu.style.setProperty('display', 'none', 'important');
            }

            if (mobileButton) {
                // FIX: Only modify specific properties
                mobileButton.style.display = 'inline';
                mobileButton.style.visibility = 'visible';
                mobileButton.classList.add('force-visible');

                // Important flag for CSS specificity if needed
                mobileButton.style.setProperty('display', 'inline', 'important');
            }

            // Maintain navigation height to prevent jump
            navigation.style.minHeight = currentHeight + 'px';
            navigation.style.textAlign = 'right';

            // Remove min-height after transition
            setTimeout(() => {
                if (navigation && navigation.style.minHeight) {
                    navigation.style.minHeight = '';
                }
            }, 300);

            // Debug
            console.log('Menu display after force:', menu ? window.getComputedStyle(menu).display : 'no menu');
            console.log('Mobile button display after force:', mobileButton ? window.getComputedStyle(mobileButton).display : 'no button');
        }

        state.mobileMenuActive = true;
        state.triggerWidth = triggerWidth;
        resetMenuButton();
    }

    /**
     * Setup Campaign-1 specific menu behavior
     */
    function setupCampaign1Menu() {
        const header = document.querySelector('#header');
        const navigation = document.querySelector('#navigation');
        const tinyLogo = document.querySelector('.tinyLogo');
        const desktopMenu = document.querySelector('.menu');

        console.log('Setting up Campaign-1 menu - hiding everything except hamburger');

        // Hide header completely
        if (header) {
            header.style.display = 'none';
            console.log('Header hidden');
        }

        // Position just the hamburger button at top right
        if (navigation) {
            // ADD THIS FIRST - clear any minHeight from switchToMobileMode()
            navigation.style.removeProperty('min-height');
            navigation.style.minHeight = '0';

            navigation.style.setProperty('position', 'fixed', 'important');
            navigation.style.setProperty('top', '20px', 'important');
            navigation.style.setProperty('right', '20px', 'important');
            navigation.style.setProperty('left', 'auto', 'important');
            navigation.style.setProperty('width', 'auto', 'important');
            navigation.style.setProperty('min-width', '0', 'important');  // ADD
            navigation.style.setProperty('max-width', 'none', 'important');  // ADD
            navigation.style.setProperty('min-height', '0', 'important');  // ADD
            navigation.style.setProperty('z-index', '10001', 'important');
            navigation.style.setProperty('background', 'transparent', 'important');
            navigation.style.setProperty('background-color', 'transparent', 'important');
            navigation.style.setProperty('height', 'auto', 'important');
            navigation.style.setProperty('padding', '0', 'important');
            navigation.style.setProperty('margin', '0', 'important');  // ADD
            navigation.style.setProperty('box-shadow', 'none', 'important');
            navigation.style.setProperty('border', 'none', 'important');
            navigation.style.setProperty('border-bottom', 'none', 'important');
            navigation.style.setProperty('text-align', 'right', 'important');
            console.log('Navigation positioned as floating hamburger');
        }

        // Hide tiny logo and desktop menu
        if (tinyLogo) {
            tinyLogo.style.display = 'none';
            console.log('Tiny logo hidden');
        }
        if (desktopMenu) {
            desktopMenu.style.display = 'none';
            console.log('Desktop menu hidden');
        }
    }

    /**
     * Switch to desktop menu view
     */
    /**
 * Switch to desktop menu view - FIXED VERSION
 */
    function switchToDesktopMode() {
        console.log('switchToDesktopMode called');

        const navigation = document.querySelector('#navigation');

        if (navigation) {
            const menu = navigation.querySelector('.menu');
            const mobileButton = navigation.querySelector('.menu-open-button');

            if (menu) {
                // FIX: Only modify specific properties instead of replacing all styles
                menu.style.display = 'flex';
                menu.style.visibility = 'visible';
                menu.classList.remove('force-hidden');

                // Remove any important flags
                menu.style.removeProperty('display');
                menu.style.display = 'flex'; // Re-set without !important
            }

            if (mobileButton) {
                // FIX: Only modify specific properties
                mobileButton.style.display = 'none';
                mobileButton.style.visibility = 'hidden';
                mobileButton.classList.remove('force-visible');

                // Remove any important flags
                mobileButton.style.removeProperty('display');
                mobileButton.style.display = 'none'; // Re-set without !important
            }

            // Reset text alignment
            navigation.style.textAlign = '';

            // Ensure navigation is visible
            if (navigation.style.display === 'none') {
                navigation.style.display = '';
            }
        }

        state.mobileMenuActive = false;
        resetMenu();
    }

    /**
     * Show submenu on hover
     */
    function showSubmenu() {
        $(this).find("ul").css("visibility", "visible");
        $(this).addClass("menuHover");
    }

    /**
     * Hide submenu on mouseout
     */
    function hideSubmenu() {
        $(this).find("ul").css("visibility", "hidden");
        $(this).removeClass("menuHover");
    }

    /**
     * Keep submenu visible when hovering over it
     */
    function keepSubmenuVisible() {
        $(this).closest("li").addClass("menuHover");
        $(this).parent().addClass("menuHover");
    }

    /**
     * Set up mutation observer to detect dynamic menu changes
     */
    function setupMutationObserver() {
        const menuElement = document.querySelector(CONFIG.menuSelector);
        if (menuElement && window.MutationObserver) {
            const observer = new MutationObserver(function () {
                // FIX: Only check if overlay is not open
                if (!state.overlayOpen) {
                    checkMenuWrapping();
                }
            });

            observer.observe(menuElement, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
    }

    /**
 * Safety recovery system to prevent navigation from disappearing
 * Add this RIGHT AFTER the initMenu() function
 */
    function initNavigationRecovery() {
        // Check navigation state every 500ms
        setInterval(() => {
            const navigation = document.querySelector('#navigation');
            if (!navigation) return;

            const menu = navigation.querySelector('.menu');
            const mobileButton = navigation.querySelector('.menu-open-button');
            const windowWidth = window.innerWidth;

            // Check if navigation itself is hidden when it shouldn't be
            if (getComputedStyle(navigation).display === 'none' && !state.overlayOpen) {
                console.warn('Navigation disappeared - recovering...');
                navigation.style.display = '';
                navigation.style.visibility = 'visible';
            }

            // Ensure correct menu/button visibility based on state
            if (state.mobileMenuActive) {
                // Should be in mobile mode
                if (menu && getComputedStyle(menu).display !== 'none') {
                    console.warn('Menu visible in mobile mode - fixing...');
                    menu.style.display = 'none';
                }
                if (mobileButton && getComputedStyle(mobileButton).display === 'none') {
                    console.warn('Mobile button hidden in mobile mode - fixing...');
                    mobileButton.style.display = 'inline';
                }
            } else if (windowWidth > CONFIG.cssBreakpoint) {
                // Should be in desktop mode
                if (menu && getComputedStyle(menu).display === 'none') {
                    console.warn('Menu hidden in desktop mode - fixing...');
                    menu.style.display = 'flex';
                    menu.style.visibility = 'visible';
                }
                if (mobileButton && getComputedStyle(mobileButton).display !== 'none') {
                    console.warn('Mobile button visible in desktop mode - fixing...');
                    mobileButton.style.display = 'none';
                }
            }

            // Clear any stuck minHeight
            if (navigation.style.minHeight && !state.isToggling) {
                const minHeightValue = parseInt(navigation.style.minHeight);
                if (minHeightValue > 0) {
                    // Check if it's been there for too long (likely stuck)
                    if (!navigation.dataset.minHeightTime) {
                        navigation.dataset.minHeightTime = Date.now().toString();
                    } else {
                        const elapsed = Date.now() - parseInt(navigation.dataset.minHeightTime);
                        if (elapsed > 500) { // More than 500ms, probably stuck
                            console.warn('Clearing stuck minHeight');
                            navigation.style.minHeight = '';
                            delete navigation.dataset.minHeightTime;
                        }
                    }
                }
            } else if (navigation.dataset.minHeightTime) {
                delete navigation.dataset.minHeightTime;
            }
        }, 500);

        console.log('Navigation recovery system initialized');
    }

    // Initialize when document is ready
    $(document).ready(function () {
        initMenu();
        initNavigationRecovery();  // Add the recovery system
    });

})(jQuery);