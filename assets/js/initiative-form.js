$(document).ready(function() {
    // Selectize for country dropdown (single-style multi-select)
    $('.initiative-form-select').each(function() {
        $(this).selectize({
            plugins: ['remove_button'],
            maxItems: null,
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
});
