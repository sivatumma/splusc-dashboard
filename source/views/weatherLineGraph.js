enyo.kind({
    name:"weatherLineGraph",
    classes:"weatherLineGraph",
    drawWeatherGraph:function(containerID,temperatureData,lightData,sunShineMinutes,moonShineMinutes){
        var self = this;
        $(function () {
            self.chart = new Highcharts.Chart({
                exporting: { enabled: false },
                credits: {
                    enabled: false
                },
                title:{
                	text:''
                },
                chart: {
                	type: 'line',
                    renderTo: containerID,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                legend: {
            		align: 'right',
            		verticalAlign: 'top',
            		floating: true
            	},
                xAxis: {
            		tickInterval: 2
        		},
        		yAxis:{
        			lineWidth: 1,
        			gridLineWidth: 0,
        			tickInterval:5,
        			labels: {
                		format: '{value}°C',
                		style: {
                    		color: Highcharts.getOptions().colors[1]
                		}
                	},
                	max:35,
                	min:0 
        		},
        		tooltip: {
        			headerFormat: '<small>{point.key}hour</small><br/>',
            		pointFormat: '{series.name}: <b>{point.y}</b><br/>',
            		valueSuffix: ' °C',
           			shared: true
        		},
        		plotOptions: {
            		line: {
                		dataLabels: {
                    		enabled: true,
                    		align: "left"
                		}
            		}
        		},
        		series: [{
            		name: 'Light',
            		marker: {
               			symbol: 'square'
            		},
            		data: lightData
        			}, {
            		name: 'Temperature',
            		data: temperatureData
        			}/*,{
                    type: 'pie',
                    name: 'Total consumption',
                    data: [ {
                        name: 'Sunshine hours',
                        y: sunShineMinutes/60,
                        color: Highcharts.getOptions().colors[3],
                        sliced: true,
                        selected: true
                    },{
                        name: 'Moonshine hours',
                        y: moonShineMinutes/60,
                        color: Highcharts.getOptions().colors[1]
                    }],
                    center: [150, 80],
                    size: 150,
                    showInLegend: false,
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '{point.name}'
                    },
                    dataLabels: {
                        enabled:true
                    },
                    allowPointSelect: true,
                    cursor: 'pointer'
                }*/]
            });
        });
    }
});