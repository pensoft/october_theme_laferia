$(document).ready(function() {
    var $panel = $('#initiativeReportPanel');
    if (!$panel.length) {
        return;
    }

    var isSubmitting = false;
    var successHideTimer = null;

    // Show / hide the report form
    var $toggle = $('#initiativeReportToggle');

    $toggle.on('click', function() {
        var expanded = $(this).attr('aria-expanded') === 'true';
        $(this).attr('aria-expanded', expanded ? 'false' : 'true');
        if (!expanded) {
            $('#initiative-report-success').empty();
        }
        $panel.stop(true).slideToggle(250);
    });

    // Pressing Enter in a text field must not submit the form natively (full page reload)
    $('#initiativeReportForm').on('submit', function(e) {
        e.preventDefault();
    });

    // Submit button click - validate first, then send AJAX
    $('#submitReportBtn').on('click', function(e) {
        e.preventDefault();

        // Ignore repeated clicks while a report is being sent
        if (isSubmitting) {
            return;
        }

        var form = document.getElementById('initiativeReportForm');
        if (!validateReportForm(form)) {
            return;
        }

        var $btn = $(this);
        isSubmitting = true;
        $btn.prop('disabled', true);

        // Close the form, reset it for a possible next report and show the success message below the toggle
        function onReportSent() {
            form.reset();
            $('#initiative-report-flash').empty();
            if (window.grecaptcha && grecaptcha.reset) {
                grecaptcha.reset();
            }

            $toggle.attr('aria-expanded', 'false');
            $panel.stop(true).slideUp(250);

            var $success = $('#initiative-report-success');
            $success.html('<div class="initiative-flash initiative-flash-success">Thank you! Your report has been sent and will be reviewed by our team.</div>');
            $('html, body').animate({ scrollTop: $toggle.offset().top - 20 }, 300);

            clearTimeout(successHideTimer);
            successHideTimer = setTimeout(function() {
                $success.find('.initiative-flash').fadeOut(400, function() {
                    $(this).remove();
                });
            }, 6000);
        }

        $(form).request('initiativesList::onReportIssue', {
            success: function() {
                onReportSent();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (textStatus === 'abort') {
                    return;
                }

                // The server only answers 2xx after the report is saved. If the body could not be
                // read as JSON (e.g. extra output in the response), the report still went through.
                if (jqXHR.status >= 200 && jqXHR.status < 300) {
                    console.warn('Report saved, but the response could not be parsed:', textStatus, errorThrown, jqXHR.responseText);
                    onReportSent();
                    return;
                }

                console.error('Report request failed:', jqXHR.status, textStatus, errorThrown, jqXHR.responseText);

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
                isSubmitting = false;
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

    if (!form.reporter_name.value.trim()) {
        errors.push('Please enter your name.');
        $(form.reporter_name).addClass('input-error');
    }

    if (!email) {
        errors.push('Please enter your email.');
        $(form.reporter_email).addClass('input-error');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
