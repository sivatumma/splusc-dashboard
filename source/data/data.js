/**
    For simple applications, you might define all of your models, collections,
    and sources in this file.  For more complex applications, you might choose to separate
    these kind definitions into multiple files under this folder.
*/
enyo.kind({
    name: "AjaxAPI",
    statics: {
        //You can make the API request using:
        //  DeviceDetailApi.getConnections(["172.16.255.16"], this, this.test);
        doLogout: function(errorReason) {
            // @TODO: show error popup with ok button instead of alert
            var logoutUrl = AppConfig.baseURL + "logout.jsp";
            if (errorReason) {
                logoutUrl += "?type=" + errorReason;
            }
            window.location = logoutUrl;
            responseHandled = false;
        },
        //In the object that makes the call, you can do handle the response:
        //  test: function(inSender, inEvent){
        //   }
        defaultErrorHandler: function(inSender, inResponse) {
            var responseHandled = false;
            AppConfig.alert(inResponse);
            switch (inResponse) {
                case 0:
                    enyo.Signals.send("onAjaxError", {
                        errorMessage: "Unable to connect to the server. You will be logged out automatically.",
                        forceLogout: true,
                        errorReason: "unreachable"
                    });
                    break;
                case 'timeout':
                    enyo.Signals.send("onAjaxError", {
                        errorMessage: "Request Timed Out"
                    });
                    break;
                default:
                    if (inSender.xhrResponse.body) {
                        enyo.Signals.send("onAjaxError", {
                            errorMessage: "Error: " + inSender.xhrResponse.body
                        });
                    } else {
                        enyo.Signals.send("onAjaxError", {
                            errorMessage: "Error: Unknown"
                        });
                    }
                    // log the user out
                    break;
            }
            return responseHandled;
        },
        unifiedSuccessHandler: function(inSender, inResponse) {
            var responseHandled = true;
            if (inResponse !== null && (inResponse === "" || typeof inResponse === 'object') || inSender.contentType === "application/octet-stream") {
                // return false so that the local success handler can process the response
                responseHandled = false;
            } else {
                // log the user out
                enyo.Signals.send("onAjaxError", {
                    errorMessage: "Session Expired.\n You will be logged out automatically.",
                    errorReason: "session_expired",
                    forceLogout: true
                });
            }
            return responseHandled;
        },
        // request URL - url to call (baseURL + requestURL)
        // ipArray - array of IPs to add to the request or null for none
        // context - context for successCallback or errorCallback
        // successCallback - success handler (parser for the json)
        // errorCallback - optional error handler
        makeAjaxRequest: function(requestURL, ipArray, context, successCallback, errorCallback, method, postBody, contentType, timeoutValue, token) {
            // set url (stripping leadding '/' from requestURL)
            if (requestURL.charAt(0) == "/") {
                requestURL = requestURL.replace("/", "");
            }
            var urlText = requestURL;
            if (urlText.indexOf(AppConfig.baseURL) != 0) {
                if (AppConfig.baseURL.charAt(AppConfig.baseURL.length - 1) == "/") {
                    urlText = AppConfig.baseURL + requestURL;
                } else {
                    urlText = AppConfig.baseURL + "/" + requestURL;
                }
            }
            if (ipArray) {
                urlText = this.generateParamsText(urlText, ipArray);
            }
            // log.debug("*** makeAjaxRequest: " + urlText);
            var methodType = (method && method !== "") ? method.toUpperCase() : "GET";
            var ajax = new enyo.Ajax({
                url: urlText,
                cacheBust: false,
                method: methodType,
                timeout: timeoutValue || AppConfig.defaultTimeoutInterval,
                headers: token,
                contentType: contentType || "application/json", // not setting this treats the data a form
                postBody: postBody
            });
            if (postBody) {
                switch (methodType) {
                    case "POST":
                    case "PUT":
                    case "GET":
                        ajax.postBody = postBody || {};
                        ajax.handleAs = "json";
                        break;
                    default:
                        console.log("Post Body passed to request, but method type is " + methodType, urlText);
                        break;
                }
            }
            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            var successHandler = (context && successCallback) ? enyo.bind(context, successCallback) : null;
            ajax.response(function(inSender, inResponse) {
                // unifiedSuccessHandler returns true if it handled the response, so
                //  don't call the handler if it returns true
                if (!AjaxAPI.unifiedSuccessHandler(inSender, inResponse)) {
                    if (successHandler) {
                        successHandler(inSender, inResponse);
                    }
                }
            });
            var errorHandler = (context && errorCallback) ? enyo.bind(context, errorCallback) : null;
            // user error handler that was passed in or the default handler
            ajax.error(errorHandler || AjaxAPI.defaultErrorHandler);
        },
        generateParamsText: function(urlText, ipArray) {
            urlText = urlText.replace("deviceId=?", "");
            urlText = urlText.replace("?", "");
            _.each(ipArray, function(ip) {
                if (ip == ipArray[0]) {
                    urlText = urlText + "?deviceId=" + ip.toString();
                } else {
                    urlText = urlText + "&deviceId=" + ip.toString();
                }
            }, this);
            return (urlText);
        },
        simpleAjaxRequest: function(requestURL, context, successCallback, errorCallback, method, postBody, contentType, timeoutValue) {
            // set url (stripping leadding '/' from requestURL)
            if (requestURL.charAt(0) == "/") {
                requestURL = requestURL.replace("/", "");
            }
            var urlText = requestURL;
            if (urlText.indexOf(AppConfig.baseURL) != 0) {
                if (AppConfig.baseURL.charAt(AppConfig.baseURL.length - 1) == "/") {
                    urlText = AppConfig.baseURL + requestURL;
                } else {
                    urlText = AppConfig.baseURL + "/" + requestURL;
                }
            }
            var authToken = {
                "token": UserModel.responseHeader.token
            };
            // log.debug("*** makeAjaxRequest: " + urlText);
            var methodType = (method && method !== "") ? method.toUpperCase() : "GET";
            var ajax = new enyo.Ajax({
                url: urlText,
                cacheBust: false,
                method: methodType,
                timeout: timeoutValue || AppConfig.defaultTimeoutInterval,
                headers: authToken,
                contentType: contentType || "application/json", // not setting this treats the data a form
                postBody: postBody
            });
            if (postBody) {
                switch (methodType) {
                    case "POST":
                    case "PUT":
                        ajax.postBody = postBody || {};
                        ajax.handleAs = "json";
                        break;
                    default:
                        log.error("Post Body passed to request, but method type is " + methodType, urlText);
                        break;
                }
            }
            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            var successHandler = (context && successCallback) ? enyo.bind(context, successCallback) : null;
            ajax.response(function(inSender, inResponse) {
                if (successHandler) {
                    successHandler(inResponse);
                }
            });
            var errorHandler = (context && errorCallback) ? enyo.bind(context, errorCallback) : null;
            // user error handler that was passed in or the default handler
            ajax.error(errorHandler || AjaxAPI.defaultErrorHandler);
        },
    }
});
enyo.kind({
    name: "Utils",
    statics: {
        snippet: function(str, cutOffset) {
            if (str == '' || str == null) str = "";
            if (str.length > cutOffset) {
                return (str.substring(0, cutOffset) + "...");
            } else {
                return str;
            }
        },
        isFunction: function(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        }
    }
});

// Layers model
enyo.kind({
    name: "LayersModel",
    statics: {
        dataUpdated: "",
        lastRequestedLayer: '',
        layersObj: [{
            layerName: "lights",
            dynamicLayer: true,
            requestURL: "api/ebc-lights",
            reqStatus: false,
            dataObject: '',
            active: false
        }, {
            layerName: "parking",
            dynamicLayer: true,
            iconType: "car",
            requestURL: "api/ebc-parking",
            reqStatus: false,
            dataObject: '',
            active: false
        }, {
            layerName: "crowd",
            iconType: 'crowd',
            dynamicLayer: true,
            requestURL: "api/mse/location/clients/",
            reqStatus: false,
            dataObject: '',
            active: false
        }, {
            layerName: "traffic",
            iconType: "traffic",
            dynamicLayer: true,
            requestURL: "api/ebc-smart-traffic",
            reqStatus: false,
            dataObject: '',
            active: false
        }],
        changeLayerStatus: function(layerName, status) {
            var layersObj = [];
            var newLayer = {};
            _.each(LayersModel.layersObj, function(layer) {
                newLayer = {};
                enyo.mixin(newLayer, layer);
                if (layer.layerName == layerName) {
                    newLayer.active = status;
                }
                if (newLayer.active && !newLayer.dataObject && !newLayer.reqStatus) {
                    LayersModel.getData(newLayer);
                    newLayer.reqStatus = true;
                }
                layersObj.push(newLayer);
            });
            LayersModel.layersObj = layersObj;
            enyo.Signals.send("layersUpdated");
        },
        periodicUpdateData: function() {
            setInterval(function() {
                _.each(LayersModel.layersObj, function(layer) {
                    if (layer.dynamicLayer && layer.active) {
                        LayersModel.getData(layer);
                    }
                });
            }, AppConfig.dataLoadInterval);
        },
        getData: function(layerObj) {
            var layer = layerObj.layerName;
            LayersModel.lastRequestedLayer = layer;
            var requestURL = "";
            var postBody = "";
            var method = "";
            switch (layer) {
                case "lights":
                    method = "GET";
                    postBody = {
                        // Fetching all the lights
                        "query": {
                            "documentation": "Get all lights operated by specified organization (maps to logical scopes)",
                            "find": {
                                "light": {
                                    "operatedBy": "iot-wf"
                                }
                            }
                        }
                    };
                    break;
                case "parking":
                    method = "GET";
                    postBody = {
                        "query": {
                            "documentation": "Get parking space operated by specified organization",
                            "find": {
                                "parkingSpace": {
                                    "operatedBy": "iot-wf"
                                }
                            }
                        }
                    };
                    break;
                case "traffic":
                    method = "GET";
                    postBody = {
                        "query": {
                            "documentation": "Get viewports corresponding to medium density traffic operated by 'iot-wf'",
                            "find": {
                                "traffic": {
                                    "operatedBy": "iot-wf"
                                }
                            }
                        }
                    };
                    break;
                default:
                    break;
            }
            var token = "123456";
            var authToken = {
                "token": token
            };
            AjaxAPI.makeAjaxRequest(layerObj.requestURL, null, this, "processData", "errorHandler", method, postBody, null, null, authToken);
            // requestURL, ipArray, context, successCallback, errorCallback, method, postBody, contentType, timeoutValue, token
        },
        processData: function(inSender, inResponse) {
            var layersObj = [];
            var newLayer = {};
            _.each(LayersModel.layersObj, function(layer) {
                newLayer = {};
                enyo.mixin(newLayer, layer);
                if (inSender.url.indexOf(layer.requestURL) >= 0) {
                    switch (layer.layerName) {
                        case "lights":
                            newLayer.dataObject = inResponse.lights;
                            break;
                        case "parking":
                            newLayer.dataObject = inResponse.parkingSpace[0].parkingSpots;
                            break;
                        case "traffic":
                            newLayer.dataObject = inResponse.traffic;
                            break;
                        case "crowd":
                            newLayer.dataObject = inResponse.Locations ? inResponse.Locations.WirelessClientLocation : "undefined";
                            break;
                        default:
                            break;
                    }
                }
                layersObj.push(newLayer);
            });
            LayersModel.layersObj = layersObj;
            enyo.Signals.send("layersUpdated", {
                layerName: LayersModel.lastRequestedLayer
            });
            enyo.Signals.send("hideLoader");
        },
        errorHandler: function(inSender, inResponse) {}
    }
});

// energy savings report data
enyo.kind({
    name: "energyModel",
    statics: {
        energySavingsReportData: '',
        getData: function() {
            var token = "123456";
            var authToken = {
                "token": token
            };
            AjaxAPI.makeAjaxRequest("api/graph/energy", null, this, "processData", "errorHandler", "GET", null, 'json', null, authToken);
        },
        processData: function(inSender, inResponse) {
            energyModel.energySavingsReportData = inResponse;
            enyo.Signals.send("energyDataUpdated");
        },
        errorHandler: function (inSender, inResponse) {
            var self = energyModel;
            AjaxAPI.makeAjaxRequest("source/data/energyUsageData.json", null, this, function (data) {
                data = JSON.parse(data.xhrResponse.body);
                energyModel.energySavingsReportData = data;
                enyo.Signals.send("energyDataUpdated");

            }, "localFailure", "GET", null, 'json');
        },
        localFailure: function () {
            console.log("local ajax call failure happend!");
        }
    }
});


// traffic comparison report data
enyo.kind({
    name: "trafficModel",
    statics: {
        trafficComparisonReportData: '',
        getData: function() {
            var token = "123456";
            var authToken = {
                "token": token
            };
            AjaxAPI.makeAjaxRequest("api/graph/traffic", null, this, "processData", "errorHandler", "GET", null, 'json', null, authToken);
        },
        processData: function(inSender, inResponse) {
            trafficModel.trafficComparisonReportData = inResponse;
            enyo.Signals.send("trafficDataUpdated");
        },
        errorHandler: function (inSender, inResponse) {
            AjaxAPI.makeAjaxRequest("source/data/trafficData.json", null, this, function (data) {
                data = JSON.parse(data.xhrResponse.body);
                trafficModel.trafficComparisonReportData  = data;
                enyo.Signals.send("trafficDataUpdated");

            }, "localFailure", "GET", null, 'json');
        },
        localFailure: function () {
            console.log("local ajax call failure happend!");
        }
    }
});

// weather data
enyo.kind({
    name: "weatherModel",
    statics: {
        weatherData: '',
        getData: function() {
            var token = "123456";
            var authToken = {
                "token": token
            };
            AjaxAPI.makeAjaxRequest("api/ebc-weather", null, this, "processData", "errorHandler", "GET", null, 'json', null, authToken);
        },
        getSunshineMinutes:function(sunriseTime,sunsetTime){
            var sunriseTimeArray = sunriseTime.split(" ")[0].split(':');
            var sunsetTimeArray = sunsetTime.split(" ")[0].split(':');
            /*sunshineMinutes = (total minutes from sunrise time to 12:00 noon)+(total mintues from 12:00 noon to sunset time)*/
            var sunshineMinutes = (((12-(Number(sunriseTimeArray[0])+1))*60)+(60-Number(sunriseTimeArray[1])))+((Number(sunsetTimeArray[0])*60)+Number(sunsetTimeArray[1]));
            return sunshineMinutes;
        },
        processData: function(inSender, inResponse) {
            var data = inResponse.data;
            var hourly = data.weather[0].hourly;
            var maxtempC = Number(data.weather[0].maxtempC);

            var temperatureData = new Array();
            var lightData = new Array();

            _.each(hourly,function(item,index){
                temperatureData.push(new Array((index+1)*2,Number(item.tempC)));
                var light = Number(item.chanceofsunshine)*maxtempC*0.01;
                light = Number(light.toFixed(2));
                lightData.push(new Array((index+1)*2,light));
            });
            var remainingHours = _.first(hourly,4).reverse();

            _.each(remainingHours,function(item,index){
                temperatureData.push(new Array((index+9)*2,Number(item.tempC)));
                var light = Number(item.chanceofsunshine)*maxtempC*0.01;
                light = Number(light.toFixed(2));
                lightData.push(new Array((index+9)*2,light));
            });
            var sunShineMinutes = weatherModel.getSunshineMinutes(data.weather[0].astronomy[0].sunrise, data.weather[0].astronomy[0].sunset);
            var moonShineMinutes = (24*60)-sunShineMinutes;
            var weatherData = {};
            weatherData.temperatureData = temperatureData ;
            weatherData.lightData = lightData;
            weatherData.sunShineHours = sunShineMinutes/60;
            weatherData.moonShineHours = moonShineMinutes/60;
            var currentData = {};
            currentData.windspeedKmph = data.current_condition[0].windspeedKmph;
            currentData.precipMM = data.current_condition[0].precipMM;
            currentData.temp_C = data.current_condition[0].temp_C;
            currentData.cloudcover = data.current_condition[0].cloudcover;
            weatherData.currentData = currentData;
            weatherModel.weatherData = weatherData;
            enyo.Signals.send("weatherDataUpdated");
        },
        errorHandler: function (inSender, inResponse) {
            var temperatureData =  	[[2,5],[4,8],[6,10],[8,14],[10,16],[12,19],[14,21],[16,25],[18,30],[20,20],[22,18],[24,10]];
            var lightData 		= 	[[2,3],[4,7],[6,9],[8,11],[10,12],[12,17],[14,25],[16,30],[18,32],[20,20],[22,16],[24,9]];
            var weatherData = {};
            weatherData.temperatureData = temperatureData ;
            weatherData.lightData = lightData;
            weatherData.sunShineHours = 650/60;
            weatherData.moonShineHours = ((24*60)-650)/60;
            var currentData = {};
            currentData.windspeedKmph = 11;
            currentData.precipMM = 0;
            currentData.temp_C = 28;
            currentData.cloudcover = 0;
            weatherData.currentData = currentData;
            weatherModel.weatherData = weatherData;
            enyo.Signals.send("weatherDataUpdated");
        }
    }
});