$(document).ready(function () {
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

    const templates = {};
    Object.defineProperty(templates, 'tableTemplate', {
        value: '        <div class="row text-center">\n' +
        '            <div class="col-3">\n' +
        '                <table class="table table-sm">\n' +
        '                    <thead>\n' +
        '                    <tr>\n' +
        '                        <th scope="col"></th>\n' +
        '                        <th scope="col">Ranná</th>\n' +
        '                        <th scope="col">Poobedná</th>\n' +
        '                        <th scope="col">Nočná</th>\n' +
        '                        <th scope="col">Celkovo</th>\n' +
        '                    </tr>\n' +
        '                    </thead>\n' +
        '                    <tbody>\n' +
        '                    <tr>\n' +
        '                        <th scope="row">Počet</th>\n' +
        '                        <td id="pocet_R">0</td>\n' +
        '                        <td id="pocet_P">0</td>\n' +
        '                        <td id="pocet_N">0</td>\n' +
        '                        <td class="table-warning"><strong id="pocet_C"></strong></td>\n' +
        '                    </tr>\n' +
        '                    <tr>\n' +
        '                        <th scope="row">Percento</th>\n' +
        '                        <td id="perc_R">0.0%</td>\n' +
        '                        <td id="perc_P">0.0%</td>\n' +
        '                        <td id="perc_N">0.0%</td>\n' +
        '                        <td class="table-warning"><strong id="perc_C"></strong></td>\n' +
        '                    </tr>\n' +
        '                    </tbody>\n' +
        '                </table>\n' +
        '            </div>\n' +
        '        </div>',
        writable: false
    });

    Object.defineProperty(templates, 'panelTemplate', {
        value: '<div class="row mb-2">\n' +
        '    <div class="col-12">\n' +
        '        <div class="card">\n' +
        '            <div class="card-header text-white" style="background-color: #337ab7">\n' +
        '                <div class="row align-items-center">\n' +
        '                    <div class="panel-icons float-left ml-1 text-left" style="font-size: smaller;">\n' +
        '                        <i class="fas fa-car"></i><span class="header-vyrobene mr-1"></span>\n' +
        '                        <i class="fas fa-check"></i><span class="header-dobre mr-1"></span>\n' +
        '                    </div>\n' +
        '                    <div class="col text-center">\n' +
        '                        <strong class="header-nazov"></strong>\n' +
        '                        <span class="header-zmena ml-1"></span>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '            <div class="card-body"></div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>',
        writable: false
    });

    Object.defineProperty(templates, 'stvrthodinkyTemplate', {
        value: "            <div class=\"row\">\n" +
        "                <div class=\"col\">\n" +
        "                    <div class=\"row\" style=\"margin-bottom: 0;\">\n" +
        "                        <div class=\"col text-center\">\n" +
        "                            <h4><strong>Štvrťhodinky</strong></h4>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                    <div class=\"row\" style=\"border-bottom: 1px solid #337ab7;\">\n" +
        "                        <div class=\"col\">\n" +
        "                            <div class=\"chartWrapper\">\n" +
        "                                <div class=\"chart-container\" >\n" +
        "                                    <canvas></canvas>\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                    <div class=\"row\" style=\"margin-bottom: 0;\">\n" +
        "                        <div class=\"col text-center\">\n" +
        "                            <h4><strong>Dopravníky</strong></h4>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                </div>",
        writable: false
    });

    Object.defineProperty(templates, 'dopravnikTemplate', {
        value: "<div class=\"row\" style=\"margin-bottom: 1rem;\">\n" +
        "    <div class=\"col\">\n" +
        "        <div class=\"row\" style=\"margin-bottom: .5rem;\">\n" +
        "            <div class=\"col\">\n" +
        "                <i class=\"fa fa-caret-up mr-1\" ></i><span class=\"conv-max\"></span>\n" +
        "                <i class=\"fa fa-caret-down mr-1 ml-1\"></i><span class=\"conv-min\"></span>\n" +
        "            </div>\n" +
        "            <div class=\"col\">\n" +
        "                <strong class=\"conv-name\"></strong>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class=\"row\">\n" +
        "            <div class=\"col\">\n" +
        "                <div class=\"chartWrapper\">\n" +
        "                    <div class=\"chart-container\">\n" +
        "                        <canvas></canvas>\n" +
        "                    </div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>",
        writable: false
    });

    let datePicker = $('#datePicker');
    let analyseBtn = $('#analyseBtn');
    let zmenaBtn = $('.zmenaBtn');
    let preloader = $("#preloader");

    datePicker.daterangepicker({
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
            ],
            firstDay: 1
        }
    });

    datePicker.on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY'));

        if (zmenaBtn.hasClass('active') === true) {
            analyseBtn.attr('disabled', false);
        }
    });

    datePicker.on('hide.daterangepicker', function (ev, picker) {
        $(this).blur();
    });

    $('#clearDate').click(function () {
        $(this).blur();
        datePicker.val("");
    });

    $('#linkaSelectBtn').change(function () {
        $(this).blur();
    });

    $('.linkaSelectItem').click(function () {
        $(this).blur();

        $('.linkaSelectItem').removeClass('active');
        $(this).toggleClass('active');

        $('#linkaBtnText').text($(this).text());
    });

    zmenaBtn.click(function () {
        $(this).blur();
        $(this).toggleClass('active');

        if (zmenaBtn.hasClass('active') === true && datePicker.val().length > 0) {
            analyseBtn.attr('disabled', false);
        } else {
            analyseBtn.attr('disabled', true);
        }
    });

    $('#printBtn').click(function () {
        $(this).blur();

        let panels = JSON.parse(sessionStorage.getItem('panelObjects'));
        panels.forEach(function (stvrthodinky) {
            stvrthodinky.chartImage = document.getElementById(stvrthodinky.id).toDataURL();
            stvrthodinky.dopravniky.forEach(function (dopravnik) {
                dopravnik.chartImage = document.getElementById(dopravnik.id).toDataURL();
            });
        });

        $.post("/save", {'data': panels}, function (data) {
            let popUp = window.open('/print/' + data.cacheId, '_blank ');
            if (popUp == null || typeof(popUp) === 'undefined') {
                alert('Prosim povolte vyskakovacie okna pre tento odkaz.');
            }
        }, "json").fail(function() {
            alert( "error" );
        });
    });

    $('#userForm').submit(function (e) {
        e.preventDefault();

        analyseBtn.blur();

        let data = $(this).serializeArray();
        let linka = $('.linkaSelectItem.active').data('id');

        data.push({name: "linka", value: linka});
        data.push({name: "zmeny", value: []});

        $.map($('.zmenaBtn.active'), function (val) {
            data[data.length - 1].value.push($(val).text());
        });

        window.charts = [];
        window.chartsInfo = [];
        $('#mainArea').empty();
        preloader.show();

        $.post("/analyse/" + linka, data, function (data) {
            processData(data);
            preloader.hide();

            sessionStorage.setItem('panelObjects', JSON.stringify(window.chartsInfo));
        }).fail(function () {
            preloader.hide();
            alert('Nastala chyba pri nacitavani udajov!');
        });
    });

    function processData(data) {
        let table = $(templates.tableTemplate).appendTo("#mainArea");
        let stvrthodinkySum = 0;
        let trojzmenka = true;

        data.forEach(function (item) {
            let panel = createPanel(item);

            if (!item.Stvrthodinky) {
                return;
            }

            let chartId = [item.linka, item.zmena, "S"].join("_");
            let chartInfoData = {
                'id': chartId,
                'produkcia': item.produkcia,
                'stvrthodinky': item.stvrthodinky,
                'stvrthodinkyPerc': item.stvrthodinkyPerc,
                'linka': item.linka,
                'zmena': item.zmenaString,
                'chartImage': '',
                'dopravniky': []
            };

            createStvrthodinkyChart(panel, item.Stvrthodinky, chartId);
            chartInfoData['dopravniky'] = createDopravnikyCharts(panel, item.Dopravniky, item.zmena);

            table.find('#pocet_' + item.zmena).text(item.stvrthodinky);
            table.find('#perc_' + item.zmena).text(item.stvrthodinkyPerc + " %");

            stvrthodinkySum += item.stvrthodinky;

            window.chartsInfo.push(chartInfoData);
        });

        table.find('#pocet_C').text(stvrthodinkySum);

        if (trojzmenka) {
            table.find('#perc_C').text(round(stvrthodinkySum / (data.length * 32) * 100, 1) + " %");
        } else {
            table.find('#perc_C').text(round(stvrthodinkySum / (data.length * 48) * 100, 1) + " %");
        }

    }

    function createPanel(data) {
        let panel = $(templates.panelTemplate).appendTo("#mainArea");

        panel.find('.header-vyrobene').text(' ' + data.produkcia);
        panel.find('.header-dobre').text(' ' + data.stvrthodinky + ' - ' + data.stvrthodinkyPerc + '%');
        panel.find('.header-nazov').text(data.linka);
        panel.find('.header-zmena').text('[' + data.zmenaString + ']');

        return panel;
    }

    function getStvrthodinkyChartDiv(panel) {
        return $(templates.stvrthodinkyTemplate).appendTo(panel.find('div.card-body'));
    }

    function createDopravnikyChartDiv(panel) {
        return $(templates.dopravnikTemplate).appendTo(panel.find('div.card-body'));
    }

    function createStvrthodinkyChart(panel, data, chartId) {
        let tempData = {
            labels: data.labels,
            datasets: [{
                label: "Vyrobené ks",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgb(54, 162, 235)",
                borderWidth: 1,
                lineTension: 0,
                data: data.values,
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
                data: data.limit,
                datalabels: {
                    display: false
                }
            }]
        };

        let chartDiv = getStvrthodinkyChartDiv(panel);
        let chartCanvas = chartDiv.find('canvas');
        chartCanvas.attr('id', chartId);

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
                            max: (data.max + 3)
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

    function createDopravnikyCharts(panel, dopravniky, zmena) {
        let result = [];

        dopravniky.forEach(function (dopravnik) {
            let chartDiv = createDopravnikyChartDiv(panel);
            let chartCanvas = chartDiv.find('canvas');
            chartCanvas.attr('id', [dopravnik.nazov, zmena, "D"].join("_"));

            chartDiv.find('.conv-name').text(dopravnik.nazov);
            chartDiv.find('.conv-max').text(dopravnik.max);
            chartDiv.find('.conv-min').text(dopravnik.min);
            appendDopravnikChart(dopravnik, chartDiv);

            result.push({
                'id': chartCanvas.attr('id'),
                'nazov': dopravnik.nazov,
                'min': dopravnik.min,
                'max': dopravnik.max,
                'chartImage': ''
            });
        });

        return result;
    }

    function appendDopravnikChart(dopravnik, chartDiv) {
        let tempData = {
            labels: dopravnik.labels,
            datasets: [{
                label: "Pocet ks",
                fill: false,
                borderColor: '#337ab7',
                borderWidth: 2,
                lineTension: 0,
                data: dopravnik.values,
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

    function round(number, precision) {
        let shift = function (number, precision, reverseShift) {
            if (reverseShift) {
                precision = -precision;
            }
            let numArray = ("" + number).split("e");
            return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
        };
        return shift(Math.round(shift(number, precision, false)), precision, true);
    }
});
