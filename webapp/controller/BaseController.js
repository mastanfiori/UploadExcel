sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/generic/app/navigation/service/NavigationHandler",
	"sap/m/MessageBox"
], function (Controller, JSONModel,NavigationHandler, oMsgBox) {
	"use strict";
	// var oDataModel, sPath, oFilters = [];
	return Controller.extend("com.itell.bradford.ZTRACKING_EXCEL_UPLD.controller.BaseController", {
		
		onInit: function() {
            this.oNavigationHandler = new NavigationHandler(this);
        },
        
		//Error Handling Method for OData services
		ErrorHandling: function (oError) {
			if (oError.name) {
				oMsgBox.error(oError.name);
			} else {
				var oXmlData = oError.responseText;
				var oXMLModel = new sap.ui.model.json.JSONModel();
				oXMLModel.setJSON(oXmlData);
				var otext = oXMLModel.getData().error.message.value;
				oMsgBox.error(otext);
			}
		},
		//display dialog close
		onDisplayDialogCancel: function (oEvt) {
			oEvt.getSource().getParent().close();
		},
		
		_testAppState: function () {

		},
		
		/**
         * Changes the URL according to the current app state and stores the app state for later retrieval.
         */
        storeCurrentAppState: function() {
            var oAppStatePromise = this.oNavigationHandler.storeInnerAppState(this.getCurrentAppState());
            oAppStatePromise.fail(function(oError) {
                this._handleError(oError);
            }.bind(this));
            return oAppStatePromise;
        },
        
        _handleError: function(oError) {
            if (oError instanceof sap.ui.generic.app.navigation.service.NavError) {
                oError.showMessageBox();
            }
        }
        
        

	});
});