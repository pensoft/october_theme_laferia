$(document).ready(function() {
    // Selectize for country dropdown (single select)
    $('.initiative-form-select').each(function() {
        $(this).selectize({
            maxItems: 1,
            valueField: 'value',
            labelField: 'text',
            searchField: 'text',
            highlight: true,
            allowEmptyOption: false
        });
    });

    // Checkbox dropdown toggle
    $(document).on('click', '.checkbox-dropdown-header', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $dropdown = $(this).closest('.checkbox-dropdown');
        var isOpen = $dropdown.hasClass('open');

        if (isOpen) {
            $dropdown.removeClass('open');
            $dropdown.find('.checkbox-dropdown-body').stop(true).slideUp(250);
        } else {
            $dropdown.addClass('open');
            $dropdown.find('.checkbox-dropdown-body').stop(true).slideDown(250);
        }
    });

    // Prevent header close when clicking inside body
    $(document).on('click', '.checkbox-dropdown-body', function(e) {
        e.stopPropagation();
    });

    // Submit button click - validate first, then send AJAX
    $(document).on('click', '#submitInitiativeBtn', function(e) {
        e.preventDefault();
        var form = document.getElementById('initiativeForm');
        if (!validateInitiativeForm(form)) {
            return;
        }

        // Validation passed - send AJAX request
        $('#initiativeForm').request('initiativeForm::onSubmit', {
            flash: true,
            error: function(jqXHR, textStatus, errorThrown) {
                // Handle server-side errors
                if (jqXHR.responseJSON && jqXHR.responseJSON.X_OCTOBER_ERROR_MESSAGE) {
                    showFlash(jqXHR.responseJSON.X_OCTOBER_ERROR_MESSAGE, 'error');
                }
                if (jqXHR.responseJSON && jqXHR.responseJSON.X_OCTOBER_ERROR_FIELDS) {
                    $('.initiative-form-input').removeClass('input-error');
                    $.each(jqXHR.responseJSON.X_OCTOBER_ERROR_FIELDS, function(field, messages) {
                        var $field = $('[name="' + field + '"]');
                        if ($field.length) {
                            $field.addClass('input-error');
                        }
                    });
                }
            }
        });
    });
});

function validateInitiativeForm(form) {
    var errors = [];

    var name = form.submitter_name.value.trim();
    var email = form.submitter_email.value.trim();
    var title = form.title.value.trim();

    // Clear previous error highlights
    $(form).find('.initiative-form-input, .initiative-form-select').removeClass('input-error');

    if (!name) {
        errors.push('Please enter your name.');
        $(form.submitter_name).addClass('input-error');
    }

    if (!email) {
        errors.push('Please enter your email.');
        $(form.submitter_email).addClass('input-error');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address.');
        $(form.submitter_email).addClass('input-error');
    }

    if (!title) {
        errors.push('Please enter the initiative name.');
        $(form.title).addClass('input-error');
    }

    // Check reCAPTCHA
    var recaptchaResponse = grecaptcha && grecaptcha.getResponse ? grecaptcha.getResponse() : '';
    if (!recaptchaResponse) {
        errors.push('Please complete the reCAPTCHA verification.');
        $('.initiative-recaptcha').addClass('input-error');
    } else {
        $('.initiative-recaptcha').removeClass('input-error');
    }

    if (errors.length > 0) {
        showFlash(errors.join('<br>'), 'error');
        $('html, body').animate({ scrollTop: $('#initiative-form-flash').offset().top - 20 }, 300);
        return false;
    }

    return true;
}

function showFlash(message, type) {
    var $flash = $('#initiative-form-flash');
    $flash.html('<div class="initiative-flash initiative-flash-' + type + '">' + message + '</div>');
    $('html, body').animate({ scrollTop: $flash.offset().top - 20 }, 300);

    setTimeout(function() {
        $flash.find('.initiative-flash').fadeOut(400, function() {
            $(this).remove();
        });
    }, 8000);
}
