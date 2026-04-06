var currentPage = 1;

$(document).ready(function() {
    var search_i = $('#searchInput').selectize({
        plugins: ["clear_button", "remove_button", "restore_on_backspace"],
        create: true,
        valueField: 'value',
        labelField: 'text',
        searchField: 'text',
        render: {
            option_create: function (data, escape) {
                return '<div class="create">Search for: <strong>' + escape(data.input) + '</strong>&hellip;</div>';
            }
        },
        highlight: true,
        sortField: 'text',
        loadThrottle: 300,
        noResultsText: 'No results found',
        onChange: function (value) {
            currentPage = 1;
            updateInitiativesList();
        }
    });

    var select = $('#sortCountry, #sortRegion, #sortType, #sortLandscape, #sortFunding, #sortApproach').selectize({
        onChange: function(value) {
            currentPage = 1;
            updateInitiativesList();
        }
    });

    $('#applyFilter').on('click', function() {
        currentPage = 1;
        updateInitiativesList();
    });

    $('#clearFilter').on('click', function() {
        var searchinput = search_i[0].selectize;
        searchinput.clear();

        for (var i = 0; i < select.length; i++) {
            select[i].selectize.setValue(0);
        }

        currentPage = 1;
        updateInitiativesList();
    });

    // Pagination click handler
    $(document).on('click', '.pagination-link', function(e) {
        e.preventDefault();
        currentPage = $(this).data('page');
        updateInitiativesList();
        $('html, body').animate({ scrollTop: $('#recordsContainer').offset().top - 20 }, 300);
    });

    var urlParams = window.location.search.substring(1).split('&');
    if (urlParams.length) {
        for (var i = 0; i < urlParams.length; i++) {
            var paramArr = urlParams[i].split('=');
            var paramKey = paramArr[0];
            var paramVal = paramArr[1];
            if (typeof paramVal !== 'undefined' && select[i]) {
                select[i].selectize.setValue(paramVal);
            }
        }
        updateInitiativesList();
    }
});

function updateInitiativesList() {
    var sortCountry = $('#sortCountry').val();
    var sortRegion = $('#sortRegion').val();
    var sortType = $('#sortType').val();
    var sortLandscape = $('#sortLandscape').val();
    var sortFunding = $('#sortFunding').val();
    var sortApproach = $('#sortApproach').val();
    var searchTerm = $('#searchInput').val();

    $.request('initiativesList::onSearchRecords', {
        data: {
            searchTerms: searchTerm,
            sortCountry: sortCountry,
            sortRegion: sortRegion,
            sortType: sortType,
            sortApproach: sortApproach,
            sortLandscape: sortLandscape,
            sortFunding: sortFunding,
            page: currentPage
        },
        update: { 'initiatives_records': '#recordsContainer' }
    });
}

$(document).keydown(function(e) {
    if (e.keyCode === 191) {
        e.preventDefault();
        $('#searchInput')[0].selectize.focus();
    }
    if (e.keyCode === 27) {
        e.preventDefault();
        $('#searchInput')[0].selectize.close();
        $('#searchInput')[0].selectize.blur();
    }
});
