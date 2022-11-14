// ==UserScript==
// @name         TimenoteUtil
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       Snicked
// @match        https://my.timenote.de/WebApplication/timesheet
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

var timeInputField = "[tabindex=1]";
var addEntryButton = "#MainContent_MainContent_AspxMenuTimeSheetEntries_DXI0_T";
var commentArea= "[tabindex=8]";
var ASPxTimeInput = 'MainContent_MainContent_TimeSheetEntryPopupControl_ASPxPopupControlTimeSheetEntry_ASPxCallbackPanel_FormViewTimeSheetEntry_ASPxFormLayoutTimeSheetEntry_ASPxTimeEditDuration';
var ProjectDropDownField = "[id$=ASPxGridLookupProjects_I]";
var WorkTypeField = "[id$=ASPxFormLayoutTimeSheetEntry_ASPxComboBoxService_I]";
var ProjectsDropdown = "[id$=ASPxGridLookupProjects_DDD_gv_DXMainTable]";
var Headline = "[id$=ASPxPopupControlTimeSheetEntry_PWH-1T]";
var styles = ".dxeListBox_Metropolis div.dxlbd {    padding-top: 1px;    padding-bottom: 1px;    height: 380px !important;}";
var jiraUrl = "https://YOUR-JIRA-SUBDOMAIN.atlassian.net/jira/dashboards/last-visited#buuk_"
var ticketRegex = "(^[A-Z]+-\\d+).*"

var wait = function(time){
  var promise = $.Deferred();
  window.setTimeout(() => {promise.resolve()}, time);
  return promise;
};

// Mapping for Projects
var mapping = [
  { "key":"Smartedit", "project" : "Smart"},
  { "key":"SmartEdit", "project" : "Smart"},
  { "key":"LORD", "project" : "Checkout"},
  { "key":"Checkout", "project" : "Checkout"},
  { "key":"INTERN", "project" : "Internes"},
  { "key":"BAUFIX-", "project" : "1020" },
  { "key":"REMCS-", "project" : "194370" },
  { "key":"REMINT-", "project" : "194400ff"},
  { "key":"AK-", "project" : "194420"},
  { "key":"LEAN-", "project" : "LeanLB"},
  { "key":"IR-", "project" : "Intranet"},
  { "key":"Intranet", "project" : "Intranet"},
  { "key":"REMTG-", "project" : "194389"},
  { "key":"Deploy", "project" : "194378"}
]


var whenVisible = function(el){
  var promise = jQuery.Deferred();
  window.setInterval(() => {if(jQuery(el).is(":visible")) {
    window.setTimeout(() => {promise.resolve();},500);
  }}, 100);
  return promise;
};

var whenHidden= function(el){
  var promise = $.Deferred();
  window.setInterval(() => {if(!jQuery(el).is(":visible")) {
    window.setTimeout(() => {promise.resolve();},500);
  }}, 100);
  return promise;
};

var addEntry = function(comment, time) {
  jQuery(addEntryButton).click();
  var entryPromise = $.Deferred();
  whenVisible(timeInputField).then(() => {
    var timeArray = time.split(".");
    var hours = timeArray[0] >= 10 ? timeArray[0] : "0" + timeArray[0];
    var minutes = minutes == 0 ? "00" : timeArray[1] * 60;
    jQuery(Headline).text(comment);
    var timeString = hours + ":" + minutes + " h";
    jQuery(timeInputField).focus().val(timeString);
    wait(500).then(() => {ASPx.ELostFocus(ASPxTimeInput)});
    jQuery(commentArea).val(comment);

    var ticketId = getTicketId(comment);
    whenHidden(timeInputField).then(() => {
        if(ticketId) {
          var win = window.open(jiraUrl+ticketId+"::"+time);
        }
        window.setTimeout(() => entryPromise.resolve(), 2000);
    });
      
    var found = false;
    mapping.forEach((map)=>{
        jQuery(ProjectsDropdown).find('.dxgv').each((i,v) => {
            var selectText = jQuery(v).text()
            if(!found && comment.indexOf(map.key) >= 0 && selectText.indexOf(map.project) >= 0) {
                found=true;
                jQuery(v).click();
            }
          })
      });

  });
  return entryPromise;
}

var getTicketId = function(comment) {
  var match = comment.match(ticketRegex);
  return match ? match[1] : undefined;
}

var handleBlur = function(e) {
  var $elem = jQuery(e.currentTarget);
  var values = $elem.val().split("\n");

  addEntriesRecursive(values, 0);
}

var addEntriesRecursive = function(values, index) {
  var regex = /(.*)\s+(\d?\d.\d\d\n?$)/;
  var match =regex.exec(values[index]);
  if(match && match[1] && match[2]) {
      console.log(match[1] +" AND " +match[2])
    addEntry(match[1],match[2]).then(() => {
      if(index < values.length) {
        addEntriesRecursive(values, index+1);
      }
    });
    wait(300).then(() => {$elem.val("")});
  }
}

var createInputField = function() {
  var $field = jQuery("<textarea type='text' value='' ></textarea>");

  jQuery("body").append($field);

  $field.css({
    "position": "fixed",
    "bottom": "50px",
    "left": "50%",
    "width": "500px",
    "margin-left": "-250px",
    "box-shadow" : "0px 0px 50px black",
    "border": "1px solid gray",
    "height": "150px"
  });

  $field.on("blur", handleBlur)
}

var addStyles = function(){
    var css = styles,
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

    head.appendChild(style);

    style.type = 'text/css';
    if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
}

createInputField();
addStyles();

//  PROJECTID-1244 - Edited E-Mail-Templates      0.25

})();
