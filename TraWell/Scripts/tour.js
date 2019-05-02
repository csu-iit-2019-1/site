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
        localStorage.setItem("chosen-route", bookingData);
        //alert(bookingData);

        $.ajax({
            url: "/tour/book/",
            type: 'post',
            contentType: "json",
            dataType: "json",
            data: bookingData,
            success: function (data) {
                if (data !== "") {
                    alert('Бронь прошла успешна.');
                    $("#book-button").replaceWith($('<button type="button" class="btn btn-dark btn-lg" id="buy-button">Оплатить</button>'));
                    $("#buy-button").on('click', function () {
                        //TODO: переход на кассу
                        location.href = `http://iitcashbox.eastus.cloudapp.azure.com/pay?orderNumber=${data}&returnUrl=http://localhost:24052/tour?siteId=${+$('#userId').val()}&orderSum=${"500"}`;
                    });
                }
                else alert('Возникла ошибка. Попробуйте позже.');
            }
        });
    });

    
});