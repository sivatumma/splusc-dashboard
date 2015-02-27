enyo.kind({
    name: "weatherView",
    kind: "FittableRows",
    classes:"weather-view",
    components: [{
        kind: "Signals",
        weatherDataUpdated: "weatherDataUpdated"
    },{
    	name:"currentWeatherData",
        kind: "CurrentWeatherData",
        classes:"current-weather-data",
    }, {
        name: "weatherGraph",
        kind:"weatherLineGraph",
        fit: true
    }],
    rendered:function(){
        this.inherited(arguments);
        weatherModel.getData();
    },
    weatherDataUpdated:function(){
        var weatherData = weatherModel.weatherData
        this.$.weatherGraph.drawWeatherGraph(this.$.weatherGraph.id,weatherData.temperatureData,weatherData.lightData,weatherData.sunShineHours,weatherData.moonShineHours);
        var currentData = weatherData.currentData;
        this.$.currentWeatherData.showWeatherData(currentData.windspeedKmph,currentData.precipMM,currentData.temp_C,currentData.cloudcover);
    }
});
enyo.kind({
    name: "CurrentWeatherData",
    kind: "FittableColumns",
     published: {
        currentStatus: ["Sunny", "Sunny Interval", "Cloudy"]
    },
    components: [{
        classes:"weather-status",
        kind: "FittableRows",
        components: [{
            name: "CityName",
            content: "San Jose",
            classes: "city-name"
        }, {
            kind: "FittableColumns",
            classes: "extra-padding",
            components: [{
                name: "currentCondition",
                classes: "haze item"
            }, {
                content: "Wind",
                classes: "wind item",
            }, {
                name: "windData",
                classes: "wind-data item"
            }, {
                content: "Precip",
                classes: "precip item"
            }, {
                name: "precipData",
                classes: "precip-data item"
            }]
        }]
    }, {
        components: [{
            name: "weatherImage",
            kind: "enyo.Image",
            classes:"weather-image"
        }]
    }, {
        name: "currentTemp",
        classes: "current-temp"
    }],
    create:function(){
        this.inherited(arguments);
    },
    showWeatherData:function(windData,precipData,currentTemp,cloudcover){
    	this.$.windData.setContent(windData+" Km/h");
    	this.$.precipData.setContent(precipData+" %");
    	this.$.currentTemp.setContent(currentTemp+"°");
        if (0 <= cloudcover && cloudcover < 30) {
            this.$.currentCondition.setContent(this.currentStatus[0]);
            this.$.weatherImage.setSrc('assets/sunny_icon.png');
        } else if (30 <= cloudcover && cloudcover < 70) {
            this.$.currentCondition.setContent(this.currentStatus[1]);
            this.$.weatherImage.setSrc('assets/sunny_intervals_icon.png');
        } else {
            this.$.currentCondition.setContent(this.currentStatus[2]);
            this.$.weatherImage.setSrc('assets/cloudy_icon.png');
        }
    }
});
