enyo.kind({
    name: "dateComponent",
    kind:"onyx.InputDecorator",
    components: [{
        name: 'dateInput',
        kind: "Input",
        placeholder:"Date",
        classes: "text-fields date-input",
        attributes: [{
            readonly: true
        }]
    }],
    create: function() {
        this.inherited(arguments);
    },
    rendered: function() {
        this.inherited(arguments);
        var now = new Date();
        $('#' + this.$.dateInput.id).mobiscroll().date({
            theme: 'ios',
            display: 'bubble',
            mode: 'scroller',
            startYear: now.getFullYear(),
            endYear: now.getFullYear() + 20,
            dateFormat: 'dd M yyyy'
        });
    }
});
enyo.kind({
    name: "timeComponent",
    components: [{
        name: 'timeInput',
        kind: "onyx.Input",
        classes: "timeInput",
        attributes: [{
            readonly: true
        }]
    }],
    create: function() {
        this.inherited(arguments);
    },
    rendered: function() {
        this.inherited(arguments);
        jQuery('#' + this.$.timeInput.id).mobiscroll().time({
            theme: 'ios',
            display: 'bubble',
            mode: 'mixed',
            headerText: false,
            timeFormat: 'HH:ii'
        });
    }
});
