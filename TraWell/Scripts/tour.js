$(function () {
    let route = JSON.parse(localStorage.getItem("route"));

    if (route !== null && route !== "") {
        let routesDiv = $('#routes');
        routesDiv.children().remove();

        route.forEach(function (point) {

            let pointDiv = $('<div class="route-point"></div>');
            $(`<h3>${point["cityName"]}</h3>`).appendTo(pointDiv);

            let table_hotels = $('<table class="table"></table>');
            let head_hotels = $('<thead><tr><th>Название</th><th>Адрес</th><th>Цена</th><th>Количество звезд</th><th>Описание</th><th>Выбрать</th></tr></thead>');
            let body_hotels = $('<tbody></tbody>');
            head_hotels.appendTo(table_hotels);
            hotels = point['hotels'];
            hotels.forEach(function (hotel) {
                let row = $('<tr></tr>');
                ['name', 'city', 'price', 'raiting', 'description'].forEach(function (key) {
                    let td = $(`<td>${hotel[key]}</td>`);
                    td.appendTo(row);
                });

                let checkbox = $(`<input class="hotel-checkbox" type="radio" name="hotel-radio-${point["cityId"]}" id="${"hotel" + hotel["hotelId"]}"  data-id="${hotel["hotelId"]}">`);
                checkbox.appendTo(row);

                row.appendTo(body_hotels);
            });
            body_hotels.appendTo(table_hotels);


            let table_transports = $('<table class="table"></table>');
            let head_transports = $('<thead><tr><th>Тип</th><th>Название</th><th>Дата прибытия</th><th>Дата отбытия</th><th>Цена</th><th>Выбрать</th></tr></thead>');
            let body_transports = $('<tbody></tbody>');
            head_transports.appendTo(table_transports);
            transports = point['transport'];
            transports.forEach(function (transport) {
                let row = $('<tr></tr>');
                ['transportType', 'name', 'departureTime', 'arriveTime', 'price'].forEach(function (key) {
                    let td = $(`<td>${transport[key]}</td>`);
                    td.appendTo(row);
                });

                let checkbox = $(`<input class="transport-checkbox" type="radio" name="transport-radio-${point["cityId"]}" id="${"transport" + transport["transportId"]}" data-id="${transport["transportId"]}">`);
                checkbox.appendTo(row);

                row.appendTo(body_transports);
            });
            body_transports.appendTo(table_transports);

            $('<h4>Отели</h4>').appendTo(pointDiv);
            table_hotels.appendTo(pointDiv);
            $('<h4>Транспорт</h4>').appendTo(pointDiv);
            table_transports.appendTo(pointDiv);
            $(`<hr>`).appendTo(pointDiv);
            pointDiv.appendTo(routesDiv);
        });

        let selected = JSON.parse(localStorage.getItem("points"));
        selected["hotels"].forEach(function (id) {
            $("#hotel" + id).prop('checked', true);
        });
        selected["transport"].forEach(function (id) {
            $("#transport" + id).prop('checked', true);
        });
    }
    
    $("#book-button").on('click', function () {
        let bookingData = {};
        bookingData["userId"] = $('#userId').val();
        bookingData["hotels"] = [];
        bookingData["transport"] = [];
        $('input.hotel-checkbox:checked').each(function () {
            bookingData["hotels"].push(+$(this).attr('data-id'));
        });
        $('input.transport-checkbox:checked').each(function () {
            bookingData["transport"].push(+$(this).attr('data-id'));
        });

        //alert(JSON.stringify(bookingData));

        $.ajax({
            url: "/tour/book/",
            type: 'post',
            contentType: "json",
            dataType: "json",
            data: JSON.stringify(bookingData),
            success: function (data) {
                if (data === "ok") {
                    alert('Бронь прошла успешна.');
                    $("#book-button").replaceWith($('<button type="button" class="btn btn-dark" id="buy-button">Оплатить</button>'));
                    $("#buy-button").on('click', function () {
                        //TODO: переход на кассу
                    });
                }
                else alert('Возникла ошибка. Попробуйте позже.');
            }
        });
    });
});