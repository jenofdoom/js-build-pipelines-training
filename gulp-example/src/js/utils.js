var dateFormatter = function(dateString){
    var date = new Date(dateString);
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0'  +  month : month;
    date = day + '/' + month + '/' + year;
    return date;
};