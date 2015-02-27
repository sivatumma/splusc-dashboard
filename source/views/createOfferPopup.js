enyo.kind({
    name: "createOfferPopup",
    classes: "create-offer-popup",
    kind: "FittableColumns",
    published: {
        markerLatlon: null
    },
    uploadedFiles: {
        offer: "",
        coupon: ""
    },
    components: [{
        kind: "Signals",
        locationValue: "locationValue"
    }, {
        classes: "offer-fields-holder width50",
        kind: "FittableRows",
        components: [{
            name: "locationDec",
            kind: "onyx.InputDecorator",
            classes: "text-fields-container top-margin",
            components: [{
                name: "location",
                kind: "onyx.Input",
                classes: "text-fields",
                placeholder: "Location name",
                onblur: "getLatlong"
            }]
        }, {
            name: "titleDec",
            kind: "onyx.InputDecorator",
            classes: "text-fields-container top-margin",
            components: [{
                name: "title",
                kind: "Input",
                classes: "text-fields",
                placeholder: "Title"
            }]
        }, {
            name: "descriptionDec",
            kind: "onyx.InputDecorator",
            classes: "text-fields-container text-area top-margin",
            components: [{
                name: "description",
                kind: "TextArea",
                classes: "text-fields",
                placeholder: "Description"
            }]
        }]
    }, {
        classes: "offer-fields-holder width50",
        kind: "FittableRows",
        components: [{
            kind: "dateComponent",
            name: "startDate",
            classes: "text-fields-container left-margin top-margin"
        }, {
            kind: "dateComponent",
            name: "endDate",
            classes: "text-fields-container left-margin top-margin"
        }, {
            name: "fileInputDiv",
            kind: "FittableColumns",
            classes: "file-input-div",
            components: [{
                kind: "enyo.FileInputDecorator",
                name: "offerImage",
                onSelect: "fileUploaded",
                imageType: "offer",
                classes: "left-margin file-upload-field width50"
            }, {
                kind: "enyo.FileInputDecorator",
                name: "couponImage",
                imageType: "coupon",
                onSelect: "fileUploaded",
                classes: "width50"
            }]
        }, {
            kind: "FittableColumns",
            classes: "actionItems",
            components: [{
                kind: "Button",
                content: "Submit",
                classes: "upload-buttons",
                onclick: "createOffer"
            }, {
                kind: "Button",
                content: "Cancel",
                classes: "upload-buttons",
                onclick: "hidePopup"
            }]
        }]
    }],
    create: function() {
        this.inherited(arguments);
    },
    getLatlong: function() {
        var query = this.$.location.getValue();
        var latlong = new enyo.Ajax({
            url: "http://open.mapquestapi.com/nominatim/v1/search.php?format=json&q=" + query
        });
        latlong.go();
        latlong.response(this, "adressView");
        latlong.error(this, "errorhandler");
    },
    adressView: function(inSender, inResponse) {
        this.setMarkerLatlon(inResponse[0]);
        enyo.Signals.send("showLocation", {
            latlng: this.markerLatlon
        });
    },
    errorhandler: function() {
        console.log(" error in locating the place for the given address")
    },
    locationValue: function(inSender, inEvent) {
        this.$.location.setValue(inEvent.address);
    },
    createOffer: function() {
        var title = this.$.title.getValue();
        var location = this.$.location.getValue();
        var description = this.$.description.getValue();
        var startDate = jQuery('#' + this.$.startDate.$.dateInput.id).val();
        var endDate = jQuery('#' + this.$.endDate.$.dateInput.id).val();
        if (location === '' || location === 'Location') {
            this.$.locationDec.addStyles("border:1px solid red;");
            this.$.locationDec.focus();
            return false;
        } else if (title === '' || title === 'Title') {
            this.$.titleDec.addStyles("border:1px solid red;");
            this.$.titleDec.focus();
            return false;
        } else if (description === '' || description === 'Description') {
            this.$.descriptionDec.addStyles("border:1px solid red;");
            return false;
        } else if (startDate === '') {
            this.$.startDate.addStyles("border:1px solid red;");
            return false;
        } else if (endDate === '') {
            this.$.endDate.addStyles("border:1px solid red;");
            return false;
        } else if (this.uploadedFiles["offer"]["length"] === 0) {
            this.$.offerImage.controls[0].controls[0].addStyles("border:1px solid red;");
            return false;
        } else if (this.uploadedFiles["coupon"]["length"] === 0) {
            this.$.couponImage.controls[0].controls[0].addStyles("border:1px solid red;");
            return false;
        } else {
            this.OfferPopUpValuesValidations();
            var token = 123456;
            var authToken = {
                "token": token
            };
            if (this.uploadedFiles["offer"]["length"]) {
                var filebody = this.uploadedFiles["offer"][0];
                var formData = new FormData();
                formData.append("file", filebody);
                AjaxAPI.makeAjaxRequest("/upload", null, this, "processFilesData", null, "POST", formData, "multipart/form-data", null, authToken);
            }
        }
    },
    processFilesData: function(inSender, inEvent) {
        this.thumbImg = inEvent.image;
        if (this.uploadedFiles["coupon"]["length"]) {
            var filebody = this.uploadedFiles["coupon"][0];
            var formData = new FormData();
            formData.append("file", filebody);
            AjaxAPI.makeAjaxRequest("/upload", null, this, "processOfferData", null, "POST", formData, "multipart/form-data", null, this.authToken);
        }
    },
    processOfferData: function(inSender, inEvent) {
        this.couponImg = inEvent.image;
        var title = this.$.title.getValue();
        var location = this.$.location.getValue();
        var description = this.$.description.getValue();
        var startDate = jQuery('#' + this.$.startDate.$.dateInput.id).val();
        var endDate = jQuery('#' + this.$.endDate.$.dateInput.id).val();
        var postBody = {
            "title": title,
            "location": location,
            "description": description,
            "startDate": startDate,
            "endDate": endDate,
            "thumb": this.thumbImg,
            "coupon": this.couponImg,
        };
        AppConfig.log(postBody);
        AjaxAPI.makeAjaxRequest("/offers", null, this, "processMyData", null, "POST", postBody, null, null, this.authToken);
    },
    processMyData: function(inResponse) {
        this.hidePopup();
        var statusMessage = inResponse.xhrResponse.status === 200 ? 'Offer Created Successfully' : 'Offer was not Created';
        enyo.Signals.send("updateAjaxMessages", {
            ajaxMessage: statusMessage
        });
    },
    fileUploaded: function(inSender, inEvent) {
        this.uploadedFiles[inSender.imageType] = inEvent.files;
    },
    hidePopup: function(inSender, inEvent) {
        this.emptyOfferPopUpValues();
        this.OfferPopUpValuesValidations();
        jQuery('.leaflet-popup-close-button')[0].click();
    },
    OfferPopUpValuesValidations: function() {
        this.$.titleDec.addStyles("border:1px solid silver;");
        this.$.locationDec.addStyles("border:1px solid silver;");
        this.$.descriptionDec.addStyles("border:1px solid silver;");
        this.$.startDate.addStyles("border:1px solid silver;");
        this.$.endDate.addStyles("border:1px solid silver;");
        this.$.offerImage.controls[0].controls[0].addStyles("border:none;");
        this.$.couponImage.controls[0].controls[0].addStyles("border:none;");
    },
    emptyOfferPopUpValues: function() {
        this.$.title.setValue("");
        this.$.location.setValue("");
        this.$.description.setValue("");
        jQuery('#' + this.$.startDate.$.dateInput.id).val("");
        jQuery('#' + this.$.endDate.$.dateInput.id).val("");
        this.uploadedFiles.offer = "";
        this.uploadedFiles.coupon = "";
    },
    closeCreateOfferPopUp: function() {
        // this.$.createOfferPopup.setAutoDismiss(true);
        // this.hide();
    }
});