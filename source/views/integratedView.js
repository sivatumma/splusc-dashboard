enyo.kind({
    name: "integratedView",
    kind: "FittableRows",
    classes: "integratedView",
    components: [{
        kind: "FittableColumns",
        classes: "datarow",
        components: [{
            classes: "currentTrafficCond columnBoxShadow width25",
            ontap: "goToSpecificView",
            viewName: "Map View",
            layerName: "traffic",
            components: [{
                name: "tafficImage",
                classes: "trafficImage ImageWidthHeight"
            }, {
                name: "trafficLabel",
                tag: "p",
                content: "Current taffic conditions in San Jose"
            }]
        }, {
            classes: "currentTrafficCondInBuld margin20 columnBoxShadow width25",
            ontap: "goToSpecificView",
            viewName: "Reports",
            components: [{
                name: "trafficCondInBuldImage",
                classes: "trafficCondInBuldImage ImageWidthHeight"
            }, {
                name: "trafficCondInBuldLabel",
                tag: "p",
                content: "Current taffic conditions in building 10. This will essentially be a graph of vechicle counts entering through mutiple entry"
            }]
        }, {
            classes: "lightingCond columnBoxShadow width25",
            ontap: "goToSpecificView",
            viewName: "Weather",
            components: [{
                name: "lightingCondImage",
                classes: "lightingCondImage ImageWidthHeight"
            }, {
                name: "lightingCondLabel",
                tag: "p",
                content: "Ambient lighting condition"
            }]
        }]
    }, {
        kind: "FittableColumns",
        classes: "datarow",
        components: [{
            classes: "floorPlan columnBoxShadow width25",
            ontap: "goToSpecificView",
            components: [{
                name: "floorPlanImage",
                classes: "floorPlanImage ImageWidthHeight"
            }, {
                name: "floorPlanLabel",
                tag: "p",
                content: "Floor plan flipping"
            }]
        }, {
            classes: "pointsInArea margin20 columnBoxShadow width25",
            ontap: "goToSpecificView",
            components: [{
                name: "pointsInAreaImage",
                classes: "pointsInAreaImage ImageWidthHeight"
            }, {
                name: "pointsInAreaLabel",
                tag: "p",
                content: "Points into the area"
            }]
        }, {
            classes: "ambientTemp columnBoxShadow width25",
            ontap: "goToSpecificView",
            viewName: "Weather",
            components: [{
                name: "ambientTempImage",
                classes: "ambientTempImage ImageWidthHeight"
            }, {
                name: "ambientTempLabel",
                tag: "p",
                content: "Ambient temperature condition charts"
            }]
        }]
    }, {
        kind: "FittableColumns",
        classes: "datarow",
        components: [{
            classes: "currentParking columnBoxShadow width25",
            ontap: "goToSpecificView",
            viewName: "Map View",
            layerName: "parking",
            components: [{
                name: "currentParkingImage",
                classes: "currentParkingImage ImageWidthHeight"
            }, {
                name: "currentParkingLabel",
                tag: "p",
                content: "Current parking availability in EBC parking lot"
            }]
        }, {
            classes: "twitterFeed margin20 columnBoxShadow width25",
            ontap: "goToSpecificView",
            components: [{
                name: "twitterFeedImage",
                classes: "twitterFeedImage ImageWidthHeight"
            }, {
                name: "twitterFeedLabel",
                tag: "p",
                content: "Twitter feeds of traffic incidents"
            }]
        }, {
            classes: "safetyUnits columnBoxShadow width25",
            ontap: "goToSpecificView",
            viewName: "Map View",
            components: [{
                name: "safetyUnitsImage",
                classes: "safetyUnitsImage ImageWidthHeight"
            }, {
                name: "safetyUnitsLabel",
                tag: "p",
                content: "Safety units and where they are located"
            }]
        }]
    }],
    goToSpecificView: function(inSender, inEvent) {
        enyo.Signals.send("changeToView", {
            "viewName": inSender.viewName
        });
        if (inSender.layerName === "traffic") {
            LayersModel.changeLayerStatus(inSender.layerName, true);
            enyo.Signals.send("selectLayer", {
                "layerName": inSender.layerName
            });
        } else if (inSender.layerName === "parking") {
            LayersModel.changeLayerStatus(inSender.layerName, true);
            enyo.Signals.send("selectLayer", {
                "layerName": inSender.layerName
            });
        }
    }
});