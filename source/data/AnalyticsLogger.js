enyo.kind({
  name: "AnalyticsLogger",
  statics:{
    loggerKey: "cc8a2b8e-9012-462e-b3ae-7e7ea5b4408a",
    loggerHost: "http://logs.loggly.com",
    loggerURL: "",
    apiURL: "http://sccls.loggly.com/apiv2/events?rsid={query_id}",
    appName: "Cisco CIM Portal",
    platformInfo: {name:'unknown'},
    _analyticsLogger: null,
    initialize: function() {
      AnalyticsLogger.loggerURL = AnalyticsLogger.loggerHost+'/inputs/'+AnalyticsLogger.loggerKey;
      if (typeof(loggly) !== 'undefined') {
        enyo.log('sending analytics to:'+AnalyticsLogger.loggerURL);
        AnalyticsLogger._analyticsLogger = new loggly.castor({ url: AnalyticsLogger.loggerURL, level: 'log'});
      } else {
        enyo.warn('analytics not available');
      }
    },
    _sendLogData: function(logData) {
        AnalyticsLogger._analyticsLogger.log(logData);
    },
    logAnalyticsData: function(logObj) {
      var postData = {date: Date(), location: window.location.href, app: AnalyticsLogger.appName};
      if (AnalyticsLogger._analyticsLogger) {
        enyo.mixin(postData,AnalyticsLogger.platformInfo);

        enyo.mixin(postData,logObj);

        if (navigator && navigator.geolocation) {
          var that = this;
          navigator.geolocation.getCurrentPosition(function(position) {
            postData.location = position;
            that._sendLogData(postData);
          });
        } else {
          this._sendLogData(postData);
        }
      } else {
        enyo.warn('unable to log analytics:'+ postData);
      }
    },
    getAnalyticsData: function(resource, context, callback) {
      var reportURL = this.apiURL.replace("{query_id}", resource);
      var ajax = new enyo.Ajax({
        url: reportURL,
        cacheBust: false,
        headers: {
          "Authorization": this.authHeader()
        }
      });
      ajax.response(context, callback);
      ajax.cache();
      ajax.error(this, "processError");
      ajax.go();
    },
    authHeader: function() {
      var tok = "devtuity" + ':' + "dev2MTUITY";
      var hash = window.btoa(tok);
      return "Basic " + hash;
    },
    processError: function(inSender, inResponse) {
      console.error("*** Loggly API ERROR ***");
      console.error(inResponse);
    }
  }
});
