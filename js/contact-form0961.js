const ContactForm = {
    SCROLL_OFFSET: 100,
    SCROLL_DURATION: 200,
    DEBOUNCE_DELAY: 300,
    validationTimeout: null,

    initializeFormValidation() {
        // Process each form field
        $('.form-field').each(function () {
            const $field = $(this);
            const $label = $(`label[for="${this.id}"]`);
            const isRequired = $field.data('val') === true;

            // Handle required fields
            if (isRequired) {
                if (!$label.find('.req').length) {
                    $label.append('<span class="req">*</span>');
                }
            } else {
                // Clear validation attributes for non-required fields
                $field
                    .removeAttr('data-val-required')
                    .removeAttr('data-val')
                    .removeClass('input-validation-error');
            }
        });

        // Reset and reinitialize validation
        const form = $("#contactForm");
        form
            .removeData("validator")
            .removeData("unobtrusiveValidation");
        $.validator.unobtrusive.parse(form);
    },

    handleFormSubmit(e) {
        const $form = $(e.target);
        if (!$form.valid()) {
            e.preventDefault();

            // Mark invalid fields
            $('.field-validation-error').each(function () {
                const fieldId = $(this).attr('data-valmsg-for');
                if (fieldId) {
                    $(`#${fieldId}`).addClass("input-validation-error");
                }
            });

            // Scroll to error summary if it exists
            const $errorSummary = $(".validation-summary-errors");
            if ($errorSummary.length) {
                try {
                    const offset = $errorSummary.offset();
                    if (offset) {
                        $('html, body').animate({
                            scrollTop: offset.top - ContactForm.SCROLL_OFFSET
                        }, ContactForm.SCROLL_DURATION);
                    }
                } catch (error) {
                    console.error('Error scrolling to validation summary:', error);
                }
            }
        }
    },

    handleFieldInput(e) {
        clearTimeout(this.validationTimeout);
        this.validationTimeout = setTimeout(() => {
            $(e.target).valid();
        }, this.DEBOUNCE_DELAY);
    },

    setFocusOnFirstField() {
        // Find the first visible form field and set focus
        const firstField = $('.form-field:visible').first();
        if (firstField.length) {
            // Small delay to ensure the DOM is fully rendered
            setTimeout(() => {
                firstField.focus();
            }, 100);
        }
    },

    initialize() {
        try {
            const form = $("#contactForm");
            this.initializeFormValidation();

            // Bind events
            form
                .on('submit', this.handleFormSubmit)
                .on('input', 'input, textarea, select', (e) => this.handleFieldInput(e));

            // Set focus on first field
            this.setFocusOnFirstField();
        } catch (error) {
            console.error('Error initializing form:', error);
        }
    }
};

// Initialize when document is ready
$(document).ready(() => ContactForm.initialize());