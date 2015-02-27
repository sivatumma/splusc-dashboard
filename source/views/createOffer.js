enyo.kind({
    name: "createOffer",
    kind: "FittableRows",
    classes: "createOfferView",
    components: [{
        kind: "Signals",
        showOffersMap: "showMap",
    }, {
        name: "offerMap",
        classes: "enyo-fit"
    }],
    rendered: function() {
        this.inherited(arguments);
    },
    showMap: function() {
       if(!this.offerMapView){
       this.offerMapView= this.$.offerMap.createComponent({
            kind: "LeafletMap",
            style:"height:100%;"
        }).render();
     }
    }
});