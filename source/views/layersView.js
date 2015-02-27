enyo.kind({
    name: "layerPopUpMenu",
    classes: "layerPopUpMenu",
    components: [{
        kind: "Signals",
        selectLayer: "selectLayer",
    }, {
        kind: "onyx.MenuDecorator",
        classes: "layerMenuDecorator",
        components: [{
            name: "more",
            classes: "moreIcon"
        }, {
            kind: "onyx.ContextualPopup",
            name: "layerPopupContainer",
            classes: "layerPopupContainer",
            title: "layers PopUp",
            floating: true,
            components: [{
                classes: "layerContainer",
                components: [{
                    content: "Light",
                    classes: "layerText"
                }, {
                    name: "lightsLayer",
                    kind: "onyx.Checkbox",
                    layerName: "lights",
                    checked: true,
                    classes: "layersCheckbox"
                }]
            }, {
                classes: "layerContainer",
                components: [{
                    content: "Parking",
                    classes: "layerText"
                }, {
                    name: "parkingLayer",
                    layerName: "parking",
                    kind: "onyx.Checkbox",
                    checked: true,
                    classes: "layersCheckbox"
                }]
            }, {
                classes: "layerContainer",
                components: [{
                    content: "Traffic",
                    classes: "layerText"
                }, {
                    name: "trafficLayer",
                    layerName: "traffic",
                    kind: "onyx.Checkbox",
                    classes: "layersCheckbox"
                }]
            }, {
                classes: "layerContainer",
                components: [{
                    content: "Crowd",
                    classes: "layerText"
                }, {
                    name: "crowdLayer",
                    layerName: "crowd",
                    kind: "onyx.Checkbox",
                    classes: "layersCheckbox"
                }]
            }, {
                classes: "layerContainer",
                components: [{
                    content: "Noise",
                    classes: "layerText"
                }, {
                    name: "noiseLayer",
                    layerName: "noise",
                    kind: "onyx.Checkbox",
                    classes: "layersCheckbox"
                }]
            }, {
                classes: "layerContainer",
                components: [{
                    content: "Safety units",
                    classes: "layerText"
                }, {
                    name: "SafetyUnitsLayer",
                    layerName: "SafetyUnitsLayer",
                    kind: "onyx.Checkbox",
                    classes: "layersCheckbox"
                }]
            }, {
                name: "menuActionBtns",
                classes: "layerContainer",
                components: [{
                    content: "Cancel",
                    classes: "layersCancelBtn",
                    ontap: "closeLayerPopUp"
                }, {
                    content: "Done",
                    classes: "layersSuccessBtn",
                    ontap: "loadLayers"
                }]
            }]
        }]
    }],
    create: function() {
        this.inherited(arguments);
        this.loadLayers();
    },
    loadLayers: function() {
        _.each(this.$.menuActionBtns.parent.children, function(child) {
            LayersModel.changeLayerStatus(child.children[1].layerName, child.children[1].checked);
        });
        this.$.layerPopupContainer.hide();
    },
    closeLayerPopUp: function() {
        this.$.layerPopupContainer.hide();
    },
    selectLayer: function(inSender, inEvent) {
        if (inEvent.layerName === "parking" && !this.$.parkingLayer.checked) {
            this.$.parkingLayer.setChecked(true);
        } else if (inEvent.layerName === "traffic" && !this.$.trafficLayer.checked) {
            this.$.trafficLayer.setChecked(true);
        }
    }
});