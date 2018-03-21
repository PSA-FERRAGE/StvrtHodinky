$(document).ready(function () {
    $('#datePicker').daterangepicker({
        autoUpdateInput: false,
        timePicker: false,
        showWeekNumbers: true,
        showISOWeekNumbers: true,
        singleDatePicker: true,
        locale: {
            format: 'DD/MM/YYYY HH:mm',
            weekLabel: "T",
            applyLabel: 'Použiť',
            cancelLabel: 'Vymazať',
            daysOfWeek: ["Ne", "Po", "Ut", "St", "Št", "Pia", "So"],
            monthNames: ["Január", "Február", "Marec", "Apríl", "Máj", "Jún",
                "Júl", "August", "September", "Október", "November", "December"
            ]
        }
    });

    $('#datePicker').on('apply.daterangepicker', function(ev, picker) {
        changeDateTime();
    });

    $('.zmenaBtn').click(function () {
        $('.zmenaBtn').removeClass('active').removeClass('btn-primary');
        $(this).addClass('active').addClass('btn-primary');
        $(this).blur();

        if ($('#datePicker').val() !== '') {
            changeDateTime();
        }
    });

    function changeDateTime() {
        var drp = $('#datePicker').data('daterangepicker');
        var zmena = $('button.zmenaBtn.active').data('zmena');

        if (zmena === null) {
            alert("Prosim zvolte zmenu.");
            return;
        }

        var datum = drp.startDate.format('DD/MM/YYYY');
        var start, end;

        switch (zmena) {
            case "R":
                start = moment(datum + " 06:00", "DD/MM/YYYY HH:mm");
                end = moment(datum + " 14:00", "DD/MM/YYYY HH:mm");
                break;
            case "P":
                start = moment(datum + " 14:00", "DD/MM/YYYY HH:mm");
                end = moment(datum + " 22:00", "DD/MM/YYYY HH:mm");
                break;
            case "N":
                start = moment(datum + " 22:00", "DD/MM/YYYY HH:mm");
                end = moment(datum, "DD/MM/YYYY");
                end.add(1, 'd').add(6, 'h');
                break;
            default:
                return;
        }

        drp.setStartDate(start);
        drp.setEndDate(end);

        $('#datePicker').val(start.format('DD/MM/YYYY HH:mm') + ' - ' + end.format('DD/MM/YYYY HH:mm'));
    }

    $('#analyseBtn').click(function () {
        $(this).blur();

        var linka = $('#linkaSelect').val();
        var drp = $('#datePicker').data('daterangepicker');
        var startTime = drp.startDate.format('DD/MM/YYYY HH:mm');
        var endTime = drp.endDate.format('DD/MM/YYYY HH:mm');

        $("#mainArea").empty();
        $("#preloader").show();

        var stvrthodinkyData, dopravnikyData;

        $.when(
            $.post("/stvrthodinky/" + linka, {start: startTime, end: endTime}, function (data) {
                stvrthodinkyData = data;
            }),
            $.post("/dopravnik/" + linka, {start: startTime, end: endTime}, function (data) {
                dopravnikyData = data;
            })
        ).then(function () {
            getStvrthodinkyChart(stvrthodinkyData);
            getDopravnikyChart(dopravnikyData);
            $("#preloader").hide();
        });
    });


    function getStvrthodinkyChart(data) {
        if (data.success === false) {
            return;
        }

        var production = data.data.Production;
        var strvthod = data.data.Stvrthodinky;
        var strvthodPerc = data.data.StvrthodinkyPerc;

        $("#mainArea").append("<div class=\"row\">\n" +
            "                    <div class=\"col-sm-12 chart-container\" style=\"position: relative; height:40vh;\">\n" +
            "                        <span class=\"infoPanel\"><span class=\"glyphicon glyphicon-wrench\" aria-hidden=\"true\"></span> " + production + "<span class=\"infoPanelSpan\"><span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\"></span> " + strvthod + " - " + strvthodPerc + "%</span></span>\n" +
            "                        <canvas id=\"" + data.nazov + "\"></canvas>\n" +
            "                    </div>\n" +
            "                </div>");
        var tempData = {
            labels: data.data.labels,
            datasets: [{
                label: "Vyrobené ks",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgb(54, 162, 235)",
                borderWidth: 1,
                lineTension: 0,
                data: data.data.values,
                datalabels: {
                    align: 'top',
                    anchor: 'start'
                }
            }, {
                type: 'line',
                label: "Minimum",
                fill: false,
                borderColor: 'red',
                borderWidth: 2,
                lineTension: 0,
                data: data.data.limit,
                datalabels: {
                    display: false
                }
            }]
        };

        var ctx = $("#" + data.nazov);
        var myBarChart = new Chart(ctx, {
            type: 'bar',
            data: tempData,
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: data.nazov
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
                        distribution: 'linear',
                        offset: true,
                        bounds: 'ticks',
                        time: {
                            unit: 'minute',
                            stepSize: 15,
                            displayFormats: {
                                'minute': 'HH:mm'
                            }
                        },
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: (data.data.Maximum + 3)
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
                },
                plugins: {
                    datalabels: {
                        color: 'black',
                        display: function (context) {
                            return context.dataset.data[context.dataIndex] > 0;
                        },
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round
                    }
                }
            }
        });
    }

    function getDopravnikyChart(data) {
        if (data.success === false) {
            return;
        }

        data.Dopravniky.forEach(function (value, index) {
            $("#mainArea").append("<div class=\"row\">\n" +
                "                    <div class=\"col-sm-12 chart-container\" style=\"position: relative; height:40vh;\">\n" +
                "                        <span class=\"infoPanel\"><span class=\"glyphicon glyphicon-chevron-up\" aria-hidden=\"true\"></span> " + value.Maximum + "<span class=\"infoPanelSpan\"><span class=\"glyphicon glyphicon-chevron-down\" aria-hidden=\"true\"></span> "+ value.Minimum + "</span></span>\n" +
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
                    data: value.data.values,
                    datalabels: {
                        display: false
                    }
                }, {
                    label: "Minimum",
                    fill: false,
                    borderColor: 'red',
                    borderWidth: 1,
                    lineTension: 0,
                    data: value.minVals,
                    datalabels: {
                        display: false
                    }
                }, {
                    label: "Ok",
                    fill: false,
                    borderColor: 'green',
                    borderWidth: 1,
                    lineTension: 0,
                    data: value.okVals,
                    datalabels: {
                        display: false
                    }
                }]
            };

            var ctx = $("#" + value.nazov);
            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: tempData,
                options: {
                    animation: false,
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
                                unit: 'minute',
                                stepSize: 15,
                                displayFormats: {
                                    'minute': 'HH:mm'
                                }
                            },
                            gridLines: {
                                drawOnChartArea: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                max: value.MaximumAxis
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

});
