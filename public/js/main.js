$(document).ready(function () {
    const templates = {};
    Object.defineProperty(templates, 'panelTemplate', {
        value: "            <div class=\"row\" style=\"margin: auto;\">\n" +
        "                <div class=\"col-xs-12\">\n" +
        "                    <div class=\"panel panel-primary\" style=\"margin-bottom: 2rem;\">\n" +
        "                        <div class=\"panel-heading\">\n" +
        "                            <div class=\"row\">\n" +
        "                                <div class=\"col-xs-2\">\n" +
        "                                    <span class=\"glyphicon glyphicon-wrench\" aria-hidden=\"true\"></span><span class=\"header-vyrobene\"></span>\n" +
        "                                    <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" style=\"margin-left: 1rem;\"></span><span class=\"header-dobre\"></span>\n" +
        "                                </div>\n" +
        "                                <div class=\"col-xs-8 text-center\">\n" +
        "                                    <strong class=\"header-nazov\"></strong><span class=\"header-zmena\" style=\"margin-left: .5rem;\"></span>\n" +
        "                                </div>\n" +
        "                                <div class=\"col-xs-2\">\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                        <div class=\"panel-body\">\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                </div>\n" +
        "            </div>",
        writable: false
    });

    Object.defineProperty(templates, 'stvrthodinkyTemplate', {
        value: "            <div class=\"row\">\n" +
        "                <div class=\"col-xs-12\">\n" +
        "                    <div class=\"row\" style=\"margin-bottom: 0;\">\n" +
        "                        <div class=\"col-xs-12 text-center\">\n" +
        "                            <h4><strong>Štvrťhodinky</strong></h4>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                    <div class=\"row\" style=\"border-bottom: 1px solid #337ab7;\">\n" +
        "                        <div class=\"col-xs-12\">\n" +
        "                            <div class=\"chart-container\" style=\"position: relative; height:40vh;\">\n" +
        "                                <canvas></canvas>\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                    <div class=\"row\" style=\"margin-bottom: 0;\">\n" +
        "                        <div class=\"col-xs-12 text-center\">\n" +
        "                            <h4><strong>Dopravníky</strong></h4>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                </div>",
        writable: false
    });

    Object.defineProperty(templates, 'dopravnikTemplate', {
        value: "            <div class=\"row\">\n" +
        "                <div class=\"col-xs-12 chart-container\" style=\"position: relative; height:40vh;\">\n" +
        "                    <span class=\"infoPanel\">\n" +
        "                        <span class=\"glyphicon glyphicon-chevron-up\" aria-hidden=\"true\"></span><span class=\"conv-maximum\"></span>\n" +
        "                        <span class=\"infoPanelSpan\">\n" +
        "                            <span class=\"glyphicon glyphicon-chevron-down\" aria-hidden=\"true\"></span><span class=\"conv-minimum\"></span>\n" +
        "                        </span>\n" +
        "                    </span>\n" +
        "                    <canvas></canvas>\n" +
        "                </div>\n" +
        "            </div>",
        writable: false
    });

    var chartsArr = [];
    Object.defineProperty(window, 'charts', {
        configurable: true,

        get: function () {
            return chartsArr;
        },

        set: function (val) {
            if (val.length === 0) {
                $('#printBtn').prop('disabled', true);
                chartsArr = [];
            } else {
                $('#printBtn').prop('disabled', false);
                chartsArr.push(val);
            }

        }
    });

    var chartsInfoArr = [];
    Object.defineProperty(window, 'chartsInfo', {
        configurable: true,

        get: function () {
            return chartsInfoArr;
        },

        set: function (val) {
            if (val.length === 0) {
                chartsInfoArr = [];
            } else {
                chartsInfoArr.push(val);
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
        window.chartsInfo = [];

        if ($('.zmenaBtn').hasClass('active') === false) {
            showAlert('Prosim zvoľte zmenu [R, P, N].', 'alert-danger');
            return;
        } else if ($('#datePicker').val() === '') {
            showAlert('Prosim zvoľte dátum', 'alert-danger');
            return;
        }

        let preloader = $("#preloader");
        let linka = $('#linkaSelect').val();
        let linkaText = $("#linkaSelect option:selected").text();
        let stvorzmenka = $("#zmenaTgl").prop('checked');
        let datum = $('#datePicker').val();
        let nextDay = moment(datum, 'DD/MM/YYYY').add(1, 'd').format('DD/MM/YYYY');

        preloader.show();

        mainArea.empty();
        mainArea.hide();

        let numOfZmena = $('.zmenaBtn.active').length;

        $('.zmenaBtn.active').each(function () {
            let zmena = $(this).data('zmena');
            let zmenaString = "";
            let stvrthodinkyData = {}, dopravnikyData = {};
            let startTime = "", endTime = "";

            switch (zmena) {
                case "R":
                    startTime = datum + " 06:00";
                    endTime = datum + (stvorzmenka ? " 18:00" : " 14:00");
                    zmenaString = "Ranná zmena";
                    break;
                case "P":
                    startTime = datum + " 14:00";
                    endTime = (stvorzmenka ? nextDay + " 02:00" : datum + " 22:00");
                    zmenaString = "Poobedná zmena";
                    break;
                case "N":
                    startTime = datum + (stvorzmenka ? " 18:00" : " 22:00");
                    endTime = nextDay + " 06:00";
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
                numOfZmena -= 1;
                
                if (numOfZmena === 0) {
                    mainArea.show();
                    preloader.hide();
                }

                if (stvrthodinkyData.dataEmpty === true) {
                    return;
                }

                let panel = createPanelHtml();

                let chartDiv = createStvrtHodChartHtml(panel);
                appendStvrthodinkyChart(stvrthodinkyData, chartDiv);

                let chartCanvas = chartDiv.find('canvas');
                chartCanvas.attr('id', [linkaText, zmena, "S"].join("_"));

                let chartInfoData = {
                    'id': chartCanvas.attr('id'),
                    'produkcia': stvrthodinkyData.data.Production,
                    'stvrthodinky': stvrthodinkyData.data.Stvrthodinky,
                    'stvrthodinkyPerc': stvrthodinkyData.data.StvrthodinkyPerc,
                    'linka': linkaText,
                    'zmena': zmenaString,
                    'chartImage': '',
                    'dopravniky': []
                };

                if (dopravnikyData.success === true) {
                    dopravnikyData.Dopravniky.forEach(function (dopravnik) {
                        let chartDiv = createConvChartHtml(panel);

                        chartDiv.find('.conv-maximum').text(dopravnik.Maximum);
                        chartDiv.find('.conv-minimum').text(dopravnik.Minimum);
                        appendDopravnikyChart(dopravnik, chartDiv);

                        let chartCanvas = chartDiv.find('canvas');
                        chartCanvas.attr('id', [dopravnik.nazov, zmena, "D"].join("_"));

                        chartInfoData['dopravniky'].push({
                            'id': chartCanvas.attr('id'),
                            'nazov': dopravnik.nazov,
                            'minimum' : dopravnik.Minimum,
                            'maximum' : dopravnik.Maximum,
                            'chartImage': ''
                        });
                    });
                }

                
                createPanelHeader(panel, chartInfoData);

                window.chartsInfo.push(chartInfoData);

                if (numOfZmena === 0) {
                    sessionStorage.setItem('panelObjects', JSON.stringify(window.chartsInfo));
                }
            });
        });


    });

    $('#printBtn').click(function () {
        let panels = JSON.parse(sessionStorage.getItem('panelObjects'));
        panels.forEach(function (stvrthodinky) {
            stvrthodinky.chartImage = document.getElementById(stvrthodinky.id).toDataURL();
            stvrthodinky.dopravniky.forEach(function (dopravnik) {
                dopravnik.chartImage = document.getElementById(dopravnik.id).toDataURL();
            });
        });

        $.post("/save", {'data': panels}, function (data) {
            let popUp = window.open('/print/' + data.cacheId, '_blank ');
            if (popUp == null || typeof(popUp) ==='undefined') {
                alert('Prosim povolte vyskakovacie okna pre tento odkaz.');
            }
        }, "json");
    });


    function createPanelHtml() {
        return $(templates.panelTemplate).appendTo("#mainArea");
    }

    function createStvrtHodChartHtml(panel) {
        return $(templates.stvrthodinkyTemplate).appendTo(panel.find('div.panel-body'));
    }

    function createConvChartHtml(panel) {
        return $(templates.dopravnikTemplate).appendTo(panel.find('div.panel-body'));
    }

    function createPanelHeader(panel, chartInfoData) {
        panel.find('.header-vyrobene').text(' ' + chartInfoData.produkcia);
        panel.find('.header-dobre').text(' ' + chartInfoData.stvrthodinky + ' - ' + chartInfoData.stvrthodinkyPerc + '%');

        panel.find('.header-nazov').text(chartInfoData.linka);
        panel.find('.header-zmena').text('[' + chartInfoData.zmena + ']');
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
        $("#alert").fadeTo(2000, 500).slideUp(500, function () {
            $("#alert").slideUp(500);
        });
    }
});
