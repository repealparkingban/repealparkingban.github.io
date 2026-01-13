/**
 * main.js - Main site functionality 
 * Handles form submissions, page interactions, and UI effects
 */

let pageLoadTime = Date.now();
let challengeCompleted = false;

$(document).ready(function () {
    // External link handler - opens external links in new window, except campaignpartner.net
    const links = document.querySelectorAll('a[href^="http://"], a[href^="https://"]');
    links.forEach(link => {
        if (link.hostname &&
            link.hostname !== location.hostname &&
            !link.hostname.endsWith('campaignpartner.net')) {
            link.target = '_blank';
        }
    });

    // Initialize YouTube Content Fixer
    YouTubeContentFixer.init();

    // Form submission handler
    $("#subscription").submit(function (j) {
        j.preventDefault();

        var currentTime = Date.now();
        var elapsedTime = currentTime - pageLoadTime;
        var obfuscatedTime = btoa(elapsedTime.toString());
        var encodedTimestamp = btoa(currentTime.toString());

        var c = $(this),
            e = c.find('input[name="e"]').val(),
            i = c.find('input[name="z"]').val(),
            b = c.find('input[name="f"]').val(),
            k = c.find('input[name="l"]').val();

        $.post("/EmailSignup.ashx", {
            e: e,
            z: i,
            f: b,
            l: k,
            t: obfuscatedTime,
            ts: encodedTimestamp
        }, function (h) {
            var g = $(h).find("#formResponse");
            $("#result").html(g);
        }).fail(function (xhr, status, error) {
            console.log("Error: " + error);
        });
    });

    // Scroll to top functionality
    $(window).scroll(function () {
        if ($(this).scrollTop() != 0) {
            $('#backToTop').fadeIn(1500);
        } else {
            $('#backToTop').fadeOut(1500);
        }
    });

    $('#backToTop').click(function () {
        $('body,html').animate({ scrollTop: 0 }, 800);
    });
});

// Also run when window fully loads (in case of late-loading content)
window.addEventListener('load', function () {
    setTimeout(() => {
        YouTubeContentFixer.fixYouTubeContent();
    }, 1000);
});


// Challenge completion tracker
function completeChallenge() {
    challengeCompleted = true;
}

setTimeout(completeChallenge, 3000);

// Utility functions
function encodeValue(value) {
    return btoa(value.toString());
}

function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

// Form submission function
function subForm() {
    const subEElement = document.querySelector('#subE');
    const subZElement = document.querySelector('#subZ');
    const subFElement = document.querySelector('#subF');
    const subLElement = document.querySelector('#subL');
    const subPElement = document.querySelector('#subP');
    const messageElement = document.querySelector('#subH');
    const disclaimerCheckbox = document.querySelector('#disclaimerCheckbox');
    let isFormValid = true;

    const params = {
        email: subEElement && subEElement.value.trim() ? subEElement.value.trim() : '',
        zip: subZElement && subZElement.value.trim() ? subZElement.value.trim() : '',
        first: subFElement && subFElement.value.trim() ? subFElement.value.trim() : '',
        last: subLElement && subLElement.value.trim() ? subLElement.value.trim() : '',
        phone: subPElement && subPElement.value.trim() ? subPElement.value.trim() : '',
        message: messageElement && messageElement.value.trim() ? messageElement.value.trim() : ''
    };

    [subEElement, subZElement, subFElement, subLElement].forEach(field => {
        if (field && field.classList.contains('required') && !field.value.trim()) {
            field.classList.add("error");
            isFormValid = false;
        } else if (field) {
            field.classList.remove("error");
        }
    });

    if (subEElement && subEElement.value.trim() && !isValidEmail(subEElement.value)) {
        subEElement.classList.add("error");
        isFormValid = false;
    }

    if (disclaimerCheckbox && !disclaimerCheckbox.checked) {
        isFormValid = false;
        disclaimerCheckbox.classList.add("error");
    } else if (disclaimerCheckbox) {
        disclaimerCheckbox.classList.remove("error");
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - pageLoadTime;
    const obfuscatedTime = btoa(elapsedTime.toString());
    const encodedTimestamp = btoa(currentTime.toString());
    params.t = obfuscatedTime;
    params.ts = encodedTimestamp;

    if (isFormValid) {
        fetch('/EmailSignup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $("#emailSignup").hide();
                    $("#signupThanks").show();
                } else {
                    console.log("Error: " + (data.error || "Unknown error occurred"));
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    } else {
        if (disclaimerCheckbox && !disclaimerCheckbox.checked) {
            alert('Please agree to the disclaimer before submitting.');
        } else {
            alert('Please correct the errors in the form.');
        }
    }
}

/**
* YouTube Content Fixer - Automatically converts YouTube embeds to privacy-enhanced mode
* and adds appropriate referrer policies
*/
const YouTubeContentFixer = {
    /**
     * Main function to fix all YouTube content on the page
     */
    fixYouTubeContent: function () {
        const iframes = document.querySelectorAll('iframe');

        iframes.forEach(iframe => {
            const src = iframe.getAttribute('src');
            if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
                // Create a completely new iframe
                const newIframe = document.createElement('iframe');

                // Copy all attributes EXCEPT src
                for (let attr of iframe.attributes) {
                    if (attr.name !== 'src') {
                        newIframe.setAttribute(attr.name, attr.value);
                    }
                }

                // Set referrer policy FIRST (before src)
                newIframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

                // Then set the corrected src
                const fixedUrl = this.convertToNoCookie(src);
                newIframe.setAttribute('src', fixedUrl);

                // Replace old iframe with new one
                iframe.parentNode.replaceChild(newIframe, iframe);
            }
        });
    },

    /**
     * Fixes YouTube URL in an iframe element
     */
    fixYouTubeUrl: function (iframe) {
        const src = iframe.getAttribute('src');
        if (!src) return false;

        const fixedUrl = this.convertToNoCookie(src);
        if (fixedUrl !== src) {
            iframe.setAttribute('src', fixedUrl);
            return true;
        }
        return false;
    },

    /**
     * Converts a YouTube URL to youtube-nocookie.com
     */
    convertToNoCookie: function (url) {
        let fixedUrl = url;

        // Handle youtu.be shortened URLs
        if (url.includes('youtu.be/')) {
            const videoIdMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)(\?.*)?$/);
            if (videoIdMatch) {
                const videoId = videoIdMatch[1];
                const params = videoIdMatch[2] || '';
                fixedUrl = `https://www.youtube-nocookie.com/embed/${videoId}${params}`;
            }
        }

        // Replace various YouTube URL patterns
        const replacements = [
            { from: 'https://www.youtube.com/embed/', to: 'https://www.youtube-nocookie.com/embed/' },
            { from: 'https://youtube.com/embed/', to: 'https://www.youtube-nocookie.com/embed/' },
            { from: 'http://www.youtube.com/embed/', to: 'https://www.youtube-nocookie.com/embed/' },
            { from: 'http://youtube.com/embed/', to: 'https://www.youtube-nocookie.com/embed/' },
            { from: '//www.youtube.com/embed/', to: '//www.youtube-nocookie.com/embed/' },
            { from: '//youtube.com/embed/', to: '//www.youtube-nocookie.com/embed/' },
            { from: 'youtube.com/v/', to: 'youtube-nocookie.com/embed/' }
        ];

        replacements.forEach(replacement => {
            if (fixedUrl.includes(replacement.from)) {
                fixedUrl = fixedUrl.replace(replacement.from, replacement.to);
            }
        });

        // Handle src="youtube.com/embed/" without protocol
        if (fixedUrl.match(/^(?!https?:\/\/)(?!\/\/)(www\.)?youtube\.com\/embed\//)) {
            fixedUrl = fixedUrl.replace(/^(?:www\.)?youtube\.com\/embed\//, 'https://www.youtube-nocookie.com/embed/');
        }

        return fixedUrl;
    },

    /**
     * Adds referrer policy to iframe if it contains youtube-nocookie and doesn't have one
     */
    addReferrerPolicy: function (iframe) {
        const src = iframe.getAttribute('src');
        const dataSrc = iframe.getAttribute('data-src');

        // Check if iframe has youtube-nocookie.com in src or data-src
        const hasYouTubeNoCookie = (src && src.includes('youtube-nocookie.com')) ||
            (dataSrc && dataSrc.includes('youtube-nocookie.com'));

        if (hasYouTubeNoCookie && !iframe.hasAttribute('referrerpolicy')) {
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            return true;
        }
        return false;
    },

    /**
     * Analyze content (for debugging)
     */
    analyzeContent: function () {
        const analysis = {
            totalIframes: 0,
            needingUrlFix: 0,
            needingReferrerPolicy: 0,
            iframes: []
        };

        const iframes = document.querySelectorAll('iframe');

        iframes.forEach((iframe, index) => {
            const src = iframe.getAttribute('src') || '';
            const dataSrc = iframe.getAttribute('data-src') || '';
            const combinedSrc = src || dataSrc;

            const iframeInfo = {
                index: index,
                src: combinedSrc,
                domain: '',
                videoId: '',
                hasReferrerPolicy: iframe.hasAttribute('referrerpolicy'),
                needsUrlFix: false,
                needsReferrerPolicy: false
            };

            // Determine domain and if fixes are needed
            if (combinedSrc.includes('youtube-nocookie.com')) {
                iframeInfo.domain = 'youtube-nocookie.com';
                iframeInfo.needsReferrerPolicy = !iframeInfo.hasReferrerPolicy;
            } else if (combinedSrc.includes('youtube.com')) {
                iframeInfo.domain = 'youtube.com';
                iframeInfo.needsUrlFix = true;
                iframeInfo.needsReferrerPolicy = true;
            } else if (combinedSrc.includes('youtu.be')) {
                iframeInfo.domain = 'youtu.be';
                iframeInfo.needsUrlFix = true;
                iframeInfo.needsReferrerPolicy = true;
            }

            // Extract video ID
            const videoIdMatch = combinedSrc.match(/(?:embed|v)\/([a-zA-Z0-9_-]+)|youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (videoIdMatch) {
                iframeInfo.videoId = videoIdMatch[1] || videoIdMatch[2];
            }

            analysis.totalIframes++;
            if (iframeInfo.needsUrlFix) analysis.needingUrlFix++;
            if (iframeInfo.needsReferrerPolicy) analysis.needingReferrerPolicy++;
            analysis.iframes.push(iframeInfo);
        });

        return analysis;
    },

    /**
     * Initialize and set up observers for dynamic content
     */
    init: function () {
        // Fix existing content
        this.fixYouTubeContent();

        // Set up MutationObserver to handle dynamically added content
        const observer = new MutationObserver((mutations) => {
            let shouldFix = false;

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'IFRAME' ||
                                node.querySelector?.('iframe')) {
                                shouldFix = true;
                            }
                        }
                    });
                }
            });

            if (shouldFix) {
                // Debounce to avoid multiple rapid fixes
                clearTimeout(this.fixTimeout);
                this.fixTimeout = setTimeout(() => {
                    this.fixYouTubeContent();
                }, 100);
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        //console.log('YouTube Content Fixer initialized');
    }
};

