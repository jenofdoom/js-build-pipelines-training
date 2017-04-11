$(document).ready(function() {

    var url = "https://www.govt.nz/api/v2/consultation/list";

    $.getJSON(
        url,
        {
            limit: 'all',
            status: 'current',
            sort: 'end'
        }
    )
    .done(function(data) {
        buildTable(data.consultations);
    })
    .fail(function(error) {
        console.log("Request Failed:", error);
    });

    var buildTable = function(consults) {
        var table = $('<table class="consult-table" />');
        var tbody = $('<tbody />');
        var thead = $('<thead />');
        var theadRow = $('<tr />').append('<th>Title</th>', '<th>Start</th>', '<th>End</th>', '<th>Topics</th>');

        $(consults).each(function(index, consult) {
            var row = $('<tr />');
            var title = $('<td />').text(consult.title);
            var startDate = $('<td />').text(dateFormatter(consult.start));
            var endDate = $('<td />').text(dateFormatter(consult.end));
            var topics = $('<td />');
            var descriptionRow = $('<tr />').addClass('hidden');
            var description = $('<td colspan="4" />').html(consult.description);
            var moreInfo = $('<a />').text('Find out more').attr('href', consult.url).addClass('btn btn-default');

            $(consult.topic).each(function(index, topic) {
                var topicSpan = $('<span />').text(topic);

                topicSpan.addClass('label label-default');
                topics.append(topicSpan);
            });

            row.append(title, startDate, endDate, topics);
            row.addClass('clickable');
            description.append(moreInfo);
            descriptionRow.append(description);
            tbody.append(row, descriptionRow);
        });

        thead.append(theadRow);
        table.addClass('table table-hover');
        table.append(thead, tbody);
        $('#app').append(table);

        $('table tr.clickable').on('click', function(event){
            $(this).next().toggleClass('hidden');
        });

        $('#search').on('keyup', function(event){
            var input = $(this).val().toLowerCase();

            $('table tbody tr.clickable').each(function(index, row) {
                var titleCell = $(row).children()[0];
                var titleText = $(titleCell).text().toLowerCase();

                if (titleText.indexOf(input) === -1) {
                    $(row).addClass('hidden');
                    $(row).next().addClass('hidden');
                } else {
                    $(row).removeClass('hidden');
                }
            });
        });
    };

});
