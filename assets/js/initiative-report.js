$(document).ready(function() {
    var $panel = $('#initiativeReportPanel');
    if (!$panel.length) {
        return;
    }

    // Show / hide the report form
    $('#initiativeReportToggle').on('click', function() {
        var expanded = $(this).attr('aria-expanded') === 'true';
        $(this).attr('aria-expanded', expanded ? 'false' : 'true');
        $panel.stop(true).slideToggle(250);
    });

    // Submit button click - validate first, then send AJAX
    $('#submitReportBtn').on('click', function(e) {
        e.preventDefault();

        var form = document.getElementById('initiativeReportForm');
        if (!validateReportForm(form)) {
            return;
        }

        var $btn = $(this).prop('disabled', true);

        $(form).request('initiativesList::onReportIssue', {
            success: function() {
                form.reset();
                $(form).hide();
                showReportFlash('Thank you! Your report has been sent and will be reviewed by our team.', 'success');
            },
            error: function(jqXHR) {
                var message = 'Something went wrong. Please try again.';
                if (jqXHR.responseJSON && jqXHR.responseJSON.X_OCTOBER_ERROR_MESSAGE) {
                    message = jqXHR.responseJSON.X_OCTOBER_ERROR_MESSAGE;
                }
                if (jqXHR.responseJSON && jqXHR.responseJSON.X_OCTOBER_ERROR_FIELDS) {
                    $.each(jqXHR.responseJSON.X_OCTOBER_ERROR_FIELDS, function(field) {
                        $(form).find('[name="' + field + '"]').addClass('input-error');
                    });
                }
                showReportFlash(message, 'error');
                if (window.grecaptcha && grecaptcha.reset) {
                    grecaptcha.reset();
                }
            },
            complete: function() {
                $btn.prop('disabled', false);
            }
        });
    });
});

function validateReportForm(form) {
    var errors = [];
    var email = form.reporter_email.value.trim();

    $(form).find('.initiative-form-input, .initiative-form-textarea').removeClass('input-error');

    if (!form.issue_type.value) {
        errors.push('Please choose the type of issue.');
        $(form.issue_type).addClass('input-error');
    }

    if (!form.message.value.trim()) {
        errors.push('Please describe the issue.');
        $(form.message).addClass('input-error');
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address.');
        $(form.reporter_email).addClass('input-error');
    }

    var recaptchaResponse = window.grecaptcha && grecaptcha.getResponse ? grecaptcha.getResponse() : '';
    if (!recaptchaResponse) {
        errors.push('Please complete the reCAPTCHA verification.');
        $(form).find('.initiative-recaptcha').addClass('input-error');
    } else {
        $(form).find('.initiative-recaptcha').removeClass('input-error');
    }

    if (errors.length > 0) {
        showReportFlash(errors.join('<br>'), 'error');
        return false;
    }

    return true;
}

function showReportFlash(message, type) {
    var $flash = $('#initiative-report-flash');
    $flash.html('<div class="initiative-flash initiative-flash-' + type + '">' + message + '</div>');
    $('html, body').animate({ scrollTop: $flash.offset().top - 20 }, 300);
}
