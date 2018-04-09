$(document).ready(function () {
    var chartsArr = [];

    Object.defineProperty(window, 'charts', {
        configurable: true,

        get: function () {
            return chartsArr;
        },

        set: function (val) {
            if (val.length === 0) {
                $('#exportBtn').prop('disabled', true);
                chartsArr = [];
            } else {
                $('#exportBtn').prop('disabled', false);
                chartsArr.push(val);
            }

        }
    });

    $('#datePicker').daterangepicker({
        autoUpdateInput: false,
        timePicker: false,
        showWeekNumbers: true,
        showISOWeekNumbers: true,
        singleDatePicker: true,
        opens: 'center',
        locale: {
            format: 'DD/MM/YYYY',
            weekLabel: "T",
            applyLabel: 'Použiť',
            cancelLabel: 'Vymazať',
            daysOfWeek: ["Ne", "Po", "Ut", "St", "Št", "Pia", "So"],
            monthNames: ["Január", "Február", "Marec", "Apríl", "Máj", "Jún",
                "Júl", "August", "September", "Október", "November", "December"
            ]
        }
    });

    $('#datePicker').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY'));

        if ($('.zmenaBtn').hasClass('active') === true) {
            $('#analyseBtn').attr('disabled', false);
            $('#alert').hide();
        } else {
            showAlert('Prosim zvoľte zmenu [R, P, N].', 'alert-danger');
        }
    });

    $('#datePicker').on('onkeypress', function () {
       if ($(this).val() === "") {
           $('#analyseBtn').attr('disabled', true);
       }
    });

    $('.zmenaBtn').click(function () {
        $(this).toggleClass('active');
        $(this).toggleClass('btn-primary');
        $(this).blur();

        if ($('.zmenaBtn').hasClass('active') === true &&
            $('#datePicker').val().length > 0) {
            $('#analyseBtn').attr('disabled', false);
        } else {
            $('#analyseBtn').attr('disabled', true);
        }
    });

    $('#analyseBtn').click(function () {
        let mainArea = $('#mainArea');

        $(this).blur();

        window.charts = [];

        if ($('.zmenaBtn').hasClass('active') === false) {
            showAlert('Prosim zvoľte zmenu [R, P, N].', 'alert-danger');
            return;
        } else if ($('#datePicker').val() === '') {
            showAlert('Prosim zvoľte dátum', 'alert-danger');
            return;
        }

        let preloader   = $("#preloader");
        let linka       = $('#linkaSelect').val();
        let linkaText   = $("#linkaSelect option:selected").text();
        let stvorzmenka = $("#zmenaTgl").prop('checked');
        let datum       = $('#datePicker').val();
        let nextDay     = moment(datum, 'DD/MM/YYYY').add(1, 'd').format('DD/MM/YYYY');

        preloader.show();

        mainArea.empty();
        mainArea.hide();

        let numOfZmena = $('.zmenaBtn.active').length;

        $('.zmenaBtn.active').each(function (index) {
            let zmena = $(this).data('zmena');
            let zmenaString = "";
            let stvrthodinkyData = {}, dopravnikyData = {};
            let startTime = "", endTime = "";

            switch (zmena) {
                case "R":
                    startTime = datum + " 06:00";
                    endTime   = datum + (stvorzmenka ? " 18:00" : " 14:00");
                    zmenaString = "Ranná zmena";
                    break;
                case "P":
                    startTime = datum + " 14:00";
                    endTime   = (stvorzmenka ? nextDay + " 02:00" : datum + " 22:00");
                    zmenaString = "Poobedná zmena";
                    break;
                case "N":
                    startTime = datum + (stvorzmenka ? " 18:00" : " 22:00");
                    endTime   = nextDay + " 06:00";
                    zmenaString = "Nočná zmena";
                    break;
            }

            $.when(
                $.post("/stvrthodinky/" + linka, {start: startTime, end: endTime}, function (data) {
                    stvrthodinkyData = data;
                }),
                $.post("/dopravnik/" + linka, {start: startTime, end: endTime}, function (data) {
                    dopravnikyData = data;
                })
            ).then(function () {
                if (index === (numOfZmena - 1)) {
                    mainArea.show();
                    preloader.hide();
                }

                if (stvrthodinkyData.dataEmpty === true) {
                    return;
                }

                let panel = createPanelHtml();

                let chartDiv = createStvrtHodChartHtml(panel);
                appendStvrthodinkyChart(stvrthodinkyData, chartDiv);

                if (dopravnikyData.success === true) {
                    dopravnikyData.Dopravniky.forEach(function (dopravnik) {
                        let chartDiv = createConvChartHtml(panel);

                        chartDiv.find('.conv-maximum').text(dopravnik.Maximum);
                        chartDiv.find('.conv-minimum').text(dopravnik.Minimum);
                        appendDopravnikyChart(dopravnik, chartDiv);
                    });
                }

                let headerData1 = [
                    stvrthodinkyData.data.Production,
                    stvrthodinkyData.data.Stvrthodinky,
                    stvrthodinkyData.data.StvrthodinkyPerc
                ];

                let headerData2 = [
                    linkaText,
                    zmenaString
                ];

                createPanelHeader(panel, headerData1, headerData2);
            });
        });


    });

    $('#exportBtn').click(function () {
        if (typeof window.charts === "undefined") {
            return;
        }

        let linka = $("#linkaSelect").val();
        let data = {};

        window.charts.forEach(function (item) {
            let chart = item.chart;
            let chartData = [];

            chart.data.datasets[0].data.forEach(function (item, index) {
                let tmpData = {
                    label: chart.data.labels[index],
                    value: item
                };

                for (i = 1; i < chart.data.datasets.length; i++) {
                    tmpData["limit" + i] = chart.data.datasets[i].data[index];
                }

                chartData.push(tmpData)
            });

            data[chart.options.title.text] = {
                'type': (chart.config.type === "bar" ? "stvrthodinky" : "dopravnik"),
                'data': chartData
            };
        });

        $.post("/export/" + linka, data, function( result ) {
            console.log(result);
        });
    });

    function createPanelHtml() {
        let panelTemplate = document.getElementById('panelTemplate');
        let panelDiv = $(panelTemplate.content.querySelector('div.row')).clone();

        $('#mainArea').append(panelDiv);

        return panelDiv;
    }

    function createStvrtHodChartHtml(panel) {
        let chartTemplate = document.getElementById('stvrthodChartTemplate');
        let chartDiv = $(chartTemplate.content.querySelector('div.row')).clone();

        panel.find('div.panel-body').append(chartDiv);

        return chartDiv;
    }

    function createConvChartHtml(panel) {
        let chartTemplate = document.getElementById('convChartTemplate');
        let chartDiv = $(chartTemplate.content.querySelector('div.row')).clone();

        panel.find('div.panel-body').append(chartDiv);

        return chartDiv;
    }

    function createPanelHeader(panel, headerData1, headerData2) {
        panel.find('.header-vyrobene').text(' ' + headerData1[0]);
        panel.find('.header-dobre').text(' ' + headerData1[1] + ' - ' + headerData1[2] + '%');

        panel.find('.header-nazov').text(headerData2[0]);
        panel.find('.header-zmena').text('[' + headerData2[1] + ']');
    }

    function appendStvrthodinkyChart(data, chartDiv) {
        if (data.success === false) {
            return;
        }

        if (data.dataEmpty === true) {
            return;
        }

        let tempData = {
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

        window.charts = new Chart(chartDiv.find('canvas'), {
            type: 'bar',
            data: tempData,
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        title: function (tooltipItems) {
                            return moment(tooltipItems[0].xLabel).format('DD/MM/YYYY HH:mm');
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

    function appendDopravnikyChart(dopravnik, chartDiv) {
        let tempData = {
            labels: dopravnik.data.labels,
            datasets: [{
                label: "Pocet ks",
                fill: false,
                borderColor: '#337ab7',
                borderWidth: 2,
                lineTension: 0,
                data: dopravnik.data.values,
                datalabels: {
                    display: false
                }
            }, {
                label: "Minimum",
                fill: false,
                borderColor: 'red',
                borderWidth: 1,
                lineTension: 0,
                data: dopravnik.minVals,
                datalabels: {
                    display: false
                }
            }, {
                label: "Ok",
                fill: false,
                borderColor: 'green',
                borderWidth: 1,
                lineTension: 0,
                data: dopravnik.okVals,
                datalabels: {
                    display: false
                }
            }]
        };

        window.charts = new Chart(chartDiv.find('canvas'), {
            type: 'line',
            data: tempData,
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: dopravnik.nazov
                },
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        title: function (tooltipItems) {
                            return moment(tooltipItems[0].xLabel).format('DD/MM/YYYY HH:mm');
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
                            max: dopravnik.MaximumAxis
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
    }

    function showAlert(msg, type) {
        $('#alertText').text(msg);

        if (type === 'alert-info') {
            $('#alertType').text('Info!');
        } else {
            $('#alertType').text('Pozor!');
        }

        $('#inner-alert').removeClass();
        $('#inner-alert').addClass('alert alert-dismissible ' + type);
        $("#alert").fadeTo(2000, 500).slideUp(500, function(){
            $("#alert").slideUp(500);
        });
    }
});
