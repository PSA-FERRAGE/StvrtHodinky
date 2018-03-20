$(document).ready(function () {
    $('#datePicker').daterangepicker({
        timePicker: true,
        timePicker24Hour: true,
        showWeekNumbers: true,
        showISOWeekNumbers: true,
        showCustomRangeLabel: false,
        alwaysShowCalendars: true,
        locale: {
            format: 'DD/MM/YYYY HH:mm',
            weekLabel: "T",
            applyLabel: 'Použiť',
            cancelLabel: 'Vymazať',
            daysOfWeek: ["Ne", "Po", "Ut", "St", "Št", "Pia", "So"],
            monthNames: ["Január", "Február", "Marec", "Apríl", "Máj", "Jún",
                "Júl", "August", "September", "Október", "November", "December"
            ]
        },
        ranges: {
            'Ranná': [moment().startOf('hour').set('hour', 6), moment().startOf('hour').set('hour', 14)],
            'Poobedná': [moment().startOf('hour').set('hour', 14), moment().startOf('hour').set('hour', 22)],
            'Nočná': [moment().startOf('hour').set('hour', 22), moment().add(1, 'd').startOf('hour').set('hour', 6)]
        }
    });

    $('#analyseBtn').click(function () {
        $(this).blur();

        var linka = $('#linkaSelect').val();
        var drp = $('#datePicker').data('daterangepicker');
        var startTime = drp.startDate.format('DD/MM/YYYY HH:mm');
        var endTime = drp.endDate.format('DD/MM/YYYY HH:mm');

        $.ajax({
            type: "POST",
            url: "/dopravnik/" + linka,
            data: {
                start: startTime,
                end: endTime
            },
            success: function (data) {
                if (data.success) {
                    $(".chartsDiv").empty();
                    data.Dopravniky.forEach(function (value, index) {
                        $(".chartsDiv").append("<div class=\"row\">\n" +
                            "                    <div class=\"col-sm-1\">\n" +
                            "                        <input type=\"checkbox\" aria-label=\"...\">" +
                            "                    </div>\n" +
                            "                    <div class=\"col-sm-11 chart-container\" style=\"position: relative; height:40vh; width:100vw\">\n" +
                            "                        <canvas id=\"" + value.nazov + "\"></canvas>\n" +
                            "                    </div>\n" +
                            "                </div>");

                        // Create the chart.js data structure using 'labels' and 'data'
                        var tempData = {
                            labels: value.data.labels,
                            datasets: [{
                                label: "Pocet ks",
                                fill: false,
                                borderColor: '#337ab7',
                                borderWidth: 2,
                                lineTension: 0,
                                data: value.data.values
                            }, {
                                label: "Minimum",
                                fill: false,
                                borderColor: 'red',
                                borderWidth: 1,
                                lineTension: 0,
                                data: value.minVals
                            }, {
                                label: "Ok",
                                fill: false,
                                borderColor: 'green',
                                borderWidth: 1,
                                lineTension: 0,
                                data: value.okVals
                            }]
                        };

                        var ctx = $("#" + value.nazov);
                        var myLineChart = new Chart(ctx, {
                            type: 'line',
                            data: tempData,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                title: {
                                    display: true,
                                    text: value.nazov
                                },
                                legend: {
                                    display: false
                                },
                                tooltips: {
                                    callbacks: {
                                        title: function (tooltipItems, data) {
                                            var dateTime = moment(tooltipItems[0].xLabel);
                                            return dateTime.format('DD/MM/YYYY HH:mm');
                                        }
                                    }
                                },
                                scales: {
                                    xAxes: [{
                                        type: 'time',
                                        time: {
                                            displayFormats: {
                                                'millisecond': 'DD/MM/YYYY HH:mm',
                                                'second': 'DD/MM/YYYY HH:mm',
                                                'minute': 'DD/MM/YYYY HH:mm',
                                                'hour': 'DD/MM/YYYY HH:mm',
                                                'day': 'DD/MM/YYYY HH:mm',
                                                'week': 'DD/MM/YYYY HH:mm',
                                                'month': 'DD/MM/YYYY HH:mm',
                                                'quarter': 'DD/MM/YYYY HH:mm',
                                                'year': 'DD/MM/YYYY HH:mm'
                                            }
                                        },
                                        gridLines: {
                                            drawOnChartArea: false
                                        }
                                    }],
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            max: (value.Maximum + 3)
                                        },
                                        gridLines: {
                                            drawOnChartArea: false
                                        }
                                    }]
                                },
                                elements: {
                                    point: {
                                        radius: 0
                                    }
                                }
                            }
                        });
                    });
                }
            },
            dataType: "json"
        });
    });
});
