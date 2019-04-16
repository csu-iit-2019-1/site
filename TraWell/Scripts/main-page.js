$(function () {
    //--datespickers--
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
    var currentDate = now.getDay + "-" + (now.getMonth + 1) + "-" + now.getFullYear;

    var checkin = $('#dpd1').datepicker({
        format: 'dd-mm-yyyy',
        onRender: function (date) {
            return date.valueOf() < now.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function (ev) {
        if (ev.date.valueOf() > checkout.date.valueOf()) {
            var newDate = new Date(ev.date)
            newDate.setDate(newDate.getDate());
            checkout.setValue(newDate);
        }
        checkin.hide();
        $('#dpd2')[0].focus();
    }).data('datepicker');
    var checkout = $('#dpd2').datepicker({
        format: 'dd-mm-yyyy',
        onRender: function (date) {
            return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function () {
        checkout.hide();
    }).data('datepicker');

    checkin.setValue(now);
    checkout.setValue(now);
    //----

    $('.city').selectpicker();

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

    $('.main-content').on('change', '#city-picker', function () {
        if ($(this).val() === "") return;

        $.ajax({
            url: "/home/cityinfo/"+$(this).val(),
            type: 'get',
            dataType: "json",
            success: function (data) {
                
            }
        });
    });
   
})