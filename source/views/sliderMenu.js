enyo.kind({
    name: "sliderMenu",
    kind: "enyo.Slideable",
    draggable: false,
    classes: "pullout",
    events: {},
    components: [{
        kind: "FittableRows",
        classes: "enyo-fit hidden",
        components: [{
            fit: true,
            style: "position: relative;",
            components: [{
                name: "info",
                kind: "Scroller",
                classes: "enyo-fit",
                components: [{
                    kind: "FittableRows",
                    classes: "menuItems",
                    ontap: "changePanelView",
                    components: [{
                        classes: "menuItemsParentDiv",
                        components: [{
                            content: "Menu",
                            classes: "menuText menuItem"
                        }, {
                            classes: "closeIcon"
                        }]
                    }, {
                        classes: "menuItemsParentDiv",
                        components: [{
                            classes: "integratedViewIcon menuItemIcon"
                        }, {
                            content: "Integrated View",
                            viewName: "IntegratedView",
                            classes: "menuText"
                        }]
                    }, {
                        classes: "menuItemsParentDiv",
                        components: [{
                            classes: "mapViewIcon menuItemIcon"
                        }, {
                            content: "Map View",
                            viewName: "Map",
                            classes: "menuText"
                        }]
                    }, {
                        classes: "menuItemsParentDiv",
                        components: [{
                            classes: "weatherViewIcon menuItemIcon"
                        }, {
                            content: "Weather",
                            viewName: "Weather",
                            classes: "menuText"
                        }]
                    }, {
                        classes: "menuItemsParentDiv",
                        components: [{
                            classes: "parkingViewIcon menuItemIcon"
                        }, {
                            content: "Parking Violation",
                            viewName: "ParkingViolation",
                            classes: "menuText"
                        }]
                    }, {
                        classes: "menuItemsParentDiv",
                        components: [{
                            classes: "reportsViewIcon menuItemIcon"
                        }, {
                            content: "Reports",
                            viewName: "Reports",
                            classes: "menuText"
                        }]
                    }
                    // , {
                    //     classes: "menuItemsParentDiv",
                    //     components: [{
                    //         classes: "createOfferViewIcon menuItemIcon"
                    //     }, {
                    //         content: "Create Offers",
                    //         viewName: "CreateOffers",
                    //         classes: "menuText"
                    //     }]
                    // }
                    ]
                }]
            }]
        }]
    }],
    max: 100,
    value: 100,
    unit: "%",
    create: function() {
        this.inherited(arguments);
        this.animateToMin();
        // this.$.info.hide();
    },
    toggle: function(inPanelName) {
        var t = this.$[inPanelName];
        if (t.showing && this.isAtMin()) {
            this.animateToMax();
        } else {
            this.animateToMin();
            this.$.info.hide();
            t.show();
            t.rendered();
        }
    },
    changePanelView: function(inSender, inEvent) {
        enyo.Signals.send("closeSliderMenu");
        enyo.Signals.send("changeToView", {
            "viewName": inEvent.target.innerText
        });
    }
});