// ============================================
// Click to Zoom - Lightweight Image Lightbox
// ADD TO: Live site pages (master page or layout)
// ============================================

(function () {
    'use strict';

    var lastFocusedElement = null;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initClickToZoom);
    } else {
        initClickToZoom();
    }

    function initClickToZoom() {
        // Delegate click handling for .image-click-zoom images
        document.body.addEventListener('click', function (e) {
            var img = e.target;
            if (img.tagName === 'IMG' && img.classList.contains('image-click-zoom')) {
                e.preventDefault();
                e.stopPropagation();
                openZoom(img);
            }
        });

        // Also handle Enter/Space on focused images
        document.body.addEventListener('keydown', function (e) {
            var img = e.target;
            if (img.tagName === 'IMG' && img.classList.contains('image-click-zoom')) {
                if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    openZoom(img);
                }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeZoom();
            }
        });

        // Add tabindex to zoomable images that don't have one
        document.querySelectorAll('img.image-click-zoom').forEach(function (img) {
            if (!img.hasAttribute('tabindex')) {
                img.setAttribute('tabindex', '0');
            }
            if (!img.hasAttribute('role')) {
                img.setAttribute('role', 'button');
            }
            if (!img.hasAttribute('aria-label')) {
                img.setAttribute('aria-label', 'Click to enlarge image');
            }
        });
    }

    function openZoom(img) {
        // Don't open if already open
        if (document.querySelector('.zoom-overlay')) return;

        // Store last focused element to restore later
        lastFocusedElement = document.activeElement;

        // Create overlay (starts hidden)
        var overlay = document.createElement('div');
        overlay.className = 'zoom-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Enlarged image viewer');

        // Create close button
        var closeBtn = document.createElement('button');
        closeBtn.className = 'zoom-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', 'Close image viewer');

        // Create image
        var zoomImg = document.createElement('img');
        zoomImg.setAttribute('alt', img.alt || 'Enlarged image');
        zoomImg.style.opacity = '0';
        zoomImg.style.transition = 'opacity 0.3s ease';

        // Handle image load success
        zoomImg.onload = function () {
            // Image is ready, fade it in
            requestAnimationFrame(function () {
                zoomImg.style.opacity = '1';
            });
        };

        // Handle image load error
        zoomImg.onerror = function () {
            zoomImg.style.display = 'none';
            var errorMsg = document.createElement('div');
            errorMsg.className = 'zoom-error';
            errorMsg.setAttribute('role', 'alert');
            errorMsg.innerHTML = 'Unable to load image';
            errorMsg.style.cssText = 'color:#fff;font-size:18px;text-align:center;padding:40px;';
            overlay.appendChild(errorMsg);
        };

        // Create hint
        var hint = document.createElement('span');
        hint.className = 'zoom-hint';
        //hint.textContent = 'Press Escape or click anywhere to close';

        // Assemble overlay
        overlay.appendChild(closeBtn);
        overlay.appendChild(zoomImg);
        overlay.appendChild(hint);

        // Add to page
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Show overlay immediately (dark background)
        requestAnimationFrame(function () {
            overlay.classList.add('active');
        });

        // Start loading the image (may be instant if cached)
        zoomImg.src = img.src;

        // Focus the close button for accessibility
        closeBtn.focus();

        // Close handlers
        overlay.addEventListener('click', function (e) {
            closeZoom();
        });

        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            closeZoom();
        });

        // Trap focus within overlay
        overlay.addEventListener('keydown', function (e) {
            if (e.key === 'Tab' || e.keyCode === 9) {
                // Keep focus on close button (only focusable element)
                e.preventDefault();
                closeBtn.focus();
            }
        });
    }

    function closeZoom() {
        var overlay = document.querySelector('.zoom-overlay');
        if (!overlay) return;

        overlay.classList.remove('active');
        document.body.style.overflow = '';

        // Remove after animation
        setTimeout(function () {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }

            // Restore focus to the image that triggered the zoom
            if (lastFocusedElement && lastFocusedElement.focus) {
                lastFocusedElement.focus();
            }
            lastFocusedElement = null;
        }, 300);
    }
})();