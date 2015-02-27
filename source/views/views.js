/**
 For simple applications, you might define all of your views in this file.
 For more complex applications, you might choose to separate these kind definitions
 into multiple files under this folder.
 */
enyo.kind({
    name: "ebc.MainView",
    classes: "MainView",
    kind: "FittableRows",
    components: [{
        kind: "Signals",
        changeToView: "changeToView",
    }, {
        kind: "ebcDashboard.Toolbar",
        name: "ebcToolbar",
        style: "height:80px"
    }, {
        name: "viewPanels",
        kind: "Panels",
        fit: true,
        draggable: false,
        components: [{
                kind: "LeafletMap",
                viewName: "Map View"
            }, {
                kind: "weatherView",
                viewName: "Weather"
            }, {
                kind: "parkingViolation",
                viewName: "Parking Violation"
            }, {
                kind: "reportsView",
                viewName: "Reports"
            }, {
                kind: "integratedView",
                viewName: "Integrated View"
            }
            // , 
            // {
            //     kind: "createOffer",
            //     viewName: "Create Offers"
            // }
        ]
    }],
    create: function() {
        this.inherited(arguments);
        enyo.Signals.send("changeToView", {
            viewName: "Map View"
        });
    },
    changeToView: function(inSender, inEvent) {
        var that = this;
        var currentView = inEvent.viewName;
        _.find(that.$.viewPanels.children, function(panel, index) {
            if (panel.viewName == currentView) {
                that.$.viewPanels.setIndex(index);
            }
        });
        if (currentView == "Create Offers") {
            enyo.Signals.send("showOffersMap");
        }
    }
});