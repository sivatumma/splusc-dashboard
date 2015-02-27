enyo.kind({
    name: "reportsView",
    classes:"reportsView",
    components:[
        {
            name:"controlGroup",
            classes:"reports-view",
            components:[
                {
                    name:"reportsMenuBar",
                    components:[
                        {
                            name:"energySavingsButton",
                            kind: "enyo.Button",
                            content:"Energy Savings Report",
                            viewName:"energySavingsReportView",
                            classes:"report-view-button",
                            ontap:"changeView"
                        },
                        {
                            name:"trafficComparisonButton",
                            kind: "enyo.Button",
                            content:"Traffic Comparison Report",
                            viewName:"trafficReportView",
                            classes:"report-view-button inactive-button",
                            ontap:"changeView"
                        }
                    ]
                },
                {
                    name:"reportsPanelGroup",
                    kind:"enyo.Panels",
                    classes:"reports-panel-group",
                    fit:true,
                    draggable:false,
                    components:[
                        {
                            name:"energySavingsReportView",
                            kind:"EnergySavingsReportView"
                        },
                        {
                            name:"trafficReportView",
                            kind:"TrafficReportView"
                        }
                    ]
                }
            ]
        }

    ] ,
    create:function(){
        this.inherited(arguments);
    },
    changeView:function(inSender,inEvent){
       this.$.reportsPanelGroup.selectPanelByName(inSender.viewName);
       this.$.energySavingsButton.addRemoveClass("inactive-button",!(inSender.viewName==="energySavingsReportView"));
       this.$.trafficComparisonButton.addRemoveClass("inactive-button",!(inSender.viewName==="trafficReportView"));

    }
});