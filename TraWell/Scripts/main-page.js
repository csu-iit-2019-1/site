$(function () {
    //--datespickers--
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

    $('.general-date').each(function () {
        $(this).datepicker({
            format: 'dd-mm-yyyy',
            onRender: function (date) {
                return date.valueOf() < now.valueOf() ? 'disabled' : '';
            }
        }).on('changeDate', function (ev) {
            $(this).data('datepicker').hide();
        }).data('datepicker')
        .setValue(now);
    })

    //--get-cities-list

    $.ajax({
        url: "/home/citieslist",
        type: 'get',
        dataType: "json",
        success: function (data) {
            let $cities = $("#city-picker");
            let options = $("option", $cities).get();
            let cities = JSON.parse(data);
            cities.forEach(city => {
                if (!options.find(option => +option.value === city.id)) {
                    $cities.append(`<option value="${city.id}" data-subtext="${city.country}">${city.name}</option>`);
                }
            });
            $cities.selectpicker('refresh');
        }
    });

    $('.main-content').on('change', '.city', function () {
        let currentCityPicker = $(this);
        if (currentCityPicker.val() === "") return;

        $.ajax({
            url: "/home/cityinfo/" + $(this).val(),
            type: 'get',
            dataType: "json",
            success: function (data) {
                let cityInfo = JSON.parse(data);
                let point = currentCityPicker.closest('.point-fields');
                let pointHr = point.find('hr');
                point.children().not('.city-label, hr').remove();

                let header = $(`<div class="field"><h1>${cityInfo.name}</h1></div>`);
                header.insertBefore(pointHr);

                let description = $(`<div class="field"><p>${cityInfo.description}</p></div>`);
                description.insertBefore(pointHr);

                let purposes = $('<select class="form-control purpose-select"></select>');
                purposes.append($(`<option value="">Цель визита</option>`));
                cityInfo.purposes.forEach(function (purpose) {
                    purposes.append($(`<option value=${purpose.id}>${purpose.name}</option>`));
                });
                purposes.insertBefore(pointHr);

                let dates = $('#general-dates').clone(false);
                dates.attr('id', null);
                dates.addClass('field');
                dates.find('.days-in').attr('id', null).val("").closest('div').find('label').text("Дней в городе");
                dates.find(".general-date").each(function () {
                    $(this).attr('id', null).datepicker({
                        format: 'dd-mm-yyyy',
                        onRender: function (date) {
                            return date.valueOf() < now.valueOf() ? 'disabled' : '';
                        }
                    }).on('changeDate', function (ev) {
                        $(this).data('datepicker').hide();
                    }).data('datepicker')
                    .setValue(now);
                });
                dates.insertBefore(pointHr);

                //загружаем мероприятия
                $.ajax({
                    url: "/home/cityevents/",
                    type: 'post',
                    contentType: "json",
                    dataType: "json",
                    data: JSON.stringify({
                        city: currentCityPicker.closest('.point-fields').find('.city').find('select').val() ? currentCityPicker.closest('.point-fields').find('.city').find('select').val() : "0",
                        startDate: $('#general-departure-day').val(),
                        endDate: $('#general-arrival-day').val(),
                    }),
                    success: function (eventsData) {
                        let events = JSON.parse(eventsData);
                        let table = $('<table class="table"></table>');
                        let head = $('<thead><tr><th>Название</th><th>Дата начала</th><th>Дата завершения</th><th>Описание</th><th>Цена</th><th>Адрес</th><th>Хочу посетить</th></tr></thead>');
                        head.appendTo(table);

                        let body = $('<tbody></tbody>');
                        events.forEach(function (event) {
                            let row = $('<tr></tr>');
                            ['name', 'startDate', 'endDate', 'description', 'cost', 'address'].forEach(function (key) {
                                let td = $(`<td>${event[key]}</td>`);
                                td.appendTo(row);
                            });

                            let checkbox = $('<input class="event-checkbox" type="checkbox">');
                            checkbox.appendTo(row);

                            let eventId = $(`<td class="event-id" hidden="hidden">${event["id"]}</td>`);
                            eventId.appendTo(row);

                            row.appendTo(body);
                        });
                        body.appendTo(table);

                        let eventDiv = $('<div class="field"><h3>Что интересного</h3></div>');
                        table.appendTo(eventDiv);
                        eventDiv.insertBefore(pointHr);
                    }
                });
                //--

                setTimeout(function () {
                    let hotelFields = $('<div class="field"></div>');
                    $('<h2>Параметры отеля</h2>').appendTo(hotelFields);

                    $('<label>Количество звезд:  </label>').appendTo(hotelFields);
                    let stars = $('<div class="rateit hotel-stars" data-rateit-resetable="false"></div>');
                    stars.appendTo(hotelFields);
                    stars.rateit({ step: 1 });

                    let cost = $('<div><label>Стоимость за ночь: <input class="hotel-cost1 form-control" type="number" min=0 value=0><input class="hotel-cost2 form-control" type="number" min=0 value=0></label></div>');
                    cost.appendTo(hotelFields);

                    let breakfastIncluded = $('<div><label>Завтрак: <input class="breakfast-checkbox" type="checkbox"></div>');
                    breakfastIncluded.appendTo(hotelFields);

                    let seaNearby = $('<div><label>Близко к морю: <input class="seaNearby-checkbox" type="checkbox"></div>');
                    seaNearby.appendTo(hotelFields);

                    hotelFields.insertBefore(pointHr);

                    //-----

                    let transportFields = $('<div class="field"></div>');
                    $('<h2>Транспорт</h2>').appendTo(transportFields);

                    let transportType = $('<select class="transport-type-select form-control"></select>');
                    let count = 1;
                    ['Самолет', 'Поезд', 'Автобус', 'Корабль', 'Космический корабль', 'Телепорт', 'Червоточина'].forEach(function (v) {
                        $(`<option value=${count}>${v}</option>`).appendTo(transportType);
                        count++;
                    });
                    let transportTypeLabel = $('<label>Тип: </label>');
                    transportType.appendTo(transportTypeLabel);
                    transportTypeLabel.appendTo(transportFields);

                    let transportCost = $('<div><label>Цена: <input class="transport-cost1 form-control" type="number" min=0 value=0><input class="transport-cost2 form-control" type="number" min=0 value=0></label></div>');
                    transportCost.appendTo(transportFields);

                    let transportClass = $('<select class="transport-class-select form-control"></select>');
                    count = 1;
                    ['Эконом', 'Бизнес', 'Люкс'].forEach(function (v) {
                        $(`<option value=${count}>${v}</option>`).appendTo(transportClass);
                        count++;
                    });
                    let transportClassLabel = $('<label>Класс: </label>');
                    transportClass.appendTo(transportClassLabel);
                    transportClassLabel.appendTo(transportFields);

                    transportFields.insertBefore(pointHr);
                }, 500);
            }
        })
    }).on('click', '#book-button', function () {
        $('#modalWindow').modal('show');
        $(this).replaceWith($('<button type="button" class="btn btn-dark btn-lg" id="buy-button">Выкупить</button>'));
    }).on('click', '#buy-button', function () {
        alert("a")
    });

    $("#add-point-button").on('click', function () {
        let pointFields = $('<div class="point-fields"></div>');
        let label = $('<label class="field city-label">Выбрать город: </label>');
        let citypicker = $('#city-picker').clone();
        citypicker.attr("id", null);
        citypicker.val("0");
        citypicker.appendTo(label);
        label.appendTo(pointFields);
        $('<hr>').appendTo(pointFields);
        pointFields.appendTo('#fields-of-fields');
        citypicker.selectpicker('refresh');
    });

    $("#get-route-button").on('click', function () {
        let preRoute = {};
        preRoute["points"] = [];

        preRoute["adultsAmount"] = +$('#adults-amount').val();
        preRoute["childrenAmount"] = +$('#children-amount').val();

        preRoute["generalDepartureDate"] = $('#general-departure-day').val();
        preRoute["generalReturnDate"] = $('#general-arrival-day').val();
        preRoute["totalDaysOfVoyage"] = +$('#total-days-of-voyage').val();

        preRoute["departureCity"] = $('#departure-city').val();

        $('.point-fields').each(function () {
            let point = {};

            point["city"] = +$(this).find('.city').find('select').val();
            point["purpose"] = +$(this).find('.purpose-select').val();
            point["arrivalDate"] = $(this).find('.first-date').val();
            point["departureDate"] = $(this).find('.second-date').val();
            point["daysIn"] = +$(this).find('.days-in').val();

            let events = [];
            $(this).find('.event-checkbox').each(function () {
                if ($(this).is(":checked")) {
                    events.push(+$(this).closest('tr').find('.event-id').text())
                }
            });
            point["events"] = events;

            //point["hotelStars"] = $(this).find('.hotel-stars').rateit('value');
            //point["minHotelCost"] = +$(this).find('.hotel-cost1').val();
            //point["maxHotelCost"] = +$(this).find('.hotel-cost2').val();
            //point["hotelBreakfast"] = $(this).find('.breakfast-checkbox').is(":checked");
            //point["hotelSeaNearby"] = $(this).find('.seaNearby-checkbox').is(":checked");

            //point["transportType"] = +$(this).find('.transport-type-select').val();
            //point["minTransportCost"] = +$(this).find('.transport-cost1').val();
            //point["maxTransportCost"] = +$(this).find('.transport-cost2').val();
            //point["transportClass"] = +$(this).find('.transport-class-select').val();

            preRoute["points"].push(point);
        });

        //alert(JSON.stringify(preRoute));

        $.ajax({
            url: "/home/routing/",
            type: 'post',
            contentType: "json",
            dataType: "json",
            data: JSON.stringify(preRoute),
            success: function (data) {
                let route = JSON.parse(data);
                let routesDiv = $('#routes');
                $(`<hr><h2>Ваш маршрут</h2>`).appendTo(routesDiv);

                route.forEach(function (point) {
                    let pointDiv = $('<div class="route-point"></div>');
                    let hotelDiv = $('<div class="field"><h3>Отели</h3></div>');
                    let transportDiv = $('<div class="field"><h3>Как доехать</h3></div>');

                    $(`<hr>`).appendTo(pointDiv);
                    $(`<h3>${point["cityName"]}</h3>`).appendTo(pointDiv);

                    //TODO: Таблицы с транспортом и отелями
                    //hotel
                    //загружаем отели
                    //заглушка маршрутов

                    function Route(name) {
                        this.cityId = "5";
                        this.hotels = [{ hotelId: "hotelId", hotelName: "hotelName", address: "address", price: "price", raiting: "raiting", description: "description" }];
                        this.transport = [{ transportId: "transportId", transportType: "transportType", transportName: "transportName", departureTime: "departureTime", arriveTime: "arriveTime", price: "price" }];

                    }
                    route = new Route()
                    route1 = new Route()
                    var points = [route, route1]


                    let table_hotels = $('<table class="table"></table>');
                    let head_hotels = $('<thead><tr><th>Название</th><th>Адрес</th><th>Цена</th><th>Количество звезд</th><th>Описание</th><th>Выбрать это</th></tr></thead>');
                    let body_hotels = $('<tbody></tbody>');
                    head_hotels.appendTo(table_hotels);
                    for (var route in points) {
                        hotels = points[route]['hotels']
                        hotels.forEach(function (hotel) {
                            let row = $('<tr></tr>');
                            ['name', 'city', 'price', 'raiting', 'description'].forEach(function (key) {
                                let td = $(`<td>${hotel[key]}</td>`);
                                td.appendTo(row);
                            });

                            let checkbox = $('<input class="event-checkbox" type="checkbox">');
                            checkbox.appendTo(row);

                            let hotelId = $(`<td class="event-id" hidden="hidden">${hotel["id"]}</td>`);
                            hotelId.appendTo(row);

                            row.appendTo(body_hotels);
                        });
                    }
                    body_hotels.appendTo(table_hotels);

                    table_hotels.appendTo(hotelDiv);

                    hotelDiv.appendTo(pointDiv)
                   


                    let table_transports = $('<table class="table"></table>');
                    let head_transports = $('<thead><tr><th>Тип</th><th>Название</th><th>Дата прибытия</th><th>Дата отбытия</th><th>Цена</th><th>Выбрать это</th></tr></thead>');
                    let body_transports = $('<tbody></tbody>');
                    head_transports.appendTo(table_transports);
                    for (var route in points) {
                        transports = points[route]['transport']
                        transports.forEach(function (transport) {
                            let row = $('<tr></tr>');
                            ['transportType', 'name', 'departureTime', 'arriveTime', 'price'].forEach(function (key) {
                                let td = $(`<td>${transport[key]}</td>`);
                                td.appendTo(row);
                            });

                            let checkbox = $('<input class="event-checkbox" type="checkbox">');
                            checkbox.appendTo(row);

                            let transportId = $(`<td class="event-id" hidden="hidden">${transport["id"]}</td>`);
                            transportId.appendTo(row);

                            row.appendTo(body_transports);
                        });
                    }
                    body_transports.appendTo(table_transports);

                    table_transports.appendTo(transportDiv);
                    transportDiv.appendTo(pointDiv);


                    $.ajax({
                        url: "/home/cities/",
                        type: 'post',
                        contentType: "json",
                        dataType: "json",
                        data: JSON.stringify({
                            id: route['cityId'],
                            startDate: route['departureTime'],
                            endDate: route['arriveTime']
                        }),
                        success: function (eventsData) {
                            let weathers = JSON.parse(eventsData);
                            let table = $('<table class="table"></table>');
                            let head = $('<thead><tr><th>Дата</th><th>Описание</th><th>Скорость ветра</th><th>Температура</th></thead>');
                            head.appendTo(table);

                            let body = $('<tbody></tbody>');
                            weathers.forEach(function (weather) {
                                let row = $('<tr></tr>');
                                ['dt_txt', 'description', 'wind_speed', 'Temp'].forEach(function (key) {
                                    let td = $(`<td>${weather[key]}</td>`);
                                    td.appendTo(row);
                                });
                                row.appendTo(body);
                            });
                            body.appendTo(table);

                            let weatherDiv = $('<div class="field"><h3>Погода</h3></div>');
                            table.appendTo(weatherDiv);
                        }

                    });

                    pointDiv.appendTo(routesDiv);
                    $(`<hr><button type="button" class="btn btn-dark btn-lg" id="book-button">Забронировать</button>`).appendTo(routesDiv);
                }
       )
            }
        });

        $("#modalWindow").off('hidden.bs.modal').on('hidden.bs.modal', function () {

        });
    })
});
