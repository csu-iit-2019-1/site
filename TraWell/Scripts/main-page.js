$(function () {
    let chosenCitiesIds = [];
    $('#hotel-stars').rateit({ step: 1 });

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
            $(".city-picker").each(function () {
                let $cities = $(this);
                let options = $("option", $cities).get();
                let cities = JSON.parse(data);
                cities.forEach(city => {
                    if (!options.find(option => +option.value === city.id)) {
                        $cities.append(`<option value="${city.id}" data-subtext="${city.country}">${city.name}</option>`);
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

                    let transportClass = $('<select class="transport-class-select form-control"></select>');
                    count = 1;
                    ['Эконом', 'Бизнес', 'Люкс'].forEach(function (v) {
                        $(`<option value=${count}>${v}</option>`).appendTo(transportClass);
                        count++;
                    });
                    let transportClassLabel = $('<br><label>Класс: </label>');
                    transportClass.appendTo(transportClassLabel);
                    transportClassLabel.appendTo(transportFields);

                    transportFields.insertBefore(pointHr);
                }, 200);
            }
        })
    }).on('click', '#book-button', function () {
        let saveData = {};
        saveData["hotels"] = [];
        saveData["transport"] = []
        $('input.hotel-checkbox:checked').each(function () {
            saveData["hotels"].push(+$(this).attr('data-id'));
        });
        $('input.transport-checkbox:checked').each(function () {
            saveData["transport"].push(+$(this).attr('data-id'));
        });

        localStorage.setItem("points", JSON.stringify(saveData));

        window.location.href = "http://infostorage.pythonanywhere.com/enter-new-data/?returnUrl=http://localhost:24052/tour";
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
        //TODO: поправить соотвествие между общими и частными параметрами отелей и транспорта
        let preRoute = {};
        preRoute["points"] = [];

        preRoute["adultsAmount"] = +$('#adults-amount').val();
        preRoute["childrenAmount"] = +$('#children-amount').val();

        preRoute["generalDepartureDate"] = $('#general-departure-day').val();
        preRoute["generalReturnDate"] = $('#general-arrival-day').val();
        preRoute["totalDaysOfVoyage"] = +$('#total-days-of-voyage').val();

        preRoute["departureCity"] = +$('#departure-city').val();

        $('.point-fields').each(function () {
            let point = {};

            point["city"] = +$(this).find('.city').find('select').val();
            point["purpose"] = +$(this).find('.purpose-select').val();
            point["datesIn"] = [$(this).find('.first-date').val(), $(this).find('.second-date').val()];
            point["daysIn"] = +$(this).find('.days-in').val();

            let events = [];
            $(this).find('.event-checkbox').each(function () {
                if ($(this).is(":checked")) {
                    events.push(+$(this).closest('tr').find('.event-id').text())
                }
            });
            point["events"] = events;

            point["hotelStars"] = $(this).find('.hotel-stars').rateit('value');
            point["minHotelCost"] = +$(this).find('.hotel-cost1').val();
            point["maxHotelCost"] = +$(this).find('.hotel-cost2').val();
            point["hotelBreakfast"] = $(this).find('.breakfast-checkbox').is(":checked");
            point["hotelSeaNearby"] = $(this).find('.seaNearby-checkbox').is(":checked");

            point["transportType"] = +$(this).find('.transport-type-select').val();
            point["minTransportCost"] = +$(this).find('.transport-cost1').val();
            point["maxTransportCost"] = +$(this).find('.transport-cost2').val();
            point["transportClass"] = +$(this).find('.transport-class-select').val();

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
                localStorage.setItem("route", data);
                let route = JSON.parse(data);
                let routesDiv = $('#routes');
                routesDiv.children().remove();
                $(`<hr><h2>Ваш маршрут</h2>`).appendTo(routesDiv);

                route.forEach(function (point) {
                    chosenCitiesIds.push(point.cityId);

                    let pointDiv = $('<div class="route-point"></div>');
                    $(`<hr>`).appendTo(pointDiv);
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

                        let checkbox = $(`<input class="hotel-checkbox" type="radio" name="hotel-radio-${point["cityId"]}" data-id="${hotel["hotelId"]}">`);
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

                        let checkbox = $(`<input class="transport-checkbox" type="radio" name="transport-radio-${point["cityId"]}" data-id="${transport["transportId"]}">`);
                        checkbox.appendTo(row);

                        row.appendTo(body_transports);
                    });
                    body_transports.appendTo(table_transports);

                    $('<h4>Отели</h4>').appendTo(pointDiv);
                    table_hotels.appendTo(pointDiv);
                    $('<h4>Транспорт</h4>').appendTo(pointDiv);
                    table_transports.appendTo(pointDiv);
                    pointDiv.appendTo(routesDiv);
                });   
                $(`<hr><button type="button" class="btn btn-dark btn-lg" id="book-button">Забронировать</button>`).appendTo(routesDiv);
            }
        });
    });
})