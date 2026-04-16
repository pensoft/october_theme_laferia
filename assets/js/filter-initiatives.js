var VISIBLE_STEP = 3;
var visibleCount = VISIBLE_STEP;
var allExpanded = false;

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
            updateInitiativesList();
        }
    });

    var select = $('#sortCountry, #sortRegion, #sortType, #sortLandscape, #sortFunding, #sortApproach').selectize({
        onChange: function(value) {
            updateInitiativesList();
        }
    });

    $('#applyFilter').on('click', function() {
        updateInitiativesList();
    });

    $('#clearFilter').on('click', function() {
        var searchinput = search_i[0].selectize;
        searchinput.clear();

        for (var i = 0; i < select.length; i++) {
            select[i].selectize.setValue(0);
        }

        updateInitiativesList();
    });

    // See more / See less click handler
    $(document).on('click', '#seeMoreBtn', function(e) {
        e.preventDefault();
        var cards = $('#recordsContainer .initiative-card-wrapper');
        var totalCards = cards.length;

        if (allExpanded) {
            // Collapse back to first 3
            cards.slice(VISIBLE_STEP).slideUp(400, function() {
                visibleCount = VISIBLE_STEP;
            });
            visibleCount = VISIBLE_STEP;
            allExpanded = false;
            $(this).html('See more +');
            $('html, body').animate({ scrollTop: $('#recordsContainer').offset().top - 20 }, 400);
        } else {
            // Show next 3
            var prevVisible = visibleCount;
            visibleCount = Math.min(visibleCount + VISIBLE_STEP, totalCards);
            cards.slice(prevVisible, visibleCount).slideDown(400);

            if (visibleCount >= totalCards) {
                allExpanded = true;
                $(this).html('See less &minus;');
            }
        }
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

    // Reset visible count on new search/filter
    visibleCount = VISIBLE_STEP;
    allExpanded = false;

    $.request('initiativesList::onSearchRecords', {
        data: {
            searchTerms: searchTerm,
            sortCountry: sortCountry,
            sortRegion: sortRegion,
            sortType: sortType,
            sortApproach: sortApproach,
            sortLandscape: sortLandscape,
            sortFunding: sortFunding
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
