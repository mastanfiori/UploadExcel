sap.ui.define(["sap/ui/core/format/DateFormat", "sap/ui/core/library"], function (DateFormat, coreLibrary) {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		// currencyValue: function (sValue) {
		// 	if (!sValue) {
		// 		return "";
		// 	}

		// 	return parseFloat(sValue).toFixed(2);
		// },
		// requestStatus: function (value1, value2) {
		// 	if (value1) {

		// 		return value1 + "-" + value2;
		// 	} else
		// 		return "";
		// },
		// removeZero: function (item) {
		// 	if (item) {
		// 		return item.replace(/^0+/, '');
		// 	} else {
		// 		return "";
		// 	}
		// },
		// formatInteger: function (val) {
		// 	if (!val)
		// 		return "";
		// 	else
		// 		return parseInt(val);
		// },
		getDateFormat: function (v) {
			if (v === null || v === "") {
				return "";
			} else {
				var oDateFormatSource = DateFormat.getDateInstance({
					pattern: "MM/dd/yyyy"
				});
				var oDateFormat = DateFormat.getDateInstance({
					pattern: "yyyyMMdd"
				});
				return oDateFormatSource.format(oDateFormat.parse(v));

			}
		},
		formatFloat: function (val) {
			if (!val) {
				return "";
			} else if (val === "NaN") {
				val = "0.00";
				return parseFloat(val).toFixed(2);
			} else {
				return parseFloat(val).toFixed(2);
			}
		},
		resolveTimeDifference: function (dateTime) {
			if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
				var offSet = dateTime.getTimezoneOffset();
				var offSetVal = dateTime.getTimezoneOffset() / 60;
				var h = Math.floor(Math.abs(offSetVal));
				var m = Math.floor((Math.abs(offSetVal) * 60) % 60);
				dateTime = new Date(dateTime.setHours(h, m, 0, 0));
				return dateTime;
			}
			return null;
		},

	};

});