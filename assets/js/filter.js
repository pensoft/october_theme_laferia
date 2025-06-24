$(document).ready(function() {
    var search_i = $('#searchInput').selectize({
        plugins: ["clear_button", "remove_button", "restore_on_backspace"],
        create: true,
        valueField: 'value',
        labelField: 'text',
        searchField: 'text',
        load: function (query, callback) {
            if (query.length < 1) {
                callback([]);
                return;
            }
            $.request('onSearchRecords', {
                data: {query: query},
                success: function (response) {
                    callback(response);
                }
            });
        },
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
            updateRecordsList();
        }
    });


    var select = $('#sortGroup, #sortCategory, #sortInterest, #sortCountry').selectize({
        onChange: function(value) {
            updateRecordsList();
        }
    });

    $('#applyFilter').on('click', updateRecordsList());

    $('#clearFilter').on('click',function() {
        var selectize = select[0].selectize;
        var selectize1 = select[1].selectize;
        var selectize2 = select[2].selectize;
        var selectize3 = select[3].selectize;

        var searchinput = search_i[0].selectize;
        searchinput.clear();
        selectize.setValue(0);
        selectize1.setValue(0);
        selectize2.setValue(0);
        selectize3.setValue(0);
        updateRecordsList();
    });

    var urlParams = window.location.search.substring(1).split('&');
    if(urlParams.length){
        for(i = 0; i < urlParams.length; i++){
            var paramArr = urlParams[i].split('=');
            var paramKey = paramArr[0];
            var paramVal = paramArr[1];
            if(typeof paramVal !== 'undefined'){
                var selectize = select[i].selectize;
                selectize.setValue(paramVal);
                updateRecordsList();
            }
        }

    }



});



function updateRecordsList() {
    var sortCategory = $('#sortCategory').val();
    var sortGroup = $('#sortGroup').val();
    var sortInterest = $('#sortInterest').val();
    var sortCountry = $('#sortCountry').val();

    var searchTerm = $('#searchInput').val();

    $.request('onSearchRecords', {
        data: {
            searchTerms: searchTerm,
            sortGroup: sortGroup,
            sortCategory: sortCategory,
            sortInterest: sortInterest,
            sortCountry: sortCountry,
        },
        update: { 'stakeholder_records': '#recordsContainer' }
    });
}



$(document).keydown(function(e) {

    // 191 = /
    if (e.keyCode === 191) {
        e.preventDefault();
        $('#searchInput')[0].selectize.focus();
    }

    // 27 = esc
    if (e.keyCode === 27) {
        e.preventDefault();
        $('#searchInput')[0].selectize.close();
        $('#searchInput')[0].selectize.blur();
    }
});
