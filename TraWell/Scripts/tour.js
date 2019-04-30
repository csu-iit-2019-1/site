$(function () {
    let route = localStorage.getItem("route");

    if (route !== null && route !== "") {
        $('#routes').html(route);
    }
    
    $("#book-button").on('click', function () {

        let bookingData = localStorage.getItem("chosen-route");

        if (bookingData === null && route === "") {
            return;
        }

        bookingData["PersonId"] = +$('#userId').val();
        //alert(bookingData);

        $.ajax({
            url: "/tour/book/",
            type: 'post',
            contentType: "json",
            dataType: "json",
            data: bookingData,
            success: function (data) {
                if (data === "ok") {
                    alert('Бронь прошла успешна.');
                    $("#book-button").replaceWith($('<button type="button" class="btn btn-dark" id="buy-button">Оплатить</button>'));
                }
                else alert('Возникла ошибка. Попробуйте позже.');
            }
        });
    });

    $('#main-content').on('click', 'buy-button', function () {
        //TODO: переход на кассу
    });
});