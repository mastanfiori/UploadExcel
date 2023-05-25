/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/itell/bradford/ZTRACKING_EXCEL_UPLD/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});