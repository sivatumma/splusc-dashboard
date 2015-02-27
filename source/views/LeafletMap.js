enyo.kind({
    name: "LeafletMap",
    classes: "leaflet-map",
    published: {
        currentAssetClicked: null,
        currentLocation: null,
        myMarkers: [],
        autoUpdateMapView: false,
        selectedMarkers: {
            lights: [],
            parking: [],
            crowd: []
        },
        resetButton: true,
        mapLayers: [],
        center: {
            // 41.8819° N, 87.6278° W
            lat: AppConfig.latitude ? AppConfig.latitude : "",
            lng: AppConfig.longitude ? AppConfig.longitude : "",
            accuracy: 100
        },
        // showMarker: true,
        zoom: 12,
        maxZoom: 20,
        minZoom: 2,
        // point imagePath to your leaflet images folder
        imagePath: "assets",
        tileProvider: "mapbox",
        currentLocationLayer: null,
        realDirections: [],
        currentDirectionsLayer: "",
        currentLocation: null,
        routeLocations: null,
        routeDirections: null,
        routingStarted: false,
        overrideLocation: null,
        offerOrEvent: false,
        timerID: null,
        offersCreation: false,
        address: null
    },
    events: {
        onMarkerSelectionUpdated: '',
        onRouteSelection: '',
        onInstructionUpdate: ""
    },
    components: [{
        kind: "Signals",
        layersUpdated: "layersUpdated",
        applyLayers: "layersUpdated",
        showLocation: "showLocation",
    }],
    bindings: [{
        from: ".app.currentLocation",
        to: ".currentLocation",
        transform: function(v) {
            var location = this.overrideLocation || v;
            if (location && location.latitude && location.longitude) {
                this.updateRouting();
            }
            return location;
        }
    }],
    clearSelection: function(inSender, inEvent) {
        var that = this;
        _.each(this.selectedMarkers, function(markers, key) {
            var temp = markers;
            that.selectedMarkers[key] = [];
            _.each(temp, function(marker) {
                marker.layer.setIcon(that.generateMarkerIcon(false, marker.layer.options.layerInfo, marker.layer.options.markerData));
            });
        });
        that.doMarkerSelectionUpdated({
            selectedMarkers: that.selectedMarkers
        });
    },
    rendered: function() {
        this.inherited(arguments);
        this.renderMap();
    },
    renderMap: function() {
        this.destroyMap();
        this.imagePathChanged();
        this.createMap();
        this.createLayer();
        this.zoomChanged();
        // LayersModel.periodicUpdateData();
        // this.showMarkerChanged();
        // this.addMarkerClusterLayer();
    },
    createMap: function() {
        var that = this;
        var loc = {
            latitude: AppConfig.latitude ? AppConfig.latitude : "",
            longitude: AppConfig.longitude ? AppConfig.longitude : "",
            accuracy: 100
        };
        this.map = L.map(this.hasNode(), {
            zoomControl: false
        }).setView({
            lat: loc.latitude,
            lng: loc.longitude
        }, this.zoom);
        this.map.on('movestart', function() {
            that.autoUpdateMapView = !that.routingStarted;
        });
        this.map.on('dragstart', function() {
            that.autoUpdateMapView = !that.routingStarted;
        });
        this.map.on('zoomstart', function() {
            that.autoUpdateMapView = !that.routingStarted;
        });
        var that = this;
        this.map.on('click', enyo.bind(this, "createMarker"));
    },
    createMarker: function(e) {
        var that = this;
        // var icon = L.divIcon({
        //     html: "<img src='assets/map_pin.png'/>",
        //     iconSize:[10,10]
        // });
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(that.map).bindPopup("<div id='co' style='width:500px; height:250px; z-index:90;'></div>", {
            maxWidth: 700
        });
        // marker.setIcon(icon);
        marker.on('click', function() {
            var l = new enyo.Control();
            l.createComponent({
                autoDismiss: true,
                kind: "createOfferPopup"
            }).renderInto(L.DomUtil.get("co"));
            that.getLocation(e.latlng, marker);
        });
    },
    showLocation: function(inSender, inEvent) {
        marker.setLatLng([inEvent.latlng.lat, inEvent.latlng.lon]);
    },
    getLocation: function(latlng, marker) {
        var address = new enyo.Ajax({
            // url: "http://nominatim.openstreetmap.org/reverse?format=json&lat= " + latlng.lat + "&lon=" + latlng.lng ,
            url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng.lat + "," + latlng.lng + "&sensor=true",
            method: "GET"
        });
        address.go();
        address.response(this, "processAddress");
        address.error(this, "processError");
    },
    processAddress: function(inSender, inResponse) {
        var temp = (inResponse.results[1] === undefined) ? "undefined " : inResponse.results[1].formatted_address;
        this.setAddress(temp);
        enyo.Signals.send("locationValue", {
            address: this.address
        });
    },
    processError: function() {
        console.log("cannot find the address for this place");
    },
    createLayer: function() {
        var tile = this.getTile();
        if (tile) {
            tile.settings.maxZoom = this.maxZoom;
            tile.settings.minZoom = this.minZoom;
            L.tileLayer(tile.url, tile.settings).addTo(this.map);
        }
    },
    generateMarkerIcon: function(selectionStatus, layer, marker) {
        var validMarker = true;
        var html = "<img ";
        var selection = _.find(this.selectedMarkers[layer.layerName], function(item) {
            return item.layer == marker.layer;
        });
        var className = selection ? ' selectedMarker' : '';
        var iconStyle = " style='width:47px; height:47px;'";
        if (layer) {
            switch (layer.layerName) {
                case 'lights':
                    if ((marker.schedule && marker.schedule.id) || (marker.layer && marker.layer.options.markerData.schedule && marker.layer.options.markerData.schedule.id)) {
                        className = " policyExistingOnThisLight" + className;
                    }
                    if (marker.powerstate == "ON") {
                        html += "src='assets/mapIcons/light_icon.png'";
                    } else {
                        html += "src='assets/mapIcons/no_light_icon.png'";
                    }
                    break;
                case 'parking':
                    if (marker.state && marker.state.occupied == false) {
                        html += "src='assets/mapIcons/no_parking_icon.png'";
                    } else {
                        html += "src='assets/mapIcons/parking_icon.png'";
                    }
                    break;
                case 'crowd':
                    html += "src='assets/mapIcons/map_icon_crowd.svg'";
                    break;
            }
            var icon = null;
            if (validMarker) {
                html += iconStyle;
                html += "/>";
                var icon = L.divIcon({
                    html: html,
                    className: className
                });
                AppConfig.log(icon);
            }
            return icon;
        }
    },
    imagePathChanged: function() {
        L.Icon.Default.imagePath = this.imagePath;
    },
    zoomChanged: function() {
        this.map.setZoom(this.zoom);
    },
    setCenter: function(loc) {
        this.center.lat = loc.latitude;
        this.center.lng = loc.longitude;
        this.center.accuracy = loc.accuracy || 100;
        if (this.currentLocationLayer) {
            this.currentLocationLayer.setLatLng(this.center);
            this.currentLocationLayer.setRadius(this.center.accuracy);
        }
        if (!this.autoUpdateMapView) {
            if (this.map) {
                this.updateCenter();
            }
        }
    },
    updateCenter: function() {
        this.map.panTo(this.getLatLng());
    },
    destroyMap: function() {
        this.map = null;
    },
    updateRouting: function() {
        AppConfig.log("updateRouting", this.routingStarted);
        if (this.routingStarted) {
            var loc = this.overrideLocation || app.getCurrentLocation() || {
                latitude: AppConfig.latitude ? AppConfig.latitude : "",
                longitude: AppConfig.longitude ? AppConfig.longitude : "",
                accuracy: 100
            };
            if (loc) {
                AppConfig.log(loc, this.overrideLocation);
                // update the current location marker
                if (this.autoUpdateMapView) {
                    this.map.setZoom(this.zoom);
                }
                this.setCenter(loc);
                var currentStep = this.routeDirections[0];
                // find a step with some instruction text
                while (currentStep && (currentStep.Instruction == "")) {
                    this.routeDirections.splice(0, 1);
                    currentStep = this.routeDirections[0];
                    AppConfig.log("Next Instruction", currentStep.Instruction, currentStep, this.routeDirections.length);
                }
                if (currentStep) {
                    this.doInstructionUpdate({
                        instruction: currentStep.Instruction
                    });
                    var nextStep = this.routeDirections[1];
                    AppConfig.log(currentStep, nextStep);
                    while (nextStep) {
                        var prevLoc = currentStep.SegmentGeometry.Pos[0];
                        // Uncomment the below line and comment above line If Jiten changes the direction object structure
                        // var prevLoc = this.offerOrEvent ? currentStep.SegmentGeometry.Pos[0] : currentStep.SegmentGeometry.Curve[0].LineString[0].Pos[0];
                        var prevLocation = {
                            latitude: prevLoc.Y,
                            longitude: prevLoc.X
                        };
                        var distanceFromPrev = cls.mapUtils.calculateDistance(prevLocation, loc);
                        var nextLoc = nextStep.SegmentGeometry.Pos[0];
                        // Uncomment the below line and comment above line If Jiten changes the direction object structure
                        // var nextLoc = this.offerOrEvent ? nextStep.SegmentGeometry.Pos[0] : nextStep.SegmentGeometry.Curve[0].LineString[0].Pos[0];
                        var nextLocation = {
                            latitude: nextLoc.Y,
                            longitude: nextLoc.X
                        };
                        var distanceToNext = cls.mapUtils.calculateDistance(nextLocation, loc);
                        var distanceBetweenStops = cls.mapUtils.calculateDistance(prevLocation, nextLocation);
                        AppConfig.log("Instruction distance check", this.routeDirections.length, prevLocation, nextLocation, distanceFromPrev, distanceToNext, distanceBetweenStops);
                        if (distanceToNext < distanceFromPrev) {
                            if (nextStep) {
                                AppConfig.log(nextStep.Instruction, currentStep, nextStep);
                                this.doInstructionUpdate({
                                    instruction: nextStep.Instruction
                                });
                            }
                            this.routeDirections.splice(0, 1);
                            currentStep = this.routeDirections[0];
                            nextStep = this.routeDirections[1];
                        } else {
                            // stop checking
                            nextStep = null;
                        }
                    }
                }
                if (!this.currentLocationLayer) {
                    this.currentLocationLayer = L.circleMarker([loc.latitude, loc.longitude], {
                        radius: loc.accuracy,
                        weight: 1,
                        color: '#403ce0',
                        fillColor: '#403ce0',
                        fillOpacity: 0.2
                    });
                }
                this.map.addLayer(this.currentLocationLayer);
                AppConfig.log(this.routeLocations, loc);
                if (this.routeDirections.length == 1) {
                    var finalLoc = this.routeLocations[this.routeLocations.length - 1];
                    var distanceInMiles = cls.mapUtils.calculateDistance(finalLoc, loc);
                    AppConfig.log(finalLoc);
                    AppConfig.log(finalLoc.latitude, finalLoc.longitude, distanceInMiles);
                    if (distanceInMiles < AppConfig.finalTourStopRange) {
                        this.routingStarted = false;
                        if (this.offerOrEvent) {
                            app.popView();
                        } else {
                            // app.pushView("TOURSUCCESS");
                        }
                    }
                }
            }
        }
    },
    autoRoutingUpdate: function() {
        this.stopRouting();
        this.overrideLocation = this.routeLocations.shift();
        this.updateRouting();
        if (!AppConfig.currentLocation) {
            var that = this;
            this.timerID = setTimeout(enyo.bind(this, "autoRoutingUpdate"), 3000);
        }
    },
    stopRouting: function() {
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
    },
    locate: function(realEvent, realOffer) {
        // TPERRY - this is always false (AppConfig.currentLocation)
        // please investigate...
        this.autoUpdateMapView = true;
        this.routeDirections = RoutesDirectionModel.routesDirectionObject ? _.clone(RoutesDirectionModel.routesDirectionObject.RouteDirections) : [];
        this.offerOrEvent = (realEvent || realOffer);
        if (this.offerOrEvent) {
            this.routeDirections = this.realDirections;
            // this.routeDirections = RoutesDirectionRealModel.routesDirectionRealObject.RouteDirections;
        }
        AppConfig.log(this.routeDirections);
        this.routeLocations = [];
        _.each(this.routeDirections, function(directionItem) {
            // var positions = this.offerOrEvent ? directionItem.SegmentGeometry.Pos : directionItem.SegmentGeometry.Curve[0].LineString[0].Pos;
            _.each(directionItem.SegmentGeometry.Pos, function(item) {
                // _.each(positions, function(item) {
                this.routeLocations.push({
                    latitude: item.Y,
                    longitude: item.X,
                    accuracy: 100
                });
            }, this);
        }, this);
        this.routingStarted = true;
        this.overrideLocation = null;
        if (!AppConfig.currentLocation) {
            var that = this;
            var i = 0;
            // set the first point
            this.overrideLocation = this.routeLocations.shift();
            this.overrideLocation.accuracy = 100;
            this.stopRouting();
            this.timerID = setTimeout(enyo.bind(this, "autoRoutingUpdate"), 3000);
        }
        this.updateRouting();
    },
    locateOld: function() {
        this.map.locate({
            setView: true,
            maxZoom: this.maxZoom
        });
    },
    getZoom: function() {
        return this.map.getZoom();
    },
    getLatLng: function(inLat, inLng) {
        return new L.LatLng(inLat || this.center.lat, inLng || this.center.lng);
    },
    gotoNeighborhood: function(neighborHood) {
        var boundingbox = neighborHood.Bound.split(",");
        var southWest = L.latLng(boundingbox[1], boundingbox[0]);
        var northEast = L.latLng(boundingbox[3], boundingbox[2]);
        var bounds = [southWest, northEast];
        if (this.map) {
            this.map.fitBounds(bounds);
        }
    },
    getTile: function() {
        var tile;
        switch (this.tileProvider) {
            case "google":
                tile = {
                    url: "http: //{s}.googleapis.com/vt?lyrs=m@174225136&src=apiv3.8&hl=en-US&x={x}&y={y}&z={z}&s=Galile&style=api%7Csmartmaps",
                    settings: {
                        subdomains: ['mt0', 'mt1', 'mt2'],
                        attribution: "Map data © 2012 Google"
                    }
                };
                break;
            case "cloudmade":
                tile = {
                    url: "http://{s}.tile.cloudmade.com/" + this.cloudmateApiKey + "/997/256/{z}/{x}/{y}.png",
                    settings: {
                        attribution: "Map data © 2011 OpenStreetMap contributors, Imagery © 2011 CloudMade"
                    }
                };
                break;
            case "mapbox":
                tile = {
                    url: "http://{s}.tiles.mapbox.com/v3/timtuity.j62gk2ig/{z}/{x}/{y}.png",
                    settings: {
                        // attribution: "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='http://mapbox.com'>Mapbox</a>"
                        // attribution: ""
                    }
                };
        }
        return tile;
    },
    layersUpdated: function(inSender, inEvent) {
        var that = this;
        var oldLayers = [];
        _.each(LayersModel.layersObj, function(layer) {
            var layerRendered = _.find(that.mapLayers, function(mapLayer) {
                return mapLayer.options.layerName == layer.layerName;
            });
            if (!layer.active || (layerRendered && layer.dynamicLayer)) {
                that.mapLayers = _.reject(that.mapLayers, function(mapLayer) {
                    if (mapLayer.options.layerName == layer.layerName) {
                        layerRendered = false;
                        oldLayers.push(mapLayer);
                        // that.map.removeLayer(mapLayer);
                    }
                    return mapLayer.options.layerName == layer.layerName;
                });
            }
            if (layer.active && layer.dataObject && !layerRendered) {
                var markerCluster = new L.MarkerClusterGroup({
                    spiderfyOnMaxZoom: true,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: true,
                    removeOutsideVisibleBounds: true,
                    disableClusteringAtZoom: 18,
                    layerName: layer.layerName
                });
                var newMarker = "";
                switch (layer.layerName) {
                    case "traffic":
                        // TO DO: need to add resonable data and code optimization
                        var mediumLatLngSet = [];
                        _.each(layer.dataObject.density.medium, function(item, index) {
                            mediumLatLngSet.push(new L.LatLng(item[0], item[2]));
                            mediumLatLngSet.push(new L.LatLng(item[1], item[3]));
                        });
                        newMarker = new L.polygon(mediumLatLngSet, true, true);
                        var highLatLngSet = [];
                        _.each(layer.dataObject.density.high, function(item, index) {
                            highLatLngSet.push(new L.LatLng(item[0], item[2]));
                            highLatLngSet.push(new L.LatLng(item[1], item[3]));
                        });
                        newMarker = new L.polygon(highLatLngSet, true, true);
                        break;
                    case "crowd":
                        var heatMapLatLng = [];
                        _.each(layer.dataObject, function(marker) {
                            if (marker.GeoCoordinate) {
                                heatMapLatLng.push([parseFloat(marker.GeoCoordinate[0].$.lattitude), parseFloat(marker.GeoCoordinate[0].$.longitude)]);
                            }
                        });
                        var heatLayer = new L.heatLayer(heatMapLatLng);
                        markerCluster.addLayer(heatLayer);
                        break;
                    default:
                        _.each(layer.dataObject, function(marker) {
                            newMarker = new L.Marker(new L.LatLng(marker.geocoordinates.latitude, marker.geocoordinates.longitude), {
                                id: marker.id,
                                icon: that.generateMarkerIcon(false, layer, marker),
                                layerInfo: layer,
                                assetType: layer.layerName,
                                title: layer.layerName,
                                selected: false,
                                clickable: true,
                                markerData: marker
                            });
                            that.myMarkers.push(newMarker);
                            markerCluster.addLayer(newMarker);
                        });
                        break;
                }
                // enyo.Signals.send("hideLoader");
                that.map.addLayer(markerCluster);
                that.mapLayers.push(markerCluster);
            }
        });
        //Removing layers in the end so that there won't be empty clusters.
        _.each(oldLayers, function(layerItem) {
            that.map.removeLayer(layerItem);
        });
    },
    addPolyLine: function(stops, extremePoints, allPoints, tourLayerId) {
        var that = this;
        if (this.map && stops) {
            var directionArray = _.map(stops, function(stop) {
                return L.latLng(parseFloat(stop.Latitude), parseFloat(stop.Longitude));
            });
            AppConfig.log(directionArray);
            var tourMarkerIcon = L.divIcon({
                html: '<i class="fa fa-circle"></i>',
                className: "tourendpoints"
            })
            var polyline = L.polyline(directionArray, {
                color: "#FFBE00",
                weight: 8,
                tourLayerId: tourLayerId
            });
            var layerGroup = "";
            if (allPoints) {
                var markers = _.map(directionArray, function(item) {
                    return L.marker(item, {
                        tourLayerId: tourLayerId
                    });
                });
                var x = [];
                _.each(RoutesDirectionModel.routesDirectionObject.RouteDirections, function(dir) {
                    _.each(dir.SegmentGeometry.Pos, function(item) {
                        // _.each(dir.SegmentGeometry.Curve[0].LineString[0].Pos, function(item) {
                        x.push(L.latLng(parseFloat(item.Y), parseFloat(item.X)));
                    });
                });
                if (x) {
                    polyline = L.polyline(x, {
                        color: "#FFBE00",
                        weight: 8,
                        tourLayerId: tourLayerId
                    });
                }
                layerGroup = L.featureGroup(_.union(markers, polyline));
            } else if (extremePoints) {
                var marker1 = L.marker(directionArray[0], {
                    icon: tourMarkerIcon,
                    tourLayerId: tourLayerId
                });
                var marker2 = L.marker(directionArray[directionArray.length - 1], {
                    icon: tourMarkerIcon,
                    tourLayerId: tourLayerId
                });
                layerGroup = L.featureGroup([marker1, marker2, polyline]);
            } else {
                layerGroup = L.featureGroup([polyline]);
            }
            layerGroup.on('click', function(e) {
                that.doRouteSelection({
                    tourLayerId: e.layer.options.tourLayerId
                });
            })
            this.map.addLayer(layerGroup);
            if (layerGroup.getBounds().isValid()) {
                this.map.fitBounds(layerGroup.getBounds());
            }
        }
    },
    addPolyLine: function(stops, extremePoints, allPoints) {
        var myIcon = L.icon({
            iconUrl: 'assets/pointer_icon.png',
            iconUrl: 'assets/mapIcons/map_icon_featured.svg',
            className: 'markerIconStops'
        });
        var startIcon = L.icon({
            iconUrl: 'assets/mapIcons/map_icon_featured-red.svg',
            className: 'markerIconStops'
        });
        var endIcon = L.icon({
            iconUrl: 'assets/mapIcons/map_icon_building-green.svg',
            className: 'markerIconStops'
        });
        // var specialIcons = {};
        // specialIcons["Wacker near Hyatt Regency"] = "assets/mapIcons/map_icon_nerv.svg";
        // specialIcons["Michigan Ave. Bridge"] = "assets/mapIcons/map_icon_bridge.svg";
        // specialIcons["Michigan & South Water St."] = "assets/mapIcons/map_icon_connected-lights.svg";
        // specialIcons["Michigan Ave & Lake St."] = "assets/mapIcons/map_icon_cta.svg";
        // specialIcons["E. Randolph St. Between Michigan & Stetson"] = "assets/mapIcons/map_icon_city-planning.svg";
        // specialIcons["Stetson Ave & Lake St."] = "assets/mapIcons/map_icon_parking_taxi.svg";
        // specialIcons["Hyatt Regency"] = "assets/mapIcons/map_icon_hyatt-start.svg";
        if (this.map && stops) {
            var stopsArray = [];
            var directionArray = _.map(stops, function(stop) {
                AppConfig.log(stops);
                stopsArray.push(stop.Name);
                return L.latLng(parseFloat(stop.Latitude), parseFloat(stop.Longitude));
            });
            AppConfig.log(directionArray);
            var polyline = L.polyline(directionArray, {
                color: "#465d6c",
                weight: 3
            });
            var layerGroup = "";
            if (allPoints) {
                var markers = _.map(directionArray, function(item, key) {
                    AppConfig.log(stopsArray[parseInt(key)]);
                    AppConfig.log(AppConfig.specialIcons);
                    var iconName = AppConfig.specialIcons[stopsArray[parseInt(key)]];
                    var icon = myIcon;
                    if (iconName) {
                        icon = L.icon({
                            iconUrl: iconName,
                            className: 'markerIconStops'
                        });
                    } else {
                        if (key == "0") {
                            icon = startIcon;
                        }
                        if (key == directionArray.length - 1) {
                            icon = endIcon;
                        }
                    }
                    return L.marker(item, {
                        icon: icon
                    }).on('click', function(event) {
                        enyo.Signals.send("showTourStopDetail", {
                            tourStopObject: stops[key]
                        });
                        AppConfig.log("showStopDetail");
                        AppConfig.log(event);
                        AppConfig.log(stops[key]);
                        AppConfig.log(event.latlng.lat, event.latlng.lng);
                    });
                });
                var x = [];
                _.each(RoutesDirectionModel.routesDirectionObject.RouteDirections, function(dir) {
                    _.each(dir.SegmentGeometry.Pos, function(item) {
                        // _.each(dir.SegmentGeometry.Curve[0].LineString[0].Pos, function(item) {
                        x.push(L.latLng(parseFloat(item.Y), parseFloat(item.X)));
                    });
                });
                AppConfig.log(x);
                if (x) {
                    polyline = L.polyline(x, {
                        color: "#26A9E0",
                        weight: 6,
                        opacity: 1
                    });
                }
                layerGroup = L.featureGroup(_.union(markers, polyline));
            } else if (extremePoints) {
                var marker1 = L.marker(directionArray[0], {
                    icon: startIcon
                });
                var marker2 = L.marker(directionArray[directionArray.length - 1], {
                    icon: endIcon
                });
                layerGroup = L.featureGroup([marker1, marker2, polyline]);
            } else {
                layerGroup = L.featureGroup([polyline]);
            }
            if (this.currentDirectionsLayer) {
                this.map.removeLayer(this.currentDirectionsLayer);
            }
            this.map.addLayer(layerGroup);
            this.currentDirectionsLayer = layerGroup;
            if (layerGroup.getBounds().isValid()) {
                this.map.fitBounds(layerGroup.getBounds());
            }
        }
    },
    addDirectionPolyLine: function(directionArray) {
        this.realDirections = directionArray;
        if (this.map) {
            var x = [];
            _.each(directionArray, function(dir) {
                _.each(dir.SegmentGeometry.Pos, function(item) {
                    // _.each(dir.SegmentGeometry.Curve[0].LineString[0].Pos, function(item) {
                    x.push(L.latLng(parseFloat(item.Y), parseFloat(item.X)));
                });
            });
            AppConfig.log(x);
            if (x) {
                polyline = L.polyline(x, {
                    color: "#26A9E0",
                    weight: 6,
                    opacity: 1
                });
            }
            // layerGroup = L.featureGroup(_.union(markers, polyline));
            layerGroup = L.featureGroup([polyline]);
            if (this.currentDirectionsLayer) {
                this.map.removeLayer(this.currentDirectionsLayer);
            }
            this.map.addLayer(layerGroup);
            this.currentDirectionsLayer = layerGroup;
            if (layerGroup.getBounds().isValid()) {
                this.map.fitBounds(layerGroup.getBounds());
            }
        }
    }
});