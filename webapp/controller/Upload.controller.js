sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/MessageType",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	'sap/ui/core/message/Message',
	'sap/ui/core/message/ControlMessageProcessor',
	"com/itell/bradford/ZTRACKING_EXCEL_UPLD/util/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, oMsgBox, oMsgType, oMsgItem, oMsgPop, Message,
	ControlMessageProcessor, oFormatter, oMsgToast, Fragment) {
	"use strict";
	var i18n, sPath, Exdata, oSemanticPage, msgFlag, oTable;
	return Controller.extend("com.itell.bradford.ZTRACKING_EXCEL_UPLD.controller.Upload", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.itell.bradford.ZTRACKING_EXCEL_UPLD.view.Upload
		 */
		//Calling Formatter 
		oFormatter: oFormatter,
		onInit: function () {
			var oView = this.getView();
			oSemanticPage = oView.byId("oSemanticPage");
			//Fetch i18n Model
			i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			oTable = oView.byId("TrackingUITab");
			var obj = {
				"TrackingCode": "",
				"Material": "",
				"PanelArea": "",
				"MarketArea": "",
				"PanelCode": "",
				"TrackingDescription": "",
				"PromoID": "",
				"PlanID": "",
				"AgedTrackingCode": "",
				"TemplateLineNumber": "",
				"MergeLineNumber": "",
				"SegmentCode": "",
				"SubSegmentCode": "",
				"OfferSeqNumber": "",
				"ReportBreak": "",
				"CatalogIDSlidingScaleID": "",
				"OfferTrackingCode": "",
				"OfferTrackingCount": "",
				"PublicationNumber": "",
				"AdNumber": "",
				"FormCode": "",
				"TextID": "",
				"OnSaleMailDate": "",
				"ActualCircMailQuantity": "",
				"MailJobNumber": "",
				"MailNumber": "",
				"TotalMailQuantity": "",
				"MailingClass": "",
				"PullDate": "",
				"Status": "None",
				"StatusText": ""
			};
			var array = [];
			array.push(obj);
			var trackingList = new JSONModel(array);
			oView.setModel(trackingList, "trackingList");
			// Message Model
			var e = new JSONModel;
			oView.setModel(e, "oMsgModel");
			// Clear Model
			var cObj = {
				"SaveButtonEnable": false,
				"SalesOrg": ""
			};
			var c = new JSONModel(cObj);
			oView.setModel(c, "clearModel");
			//set models for Mass Changes Smart Filter Bar & Smart Table
			oView.byId("MCsmartFilterBar").setModel(this.getOwnerComponent().getModel("ReportModel"));
			oView.byId("MCsmartFilterBar").setEntitySet("ZSD_TRACKING_REPORT_CON");
			oView.byId("TrackMassDownloadSmartTab").setModel(this.getOwnerComponent().getModel("ReportModel"));
			oView.byId("TrackMassDownloadSmartTab").setEntitySet("ZSD_TRACKING_REPORT_CON");
			
			var status = new JSONModel();
			var list = {
				"Success":	0,
				"Warnings":	0,
				"Errors": 0
			};
			status.setData([list]);
			oView.setModel(status, "Status");
			
			oSemanticPage.setShowFooter(false);
			//get SalesOrg value help 
			this._getSalesOrgValueHelp();
			//get Default Values
			this._getDefaults();
		},
		// autoResizeColumn: function (oEvt) {
		// },
		//get Default Sales Org value
		_getDefaults: function () {
			var that = this;
			var model = this.getOwnerComponent().getModel("defaultValuesModel");
			model.read("/Defaultparameters('FIN')", {
				method: "GET",
				success: function (response) {
					that.getView().getModel("clearModel").setProperty("/SalesOrg", response.SalesOrganization); //
					that.getView().byId("MCsmartFilterBar").getControlByKey("SalesOrganization").setValue(response.SalesOrganization);
				},
				error: function (oError) {
					var oXmlData = oError.response.body;
					var oXMLModel = new sap.ui.model.xml.XMLModel();
					oXMLModel.setXML(oXmlData);
					var otext = oXMLModel.getProperty("/message");
					sap.m.MessageBox.show(otext, sap.m.MessageBox.Icon.ERROR);
				}
			});
		},
		//oData call for SalesOrg value help
		_getSalesOrgValueHelp: function () {
			sPath = "/SalesOrgHelpSet";
			// var sFilters = [];
			var that = this;
			var oSuccess = function (oData) {
				//Sales Org. JSON data set
				sap.ui.core.BusyIndicator.hide();
				var salesOrgF4Model = new JSONModel(oData.results);
				that.getView().setModel(salesOrgF4Model, "salesOrgCollection");
			};
			var oError = function (error) {
				sap.ui.core.BusyIndicator.hide();
				// that.ErrorHandling(error);
			};
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel().read(sPath, {
				success: oSuccess,
				error: oError
					// filters: sFilters
			});
		},
		//on Sales Org. Value help click
		handleValueHelpSalesOrg: function (oEvt) {
			// create value help dialog
			if (!this._valueHelpDialogSalesOrg) {
				this._valueHelpDialogSalesOrg = sap.ui.xmlfragment(
					"com.itell.bradford.ZTRACKING_EXCEL_UPLD.fragments.SalesOrgF4Help",
					this
				);
				this.getView().addDependent(this._valueHelpDialogSalesOrg);
			}
			this._valueHelpDialogSalesOrg.open();
		},
		//Handle Sales Org. F4 Help functionality Search
		_handleSalesOrgValueHelpSearch: function (oEvt) {
			var sValue = oEvt.getParameters().value;
			var oFilter = new sap.ui.model.Filter(
				"Vkorg",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvt.getSource().getBinding("items").filter([oFilter]);
		},
		//Handle Sales Org. F4 Help functionality Close
		_handleSalesOrgValueHelpClose: function (oEvt) {
			oEvt.getSource().getBinding("items").filter();
		},
		//Handle Sales Org. F4 Help functionality Confirm
		_handleSalesOrgValueHelpConfirm: function (oEvt) {
			var oSelectedProduct = oEvt.getParameter("selectedItem");
			var sInputValue = oSelectedProduct.getTitle();
			this.getView().getModel("clearModel").setProperty("/SalesOrg", sInputValue);
			this.getView().byId("inpSalesOrg").setValueState("None");
			this.getView().byId("inpSalesOrg").setValueStateText("");
			this.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
			oEvt.getSource().getBinding("items").filter();
		},
		//Handles Sales Org. Input change manually
		handleSalesOrgChange: function (oEvt) {
			var oValue = oEvt.getParameters().newValue;
			var oInput = oEvt.getSource();
			var salesOrgs = [], that = this;
			if (oValue.trim() === "" || oValue === undefined) {
				oInput.setValueState("Error");
				oInput.setValueStateText(i18n.getText("invalidEntry"));
			} else {
				var salesOrgData = that.getView().getModel("salesOrgCollection").getData();
				salesOrgs = $.grep(salesOrgData, function (ele) {
					if (ele.Vkorg === oValue) {
						return ele;
					}
				});
				if (salesOrgs.length === 0) {
					oInput.setValueState("Error");
					oInput.setValueStateText(i18n.getText("invalidEntry"));
				} else {
					oInput.setValueState("None");
					oInput.setValueStateText("");
					that.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
				}
			}
		},
		// Called when user clicks on the Segmented button.
		onSegmentedButtonChange: function (e) {
			var navCon = this.byId("navCon");
			if (e.getParameter("item").getKey() === "MassUpload") {
				navCon.to(this.byId("UploadPage"), "Slide");
				oSemanticPage.setShowFooter(true);
			} else {
				navCon.to(this.byId("MassDownloadPage"), "Slide");
				oSemanticPage.setShowFooter(false);
			}
		},
		//triggers when user clicks on template download in Mass Upload Tab
		onExcelTemplateDownload: function () {
			var oDataModel = this.getOwnerComponent().getModel();
			var sServiceURL = oDataModel.sServiceUrl;
			var sFileType = "XLSX";
			var sLanguage = "EN";
			var sDownloadURL = sServiceURL + "/FileTemplateDownloadSet(IsTemplate=1,Mimetype='" + sFileType + "')/$value?$filter=Language eq '" +
				sLanguage + "' and FileName eq 'Tracking_Maintenance_Template.";
			sDownloadURL = sDownloadURL + sFileType + "'";
			window.open(sDownloadURL);
		},
		//on Excel upload file Clear in mass upload screen
		onUploadFileClear: function (oEvt) {
			var oFileUploader = this.byId("Uploader");
			var that = this;
			oFileUploader.setValue("");
			//Clear Message Model Data
			var msgs = [];
			that.getView().getModel("oMsgModel").setData(msgs);
			that.getView().getModel("oMsgModel").refresh();
			var obj = {
				"TrackingCode": "",
				"Material": "",
				"PanelArea": "",
				"MarketArea": "",
				"PanelCode": "",
				"TrackingDescription": "",
				"PromoID": "",
				"PlanID": "",
				"AgedTrackingCode": "",
				"TemplateLineNumber": "",
				"MergeLineNumber": "",
				"SegmentCode": "",
				"SubSegmentCode": "",
				"OfferSeqNumber": "",
				"ReportBreak": "",
				"CatalogID": "",
				"OfferTrackingCode": "",
				"OfferTrackingCount": "",
				"PublicationNumber": "",
				"AdNumber": "",
				"FormCode": "",
				"TextID": "",
				"OnSaleMailDate": "",
				"ActualCircMailQuantity": "",
				"MailJobNumber": "",
				"MailNumber": "",
				"TotalMailQuantity": "",
				"MailingClass": "",
				"PullDate": "",
				"CTN": "",
				//Commented By Moulika 8/3/2022
				// "GuranteeCutoffDate": null,
				// "GuranteeDate": null,
				"Status": "None",
				"StatusText": ""
			};
			var array = [];
			array.push(obj);
			that.getView().getModel("trackingList").setData(array);
			that.getView().getModel("trackingList").refresh();
			that.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
			oSemanticPage.setShowFooter(false);
		},
		//on Excel upload in mass upload screen
		onUpload: function (oEvt) {
			//This event fired when user select a file to upload.
			// this._addTokenToUploader();
			var oFileUploader = this.byId("Uploader");
			if (oFileUploader.getValue()) {
				// this._hideMessageStrip();
				// oFileUploader.upload();
				// this.excelData = {};
				var domRef = oFileUploader.getFocusDomRef();
				var file = domRef.files[0];
				var that = this;
				this.fileName = file.name;
				this.fileType = file.type;
				var reader = new FileReader();
				reader.onload = function (e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function (sheet, i) {
						// var duplicateData = [];
						// Here is your object for every sheet in workbook
						var excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
						Exdata = excelData;
						// Exdata = JSON.parse(JSON.stringify(Exdata).replace(/ +/g, ""));
						// Exdata = JSON.parse(JSON.stringify(Exdata).replace(/\s(?=\w+":)/g, ""));
						$.each(Exdata, function (i, object) {
							Object.keys(object).forEach(function (key) {
								var newKey = key.replace(/\s+/g, '');
								if (object[key] && typeof object[key] === 'object') {
									// replaceKeys(object[key]);
								}
								if (key !== newKey) {
									object[newKey] = object[key];
									delete object[key];
								}
							});
						});
						// var result = Exdata.filter((e, i) => {
						// 	return Exdata.findIndex((x) => {
						// 		return x.SalesOrganization == e.SalesOrganization && x.TrackingCode == e.TrackingCode && x.PanelArea == e.PanelArea &&
						// 			x.Material ==
						// 			e.Material;
						// 	}) == i;
						// });
						var TrackingData = Exdata;
						for (var k = 0; k < TrackingData.length; k++) {
							TrackingData[k].SalesOrganization = "";
							TrackingData[k].MaterialDescription = "";
							TrackingData[k].RecordStatus = "New";
							if(TrackingData[k].PanelCode !== "" && TrackingData[k].PanelCode !== undefined){
							TrackingData[k].PanelCode = TrackingData[k].PanelCode.toLocaleUpperCase();
							}
							if(TrackingData[k].PanelArea !== "" && TrackingData[k].PanelArea !== undefined){
							TrackingData[k].PanelArea = TrackingData[k].PanelArea.toLocaleUpperCase();
							}
							if(TrackingData[k].TrackingCode !== "" && TrackingData[k].TrackingCode !== undefined){
								TrackingData[k].TrackingCode = TrackingData[k].TrackingCode.toLocaleUpperCase();
							}
							delete TrackingData[k].Message;
							delete TrackingData[k].MessageStatus;
							delete TrackingData[k].PullDate;
						}
						that.getView().getModel("trackingList").setData(TrackingData);
						that.getView().getModel("trackingList").refresh(true);
						// oTable.attachColumnResize(function (oEvent) {
						// 	//get position of resized column and adjust column with same position in lower table
						// 	var aColumns = oTable.getColumns();
						// 	var eventId = _.trimStart(oEvent.getParameters().column.sId, '__column');
						// 	var lastIndex = _.trimStart(_.nth(aColumns, -1).sId, '__column')
						// 	var nmbrOfColumns = oTable.getColumns().length;
						// 	var positionId = nmbrOfColumns - (lastIndex - eventId) - 1;
						// 	var oSecondTable = this.getView().byId("generatedTableView").getContent()[0].getContent()[1];
						// 	var aSecondColumns = oSecondTable.getColumns();
						// 	aSecondColumns[positionId].setWidth(oEvent.getParameters().width);
						// }.bind(this));
						oSemanticPage.setShowFooter(true);
					});
				};
				reader.readAsBinaryString(file);
				// this._oPage.setBusy(true);
				//Clear Message Model Data
				var msgs = [];
				that.getView().getModel("oMsgModel").setData(msgs);
				that.getView().getModel("oMsgModel").refresh();
			}
		},
		//triggers when user clicks on Export to Excel in Mass Download Tab
		onMassExcelDownload: function (oEvt) {
			oEvt.getParameters("workbook").exportSettings.fileName = i18n.getText("title");
		},
		//triggers when user clicks on Export to Excel in Mass Upload Tab
		onMassUploadExcelExport: function (oEvt) {
			var currentFileName = this.getView().byId("Uploader").getValue().split(".")[0];
			oEvt.getParameters("workbook").exportSettings.fileName = currentFileName + " " + i18n.getText("Log");
			//update date fields before download
			var oDataDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "MM-dd-yyyy"
			});
			//Commented By Moulika 8/3/2022
			// for (var i = 0; i < oEvt.getParameters("workbook").exportSettings.dataSource.data.length; i++) {
			// 	oEvt.getParameters("workbook").exportSettings.dataSource.data[i].GuranteeCutoffDate = oDataDateFormat.format(oEvt.getParameters(
			// 		"workbook").exportSettings.dataSource.data[i].GuranteeCutoffDate);
			// 	oEvt.getParameters("workbook").exportSettings.dataSource.data[i].GuranteeDate = oDataDateFormat.format(oEvt.getParameters(
			// 		"workbook").exportSettings.dataSource.data[i].GuranteeDate);
			// }
		},
		onRowSelection: function (oEvt) {
			var that = this;
			if (oEvt.getParameters().rowContext != null) {
				var selectedRow = oEvt.getParameters().rowContext.getObject();
				if (selectedRow.TrackingCode !== "") {
					that.getView().byId("DevareBtn").setEnabled(true);
				} else {
					that.getView().byId("DeleteBtn").setEnabled(false);
				}
			}
			// that.getView().getModel("filterBarModel").setProperty("/buttonFlag", true);
		},
		//on Delete in mass upload screen
		onDelete: function (oEvt) {
			var that = this;
			var PanelUITable = that.getView().byId("TrackingUITab");
			oMsgBox.show(i18n.getText("DeleteConfirm"), {
				icon: oMsgBox.Icon.WARNING,
				title: i18n.getText("Delete"),
				actions: [oMsgBox.Action.YES, oMsgBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === oMsgBox.Action.YES) {
						// Fetch deleted item index
						var index = PanelUITable.getSelectedIndex();
						//delete item
						that.getView().getModel("trackingList").getData().splice(index, 1);
						that.getView().getModel("trackingList").refresh();
						if (that.getView().getModel("trackingList").getData().length === 0) {
							that.getView().byId("DeleteBtn").setEnabled(false);
							that.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
						}
					}
				}
			});
		},
		onCheck: function () {
			// payload
			//validate Sales Orgder value
			var SalesOrgInput = this.getView().byId("inpSalesOrg");
			if (SalesOrgInput.getValue() === "" || SalesOrgInput.getValue() === undefined) {
				this.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
				SalesOrgInput.setValueState("Error");
				SalesOrgInput.setValueStateText(i18n.getText("MandatoryField"));
				return;
			}
			var oDataDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyyMMdd"
			});
			// var oUIDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
			// 	pattern: "MM/dd/yyyy"
			// });
			var oEntry = {};
			var oItem = [];
			var oView = this.getView();
			oItem = this.getView().getModel("trackingList").getData();
			//validate items length
			if (oItem.length === 0) {
				return;
			} else {
				//do Item Key field annoatation
				// this._TrackValidations();
				// if (!msgFlag) {
				// 	this.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
				// 	return;
				// }
				for (var i = 0; i < oItem.length; i++) {
					// //modify date Pull Date
					// if (oItem[i].PullDate !== "") {
					// 	oItem[i].PullDate = oDataDateFormat.format(new Date(oItem[i].PullDate));
					// } else {
					// 	oItem[i].PullDate = "00000000";
					// }
					// //modify date OnSaleMailDate
					if (oItem[i].OnSaleMailDate !== "") {
						oItem[i].OnSaleMailDate = oDataDateFormat.format(new Date(oItem[i].OnSaleMailDate));
					} else {
						oItem[i].OnSaleMailDate = "00000000";
					}
					//add Sales org value
					oItem[i].SalesOrganization = SalesOrgInput.getValue();
					// oItem[i].GuranteeCutoffDate = new Date(oItem[i].GuranteeCutoffDate);
					// oItem[i].GuranteeDate = new Date(oItem[i].GuranteeDate);
					//detelet Status field while sending it to OData
					delete oItem[i].Status;
					delete oItem[i].StatusText;
				}
			}
			oMsgToast.show(i18n.getText("deleteDuplicateMsg"));
			oEntry = {
				"ButtonFlag": "C",
				"Trackingcode": "",
				"TrackingMaintNav": oItem
			};
			//oData call to check Panel
			sPath = "/TrackMaintHeadSet";
			var that = this;
			var oSuccess = function (oData) {
				sap.ui.core.BusyIndicator.hide();
				var results = oData.TrackingMaintNav.results;
				var msgs = [],
					UIData = [],
					ErrorMsgs = 0,
					oMessageTemplateWarning = {};
				for (var i = 0; i < results.length; i++) {
					var obj = {};
					// //Generating Model for Message Pop-over
					// if (results[i].Message.Type === "E") {
					// 	var oMessageTemplateError = {
					// 		"type": "Error",
					// 		"title": results[i].Message.MessageV1,
					// 		"subtitle": results[i].Message.Message,
					// 		"description": results[i].Message.Message
					// 	};
					// 	msgs.push(oMessageTemplateError);
					// 	ErrorMsgs.push(oMessageTemplateError);
					// 	//fill status to highlight record level
					// 	obj.Status = "Error";
					// 	// obj.StatusText = results[i].Message.Msg;
					// } else if (results[i].Message.Type === "S") {
					// 	//fill status to highlight record level
					// 	obj.Status = "Success";
					// 	// obj.StatusText = "Ready to Save";
					// } else if (results[i].Message.Type === "W") {
					// 	oMessageTemplateWarning = {};
					// 	oMessageTemplateWarning = {
					// 		"type": "Warning",
					// 		"title": results[i].Message.MessageV1,
					// 		"subtitle": results[i].Message.Message,
					// 		"description": results[i].Message.Message
					// 	};
					// 	msgs.push(oMessageTemplateWarning);
					// 	//fill status to highlight record level
					// 	obj.Status = "Warning";
					// } else {
					// 	//fill status to highlight record level
					// 	obj.Status = "None";
					// 	// obj.StatusText = "";
					// }
					obj.TrackingCode = results[i].TrackingCode;
					obj.TrackingDescription = results[i].TrackingDescription;
					obj.MarketArea = results[i].MarketArea;
					obj.RecordStatus = results[i].RecordStatus;
					obj.SalesOrganization = results[i].SalesOrganization;
					obj.PanelCode = results[i].PanelCode;
					obj.PanelArea = results[i].PanelArea;
					obj.PanelDescription = results[i].PanelDescription;
					obj.Material = results[i].Material;
					obj.MaterialDescription = results[i].MaterialDescription;
					obj.PromoID = results[i].PromoID;
					obj.PlanID = results[i].PlanID;
					obj.AgedTrackingCode = results[i].AgedTrackingCode;
					obj.TemplateLineNumber = results[i].TemplateLineNumber;
					obj.MergeLineNumber = results[i].MergeLineNumber;
					obj.SegmentCode = results[i].SegmentCode;
					obj.SubSegmentCode = results[i].SubSegmentCode;
					obj.OfferSeqNumber = results[i].OfferSeqNumber;
					obj.ReportBreak = results[i].ReportBreak;
					obj.CatalogIDSlidingScaleID = results[i].CatalogIDSlidingScaleID;
					obj.ActualCircMailQuantity = results[i].ActualCircMailQuantity;
					// obj.MailJobNumber = results[i].MailJobNumber;
					// obj.MailNumber = results[i].MailNumber;
					// obj.TotalMailQuantity = results[i].TotalMailQuantity;
					// obj.MailingClass = results[i].MailingClass;
					obj.CTN = results[i].CTN;
					obj.UIMessage = results[i].UIMessage;
					obj.UIMessageStatus = results[i].UIMessageStatus;
					if (results[i].OnSaleMailDate !== "00000000") {
						obj.OnSaleMailDate = oFormatter.getDateFormat(results[i].OnSaleMailDate);
					} else {
						obj.OnSaleMailDate = "";
					}
					// if (results[i].PullDate !== "00000000") {
					// 	obj.PullDate = oFormatter.getDateFormat(results[i].PullDate);
					// } else {
					// 	obj.PullDate = "";
					// }
					
					if (obj.UIMessageStatus === "Error") {
						ErrorMsgs += 1;
					}
					UIData.push(obj);
				}
				
				//enable Save button
				if (ErrorMsgs > 0) {
					that.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
				} else {
					that.getView().getModel("clearModel").setProperty("/SaveButtonEnable", true);
				}
				//updating Panel List Smart table model
				var o = that.getView().getModel("trackingList");
				//sort data based on status field n put errror 1st
				UIData = UIData.sort(function (a, b) {
					if (a.UIMessageStatus < b.UIMessageStatus)
						return -1;
					if (a.UIMessageStatus > b.UIMessageStatus)
						return 1;
					return 0;
				});
				o.setData(UIData);
				o.refresh();
				
				//Counts for Status Popover
					var success = $.grep(oData.TrackingMaintNav.results,function(ele){
						if(ele.UIMessageStatus === "Success"){
							return ele;
						}
					});
					
					var warnings = $.grep(oData.TrackingMaintNav.results,function(ele){
						if(ele.UIMessageStatus === "Warning"){
							return ele;
						}
					});
					
					var errors = $.grep(oData.TrackingMaintNav.results,function(ele){
						if(ele.UIMessageStatus === "Error"){
							return ele;
						}
					});
					var obj = {
						"Success" : success.length,	
						"Warnings" : warnings.length,	
						"Errors" : errors.length
					};
					oView.getModel("Status").setData([obj]);
					oView.getModel("Status").refresh();
			};
			// oMsgBox.show(i18n.getText("PanelSuccess"), {
			// 	icon: oMsgBox.Icon.SUCCESS,
			// 	title: "Success",
			// 	actions: [oMsgBox.Action.OK],
			// 	onClose: function (oAction) {
			// 		if (oAction === oMsgBox.Action.OK) {
			// 			that.navToMain();
			// 		}
			// 	}
			// });
			var oError = function (error) {
				sap.ui.core.BusyIndicator.hide();
				// that.ErrorHandling(error);
			};
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel().create(sPath, oEntry, {
				success: oSuccess,
				error: oError
			});
		},
		//tracking validations
		_TrackValidations: function (oEvt) {
			var that = this;
			var Items = this.getView().getModel("trackingList").getData();
			var msgs = [],
				warnings = [];
			for (var i = 0; i < Items.length; i++) {
				var oMessageTemplateError = {};
				// if (Items[i].PanelArea === undefined || Items[i].PanelArea === "") {
				// 	oMessageTemplateError = {};
				// 	oMessageTemplateError = {
				// 		"type": "Error",
				// 		"title": i18n.getText("enterPanelArea"),
				// 		"subtitle": i18n.getText("enterPanelArea") + " for Tracking Code " + Items[i].TrackingCode + ".",
				// 		"description": i18n.getText("enterPanelArea") + " for Tracking Code " + Items[i].TrackingCode + "."
				// 	};
				// 	msgs.push(oMessageTemplateError);
				// 	that.getView().getModel("trackingList").setProperty("/" + i + "/Status", "Error");
				// }
				if (Items[i].TrackingCode === undefined || Items[i].TrackingCode === "") {
					oMessageTemplateError = {};
					oMessageTemplateError = {
						"type": "Error",
						"title": i18n.getText("enterTrackingCode")
					};
					msgs.push(oMessageTemplateError);
					Items[i].UIMessage = oMessageTemplateError.title;
					Items[i].UIMessageStatus = oMessageTemplateError.type;
				}
				// if (Items[i].TrackingDescription === undefined || Items[i].TrackingDescription === "") {
				// 	oMessageTemplateError = {};
				// 	oMessageTemplateError = {
				// 		"type": "Error",
				// 		"title": i18n.getText("enterTrackDes"),
				// 		"subtitle": i18n.getText("enterTrackDes") + " for Tracking Code " + Items[i].TrackingCode + ".",
				// 		"description": i18n.getText("enterTrackDes") + " for Tracking Code " + Items[i].TrackingCode + "."
				// 	};
				// 	msgs.push(oMessageTemplateError);
				// 	that.getView().getModel("trackingList").setProperty("/" + i + "/Status", "Error");
				// }
				if (Items[i].Material === undefined || Items[i].Material === "") {
					oMessageTemplateError = {};
					oMessageTemplateError = {
						"type": "Error",
						"title": i18n.getText("enterMaterial"),
						"subtitle": i18n.getText("enterMaterial") + " for Tracking Code " + Items[i].TrackingCode + ".",
						"description": i18n.getText("enterMaterial") + " for Tracking Code " + Items[i].TrackingCode + "."
					};
					msgs.push(oMessageTemplateError);
					Items[i].UIMessage = oMessageTemplateError.description;
					Items[i].UIMessageStatus = oMessageTemplateError.type;
				}
				// if (Items[i].PromoID === undefined || Items[i].PromoID === "") {
				// 	oMessageTemplateError = {};
				// 	oMessageTemplateError = {
				// 		"type": "Error",
				// 		"title": i18n.getText("enterPromoID"),
				// 		"subtitle": i18n.getText("enterPromoID") + " for Tracking Code " + Items[i].TrackingCode + ".",
				// 		"description": i18n.getText("enterPromoID") + " for Tracking Code " + Items[i].TrackingCode + "."
				// 	};
				// 	msgs.push(oMessageTemplateError);
				// 	that.getView().getModel("trackingList").setProperty("/" + i + "/Status", "Error");
				// }
				//Pull Date
				if (Items[i].PullDate === undefined || Items[i].PullDate === "") {
					that.getView().getModel("trackingList").setProperty("/" + i + "/PullDate", "");
				}
				//Mail Date
				if (Items[i].OnSaleMailDate === undefined || Items[i].OnSaleMailDate === "") {
					that.getView().getModel("trackingList").setProperty("/" + i + "/OnSaleMailDate", "");
				}
				//Commented By Moulika 8/3/2022
				// //Gurantee Date 
				// if (Items[i].GuranteeDate === undefined || Items[i].GuranteeDate === "") {
				// 	that.getView().getModel("trackingList").setProperty("/" + i + "/GuranteeDate", null);
				// }
				// // Gurantee Cutoff Date
				// if (Items[i].GuranteeCutoffDate === undefined || Items[i].GuranteeCutoffDate === "") {
				// 	that.getView().getModel("trackingList").setProperty("/" + i + "/GuranteeCutoffDate", null);
				// }
			}
			if (msgs.length > 0) {
				msgFlag = false;
				//add wornings
				if (warnings.length > 0) {
					msgs.concat(warnings);
				}
				//updating Messgae model
				var o = that.getView().getModel("oMsgModel");
				o.setData(msgs);
				o.refresh();
			} else {
				//add wornings
				if (warnings.length > 0) {
					// msgs.concat(warnings);
					//updating Messgae model
					var o = that.getView().getModel("oMsgModel");
					o.setData(warnings);
					o.refresh();
				}
				msgFlag = true;
			}
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
		handleMessagePopoverPress: function (e) {
			if (!this.oMP) {
				this.createMessagePopover();
			}
			this.oMP.toggle(e.getSource());
		},
		createMessagePopover: function () {
			var e = this;
			this.oMP = new oMsgPop({
				items: {
					path: "oMsgModel>/",
					template: new oMsgItem({
						title: "{oMsgModel>title}",
						subtitle: "{oMsgModel>subtitle}",
						description: "{oMsgModel>description}",
						type: "{oMsgModel>type}",
					})
				},
				groupItems: true
			});
			this.getView().byId("popover").addDependent(this.oMP);
		},
		//triggers whn click on Save
		onSave: function () {
			var oEntry = {};
			var oItem = [], that = this;
			oItem = that.getView().getModel("trackingList").getData();
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyyMMdd"
			});
			//validate items length
			if (oItem.length === 0) {
				return;
			} else {
				for (var i = 0; i < oItem.length; i++) {
					delete oItem[i].Status;
					delete oItem[i].StatusText;
					//modify Pull date
					if (oItem[i].PullDate !== "") {
						oItem[i].PullDate = oDateFormat.format(new Date(oItem[i].PullDate));
					} else {
						oItem[i].PullDate = "00000000";
					}
					//Modify Mail Date
					if (oItem[i].OnSaleMailDate !== "") {
						oItem[i].OnSaleMailDate = oDateFormat.format(new Date(oItem[i].OnSaleMailDate));
					} else {
						oItem[i].OnSaleMailDate = "00000000";
					}
				}
			}
			oEntry = {
				"Trackingcode": "",
				"ButtonFlag": "S",
				"TrackingMaintNav": oItem
			};
			//oData call to check Panel
			sPath = "/TrackMaintHeadSet";
			var that = this;
			var msgs = [];
			var oSuccess = function (oData) {
				sap.ui.core.BusyIndicator.hide();
				var oMessageTemplateSuccess = {
					"type": "Success",
					"title": i18n.getText("saveSuccess"),
				};
				msgs.push(oMessageTemplateSuccess);
				//updating Messgae model
				that.getView().getModel("oMsgModel").setData(msgs);
				that.getView().getModel("oMsgModel").refresh();
				that.getView().getModel("clearModel").setProperty("/SaveButtonEnable", false);
				//set success status for each record
				for (var i = 0; i < that.getView().getModel("trackingList").getData().length; i++) {
					// that.getView().getModel("trackingList").setProperty("/" + i + "/Status", "Success");
					// var date;
					//modify pull Date
					// if (that.getView().getModel("trackingList").getData()[i].PullDate === "00000000") {
					// 	that.getView().getModel("trackingList").setProperty("/" + i + "/PullDate", "");
					// } else {
					// 	date = that.getView().getModel("trackingList").getData()[i].PullDate;
					// 	that.getView().getModel("trackingList").setProperty("/" + i + "/PullDate", oFormatter.getDateFormat(date));
					// }
					// //modify mail date
					// if (that.getView().getModel("trackingList").getData()[i].OnSaleMailDate === "00000000") {
					// 	that.getView().getModel("trackingList").setProperty("/" + i + "/OnSaleMailDate", "");
					// } else {
					// 	date = that.getView().getModel("trackingList").getData()[i].OnSaleMailDate;
					// 	that.getView().getModel("trackingList").setProperty("/" + i + "/OnSaleMailDate", oFormatter.getDateFormat(date));
					// }
					that.getView().getModel("trackingList").setProperty("/" + i + "/UIMessage", i18n.getText("saveSuccess"));
				}
			};
			var oError = function (error) {
				sap.ui.core.BusyIndicator.hide();
				// that.ErrorHandling(error);
			};
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel().create(sPath, oEntry, {
				success: oSuccess,
				error: oError
			});
		},
		
		/**
		 * Displays the Status counts in a popover
		 * @param {Event} Button press event.
		 * @private
		 */
		onStatusCount: function (oEvt){
			var oButton = oEvt.getSource(),
				oView = this.getView(),
				oModel = this.getView().getModel("Status");
			// create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "com.itell.bradford.ZTRACKING_EXCEL_UPLD.fragments.StatusPopover",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					// oPopover.bindElement("Status>/");
					return oPopover;
				});
			}
			this._pPopover.then(function(oPopover) {
				oPopover.openBy(oButton);
			});
		},
		
		handleOkPress: function(){
			this.byId("myPopover").close();
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.itell.bradford.ZTRACKING_EXCEL_UPLD.view.Upload
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.itell.bradford.ZTRACKING_EXCEL_UPLD.view.Upload
		 */
		//	onAfterRendering: function() {
		//
		//	},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.itell.bradford.ZTRACKING_EXCEL_UPLD.view.Upload
		 */
		//	onExit: function() {
		//
		//	}
	});
});