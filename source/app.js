/**
    Define and instantiate your enyo.Application kind in this file.  Note,
    application rendering should be deferred until DOM is ready by wrapping
    it in a call to enyo.ready().
*/
enyo.kind({
    name: "ebc.Application",
    kind: "enyo.Application",
    view: "ebc.MainView",
    kind: "Application",
    published: {
        currentView: "",
        viewstack: 0,
    },
    components: [],
    setViewDirect: function(viewName) {
        this.viewstack = []; // reset the stack
        this.pushView(viewName);
    },
    pushView: function(viewName) {
        // use when you want to return from a view
        this.viewstack.push(viewName);
        this.setCurrentView(viewName);
    },
    popView: function() {
        var previousView = this.viewstack.pop();
        var newView = this.viewstack.length ? this.viewstack[this.viewstack.length - 1] : "";
        this.setCurrentView(newView);
    },
    create: function() {
        this.inherited(arguments);
        this.viewstack = [];
    },
});
enyo.ready(function() {
    var appConfig = new AppConfig();
    var application = new ebc.Application({
        name: "app"
    });
});

function getUserLocation() {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function(geoLocation) {
        return [geoLocation.coords.latitude, geoLocation.coords.longitude];
    });
    return false;
}