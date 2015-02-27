enyo.kind({
    name: "EnergySavingsReportView",
    components: [
        {
            kind: "Signals",
            energyDataUpdated: "energyDataUpdated"
        },
        {
            name: "energySavingsReport",
            classes: "charts-group",
            kind:"enyo.FittableColumns",
            components:[
                {
                    name: "legacyReport",
                    classes: "chart"
                },
                {
                    name: "intelligenceReport",
                    classes: "chart"
                },
                {
                    name:"legend",
                    kind:"enyo.FittableRows",
                    classes:"legend",
                    components:[
                        {
                            name:"savings",
                            kind:"enyo.FittableColumns",
                            classes:"legend-savings",
                            components:[
                                {
                                    name:"legendColor",
                                    classes:"legend-color legend-savings-color"
                                },
                                {
                                    name:"legendText",
                                    content:"Savings",
                                    classes:"legend-text"
                                }

                            ]
                        },
                        {
                            name:"consumption",
                            kind:"enyo.FittableColumns",
                            components:[
                                {
                                    name:"legendColor",
                                    classes:"legend-color legend-consumption-color"
                                },
                                {
                                    name:"legendText",
                                    content:"Consumption",
                                    classes:"legend-text"
                                }

                            ]
                        }
                    ]
                }
            ]
        }
    ],
    rendered: function () {
        this.inherited(arguments);
        energyModel.getData();
    },
    energyDataUpdated:function(){
        var legacyEnergyUsageData = energyModel.energySavingsReportData.legacyEnergyUsageData;
        var dataArray = new Array();
        _.each(legacyEnergyUsageData.usageData, function (item, index) {
            dataArray.push(new Array((index + 1) + " hour", item));
        });
        this.drawChart(this.$.legacyReport.id, "Before", legacyEnergyUsageData.date, legacyEnergyUsageData["from-time"], legacyEnergyUsageData["to-time"], dataArray);

        var intelligenceEnergyUsageData = energyModel.energySavingsReportData.intelligenceEnergyUsageData;
        var dataArray = new Array();
        _.each(intelligenceEnergyUsageData.usageData, function (item, index) {
            dataArray.push(new Array((index + 1) + " hour", item));
        });
        this.drawChart(this.$.intelligenceReport.id, 'After "Smart lighting implementation"', intelligenceEnergyUsageData.date, intelligenceEnergyUsageData["from-time"], intelligenceEnergyUsageData["to-time"], dataArray);
    },
    drawChart: function (containerID, reportName, usageDate, fromTime, toTime, usageDataArray) {
        var self = this;
        $(function () {
            self.chart = new Highcharts.Chart({
                exporting: { enabled: false },
                credits: {
                    enabled: false
                },
                chart: {
                    renderTo: containerID,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,//null,
                    plotShadow: false
                },
                title: {
                    verticalAlign:"bottom",
                    text: reportName,
                    y:-10
                },
                tooltip: {
                    enabled: false
                },
                colors: ['#FFB03A','#B64A26'],
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '{point.percentage:.1f} %',
                            distance:-50,
                            color:'white',
                            style:{ "fontSize": "12px"}
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: 'Usage share',
                        data: usageDataArray
                    }
                ]
            });
        });
    }
});