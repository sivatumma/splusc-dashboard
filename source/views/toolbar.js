enyo.kind({
    name: "ebcDashboard.Toolbar",
    classes: "app",
    components: [{
        kind: "FittableRows",
        classes: "enyo-fit",
        components: [{
            kind: "Signals",
            closeSliderMenu: "closeSliderMenu",
        }, {
            kind: "onyx.Toolbar",
            classes: "ebctoolbar",
            components: [{
                kind: "FittableColumns",
                classes: "fullwidth toolbarDefaultPadding",
                components: [{
                    classes: "toolbarLeftSec",
                    components: [{
                        panel: "info",
                        ontap: "togglePullout",
                        classes: "menuIcon"
                    }, {
                        classes: "logo"
                    }]
                }, {
                    content: "S+C Cisco EBC",
                    classes: "heading"
                }, {
                    kind: "layerPopUpMenu"
                }]
            }]
        }]
    }, {
        kind: "sliderMenu",
        classes: "pullout"
    }],
    togglePullout: function(inSender) {
        this.$.sliderMenu.toggle(inSender.panel);
    },
    closeSliderMenu: function(inSender) {
        var panel = "info";
        this.$.sliderMenu.toggle(panel);
    },
    openInfobox: function(e) {
        var pix = this.$.map.hasNode().tryLocationToPixel(e.target.getLocation(), Microsoft.Maps.PixelReference.control);
        e.originalEvent && e.originalEvent.stopPropagation && e.originalEvent.stopPropagation();
        this.$.infobox.openWithItem(e.target.item, pix.y, pix.x + 18);
    }
});