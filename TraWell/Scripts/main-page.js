$(function () {
    $('#hotel-stars').rateit({ step: 1 });

    //--datespickers--
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

    $('.general-date').each(function () {
        $(this).datepicker({
            format: 'yyyy-mm-dd'
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
            let cities = JSON.parse(data);
            $(".city-picker").each(function () {
                let $cities = $(this);
                let options = $("option", $cities).get();         
                cities.forEach(city => {
                    if (!options.find(option => +option.value === city.CityId)) {
                        $cities.append(`<option value="${city.CityId}" data-subtext="${city.Country}">${city.CityName}</option>`);
                    }
                });
                $cities.selectpicker('refresh');
            });       
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
                alert(data);
                let cityInfo = JSON.parse(data.toString('utf8'));
                let point = currentCityPicker.closest('.point-fields');
                let pointHr = point.find('hr');
                point.children().not('.city-label, hr').remove();

                let header = $(`<div class="field"><h1>${cityInfo.CityName}</h1></div>`);
                header.insertBefore(pointHr);

                let description = $(`<div class="field"><p>${cityInfo.Description}</p></div>`);
                description.insertBefore(pointHr);

                $.ajax({
                    url: "/home/weather/",
                    type: 'post',
                    contenttype: "json",
                    datatype: "json",
                    data: JSON.stringify({
                        id: cityInfo.CityId,
                        startDate: $('#general-departure-day').val(),
                        endDate: $('#general-arrival-day').val()
                    }),
                    success: function (weatherData) {
                        let weathers = JSON.parse(weatherData);
                        let table_weather = $('<table class="table"></table>');
                        let head_weather = $('<thead><tr><th>Дата</th><th>Описание</th><th>Скорость ветра</th><th>Температура</th></thead>');
                        head_weather.appendTo(table_weather);

                        let body = $('<tbody></tbody>');
                        weathers.forEach(function (weather) {
                            let row = $('<tr></tr>');
                            ['dt_txt', 'description', 'wind_speed', 'Temp'].forEach(function (key) {
                                let td = $(`<td>${weather[key]}</td>`);
                                td.appendTo(row);
                            });
                            row.appendTo(body);
                        });
                        body.appendTo(table_weather);
                        table_weather.insertAfter(description);
                        $('<h3>Погода</h3>').insertAfter(description);
                    }

                });
                $('<h3>Укажите параметры</h3>').insertBefore(pointHr);
                let purposes = $('<select class="form-control purpose-select"></select>');
                purposes.append($(`<option value="">Цель визита</option>`));
                cityInfo["Goals"].forEach(function (purpose) {
                    purposes.append($(`<option value=${purpose.GoalId}>${purpose.GoalName}</option>`));
                });
                purposes.insertBefore(pointHr);

                let dates = $('#general-dates').clone(false);
                dates.attr('id', null);
                dates.addClass('field');
                dates.find('.days-in').attr('id', null).val("").closest('div').find('label').text("Дней в городе");
                dates.find(".general-date").each(function () {
                    $(this).attr('id', null).datepicker({
                        format: 'yyyy-mm-dd',
                        onRender: function (date) {
                            return date.valueOf() < now.valueOf() ? 'disabled' : '';
                        }
                    }).on('changeDate', function (ev) {
                        $(this).data('datepicker').hide();
                    }).data('datepicker')
                    .setValue(now);
                });
                dates.insertBefore(pointHr);

                let hotelFields = $('<div class="field"></div>');
                $('<h3>Параметры отеля</h3>').appendTo(hotelFields);

                let breakfastIncluded = $('<div><label>Завтрак: <input class="breakfast-checkbox" type="checkbox"></div>');
                breakfastIncluded.appendTo(hotelFields);

                let seaNearby = $('<div><label>Близко к морю: <input class="seaNearby-checkbox" type="checkbox"></div>');
                seaNearby.appendTo(hotelFields);

                hotelFields.insertBefore(pointHr);

                //загружаем мероприятия
                $.ajax({
                    url: "/home/cityevents/",
                    type: 'post',
                    contentType: "json",
                    dataType: "json",
                    data: JSON.stringify({
                        cityId: currentCityPicker.closest('.point-fields').find('.city').find('select').val(),
                        startDate: $('#general-departure-day').val(),
                        endDate: $('#general-arrival-day').val(),
                    }),
                    success: function (eventsData) {
                        //alert(eventsData.toString('utf8'));
                        let events = JSON.parse(eventsData.toString('utf8'));
                        let table = $('<table class="table"></table>');
                        let head = $('<thead><tr><th>Название</th><th>Дата начала</th><th>Дата завершения</th><th>Описание</th><th>Цена</th><th>Места</th><th>Хочу посетить</th></tr></thead>');
                        head.appendTo(table);

                        let body = $('<tbody></tbody>');
                        events.forEach(function (event) {
                            let row = $('<tr></tr>');
                            ['name', 'start_date', 'end_date', 'description', 'price', 'free_space'].forEach(function (key) {
                                let td = $(`<td>${event[key]}</td>`);
                                td.appendTo(row);
                            });

                            let checkbox = $('<input class="event-checkbox" type="checkbox">');
                            checkbox.appendTo(row);

                            let eventId = $(`<td class="event-id" hidden="hidden">${event["eventId"]}</td>`);
                            eventId.appendTo(row);

                            row.appendTo(body);
                        });
                        body.appendTo(table);

                        let eventDiv = $('<div class="field"><h3>Что интересного</h3></div>');
                        table.appendTo(eventDiv);
                        eventDiv.insertBefore(pointHr);
                    }
                });
            }
        })
    }).on('click', '.book-button', function () {
        let saveData = {};
        saveData["PersonId"] = 0;
        saveData["CountOfPersonsAdults"] = +$('#adults-amount').val();
        saveData["CountOfPersonsChildren"] = +$('#children-amount').val();
        saveData["Hotels"] = [];
        saveData["Transports"] = [];
        saveData["Events"] = [];
        
        $(this).closest('.route-div').find('tr.hotel-row').each(function () {
            let ht = { "HotelId": +$(this).attr('data-id') }
            ht["DateDeparture"] = $('#general-departure-day').val();
            ht["DateArrive"] = $('#general-arrival-day').val();
            saveData["Hotels"].push(ht);
        });
        $(this).closest('.route-div').find('tr.transport-row').each(function () {
            let tr = { "TransportId": +$(this).attr('data-id') }
            saveData["Transports"].push(tr);
        });
        $(this).closest('.route-div').find('tr.event-row').each(function () {
            let ev = { "EventId": +$(this).attr('data-id') }
            saveData["Events"].push(ev);
        });

        localStorage.setItem("chosen-route", JSON.stringify(saveData));

        let route = $(this).closest('.route-div').find('.tables-div').html();
        localStorage.setItem("route", route);

        window.location.href = "http://infostorage.pythonanywhere.com/enter-new-data/?returnUrl=http://localhost:24052/tour";
    });

    $("#add-point-button").on('click', function () {
        let pointFields = $('<div class="point-fields"></div>');
        let label = $('<label class="field city-label">Добавить город: </label>');
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
        preRoute["cities_requirements"] = [];

        //preRoute["adults_mount"] = +$('#adults-amount').val();
        //preRoute["children_amount"] = +$('#children-amount').val();
        preRoute["person_amount"] = +$('#children-amount').val() + +$('#adults-amount').val();

        preRoute["start_date"] = $('#general-departure-day').val() + "T00:00:00Z";
        preRoute["end_date"] = $('#general-arrival-day').val() + "T00:00:00Z";
        //preRoute["total_days_of_voyage"] = +$('#total-days-of-voyage').val();

        preRoute["departure_city_id"] = +$('#departure-city').val();

        preRoute["min_hotel_stars"] = +$('#hotel-stars').rateit('value');
        //preRoute["min_hotel_cost"] = +$('#hotel-cost1').val();
        //preRoute["max_hotel_cost"] = +$('#hotel-cost2').val();

        //preRoute["min_transport_cost"] = +$('#transport-cost1').val();
        //preRoute["max_transport_cost"] = +$('#transport-cost2').val();
        preRoute["transport_types_id"] = $('#transport-class-select').val();

        $('.point-fields').each(function () {
            let point = {};

            point["city_id"] = +$(this).find('.city').find('select').val();
            point["purpose"] = +$(this).find('.purpose-select').val();
            point["dates_in"] = [$(this).find('.first-date').val() + "T00:00:00Z", $(this).find('.second-date').val() + "T00:00:00Z"];
            point["total_days_in"] = +$(this).find('.days-in').val();

            let events = [];
            $(this).find('.event-checkbox').each(function () {
                if ($(this).is(":checked")) {
                    events.push(+$(this).closest('tr').find('.event-id').text())
                }
            });
            point["event_ids"] = events;
            
            point["hotel_breakfast"] = $(this).find('.breakfast-checkbox').is(":checked");
            point["hotel_sea_nearby"] = $(this).find('.seaNearby-checkbox').is(":checked");
           
            preRoute["cities_requirements"].push(point);
        });

        alert(JSON.stringify(preRoute));

        $.ajax({
            url: "/home/routing/",
            type: 'post',
            contentType: "json",
            dataType: "json",
            data: JSON.stringify(preRoute),
            success: function (data) {
                let routes = JSON.parse(data);
                let routesDiv = $('#routes');
                routesDiv.children().remove();
                let route_iterator = 1;
                let cities_options = document.getElementById('departure-city').options;

                $(`<hr><h1>Выберите маршрут</h1>`).appendTo(routesDiv);
                routes.forEach(function (route) {
                    let routeDiv = $(`<div class="route-div route-point" data-id="${route_iterator}"></div>`);
                    let tablesDiv = $(`<div class="tables-div"></div>`);
                    $('<hr>').appendTo(routeDiv);
                    $(`<h2>${"Вариант #" + route_iterator}</h2>`).appendTo(routeDiv);
                    tablesDiv.appendTo(routeDiv);

                    let table_hotels = $('<table class="table"></table>');
                    let head_hotels = $('<thead><tr><th>#</th><th>Город</th><th>Название отеля</th><th>Цена</th><th>Количество звезд</th><th>Фото</th></tr></thead>');
                    let body_hotels = $('<tbody></tbody>');
                    head_hotels.appendTo(table_hotels);
                    body_hotels.appendTo(table_hotels);

                    let table_transports = $('<table class="table"></table>');
                    let head_transports = $('<thead><tr><th>#</th><th>Тип</th><th>Название</th><th>Дата прибытия</th><th>Дата отбытия</th><th>Цена</th></tr></thead>');
                    let body_transports = $('<tbody></tbody>');
                    head_transports.appendTo(table_transports);
                    body_transports.appendTo(table_transports);

                    let table_events = $('<table class="table"></table>');
                    let head_events = $('<thead><tr><th>#</th><th>Город</th><th>Название</th><th>Цена</th><th>Описание</th><th>Дата начала</th><th>Дата завершения</th><th>Места</th></tr></thead>');
                    let body_events = $('<tbody></tbody>');
                    head_events.appendTo(table_events);
                    body_events.appendTo(table_events);

                    $('<h4>Отели</h4>').appendTo(tablesDiv);
                    table_hotels.appendTo(tablesDiv);
                    $('<h4>Транспорт</h4>').appendTo(tablesDiv);
                    table_transports.appendTo(tablesDiv);
                    $('<h4>События</h4>').appendTo(tablesDiv);
                    table_events.appendTo(tablesDiv);
                    tablesDiv.appendTo(routeDiv);
                    
                    let iterator = 1;
                    let event_iterator = 1;

                    route["points"].forEach(function (point) {
                        let hotel = point['hotel'];

                        let hotel_row = $(`<tr class="hotel-row" data-id="${hotel["id"]}"></tr>`);
                        $(`<th scope="row">${iterator}</th>`).appendTo(hotel_row);
                        $(`<td>${cities_options[+point["city_id"]].text}</td>`).appendTo(hotel_row);
                        ['name', 'price'].forEach(function (key) {
                            let td = $(`<td>${hotel[key]}</td>`);
                            td.appendTo(hotel_row);
                        });

                        let starsTd = $('<td></td>');
                        let stars = $(`<div class="rateit" data-rateit-value="${hotel["stars"]}" data-rateit-ispreset="true" data-rateit-readonly="true"></div>`);
                        stars.rateit({});
                        stars.appendTo(starsTd);
                        starsTd.appendTo(hotel_row);

                        $(`<td><img src="${hotel["mainPhotoUrl"]}"  width="189" height="150" alt="lorem"></td>`).appendTo(hotel_row);

                        hotel_row.appendTo(body_hotels);

                        //--

                        let transport = point['transport'];

                        let transport_row = $(`<tr class="transport-row" data-id="${transport["transport_id"]}"></tr>`);
                        $(`<th scope="row">${iterator}</th>`).appendTo(transport_row);
                        ['transport_type', 'name', 'departure_time', 'arrive_time', 'price'].forEach(function (key) {
                            let td = $(`<td>${transport[key]}</td>`);
                            td.appendTo(transport_row);
                        });

                        transport_row.appendTo(body_transports);

                        //--

                        let events = point['events'];

                        events.forEach(function(event){
                            let event_row = $(`<tr class="event-row" data-id="${event["eventId"]}"></tr>`);
                            $(`<th scope="row">${event_iterator}</th>`).appendTo(event_row);
                            $(`<td>${cities_options[+point["city_id"]].text}</td>`).appendTo(event_row);
                            ['name', 'price', 'description', 'start_date', 'end_date', 'free_space'].forEach(function (key) {
                                let td = $(`<td>${event[key]}</td>`);
                                td.appendTo(event_row);
                            });

                            event_row.appendTo(body_events);
                            event_iterator++;
                        });

                        iterator++;
                    });
                    $(`<h3>Общая стоимость маршрута: ${+route["total_price"]}</h3>`).appendTo(routeDiv);
                    $(`<hr><button type="button" class="btn btn-dark btn-lg book-button">Забронировать</button>`).appendTo(routeDiv);
                    routeDiv.appendTo(routesDiv);
                    route_iterator++;
                });
            }
        });
    });
})
