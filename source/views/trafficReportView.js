enyo.kind({
    name: "TrafficReportView",

    components: [
        {
            kind: "Signals",
            trafficDataUpdated: "trafficDataUpdated"
        },
        {
            name: "trafficComparisonReport",
            classes: "chart traffic-comparison-chart"
        }
    ],
    rendered: function () {
        this.inherited(arguments);
        trafficModel.getData();
    },
    trafficDataUpdated:function(){
        var legacyTrafficData = trafficModel.trafficComparisonReportData.legacyTrafficData;
        var intelligenceTrafficData =  trafficModel.trafficComparisonReportData.intelligenceTrafficData;
        var regularTrafficData = new Array();
        var increasedTrafficData = new Array();
        regularTrafficData.push(legacyTrafficData.trafficData[0]);
        regularTrafficData.push(intelligenceTrafficData.trafficData[0]);
        increasedTrafficData.push(legacyTrafficData.trafficData[1]);
        increasedTrafficData.push(intelligenceTrafficData.trafficData[1]);


        this.drawChart(this.$.trafficComparisonReport.id,legacyTrafficData.date,intelligenceTrafficData.date, regularTrafficData,increasedTrafficData);
    },
    drawChart: function (containerID,legacyDate,intelligentDate,regularTrafficData,increasedTrafficData) {
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
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'column'
                },
                title:{
                    text:null
                },
                colors: ['#FFB03A','#B64A26'],
                xAxis: {
                    categories: [legacyDate, intelligentDate],
                    lineWidth: 0,
                    tickLength: 0,
                    labels: {
                        style: {
                            fontSize:'15px'
                        }

                    }

                },
                yAxis: {
                    gridLineWidth: 0,
                    stackLabels: {
                        style: {
                            color: 'black'
                        },
                        enabled: true
                    },
                    labels: {
                        enabled: false
                    },
                    title:{
                        text:null
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        pointWidth:35,
                        dataLabels: {
                            enabled: false
                        }
                    }
                },
                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                    layout: 'vertical',
                    y:10,
                    itemStyle: {
                        fontSize:'15px'
                    },
                    symbolHeight:16
                },
                tooltip: {
                    enabled: false
                },
                series: [{
                    name:"Regular Traffic",
                    data:regularTrafficData,
                    index:1
                }, {
                    name:"Increase in Traffic",
                    data:increasedTrafficData,
                    index:0
                }]
            });
        });
    }
});