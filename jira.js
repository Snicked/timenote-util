// ==UserScript==
// @name         JADDER - Jira Time Tracker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.atlassian.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var hashString = window.location.hash;

    if(hashString && hashString.indexOf("#buuk_") == 0) {
        var taskList = hashString.substring(6);
        var splittedList = taskList.split(";")
        splittedList.forEach(el => {
           var entry = el.split("::");
           var ticket = entry[0];
           var time = entry[1];
           if(ticket && ticket.match(/\d+$/g)){
                console.log(ticket, time);
                var payLoad = {
                    "timeSpentSeconds" : 3600 * time,
                };
                jQuery.ajax({
                    async: false,
                    type: "POST",
                    url: "/rest/api/2/issue/"+ticket+"/worklog",
                    data: JSON.stringify(payLoad),
                    success: function(e){console.log(ticket,time);},
                    contentType: "application/json",
                    dataType: "application/json"
                });
            }
        });
        window.close();
    }

    if(hashString && hashString.indexOf("#book_") == 0) {
        var taskList = hashString.substring(6);
        var splittedList = taskList.split(";")
        var $container = jQuery("<div id='jira-adder'><h2 style='margin-bottom:10px'>Add To Jira</h2></div>");
        splittedList.forEach(el => {
           var entry = el.split("::");
           var ticket = entry[0];
           var time = entry[1];
            if(ticket && ticket.match(/\d+$/g)){
                console.log(ticket, time);
                var $entry = jQuery("<div class='jira-entry' style='margin-bottom:5px'></div>");
                $entry.append("<input type='text' name='id' placeholder='Ticket' value='"+ticket+"'/>");
                $entry.append("<input type='text' name='comment' placeholder='Comment' value=''/>");
                $entry.append("<input type='text' name='time' placeholder='Time HH,mm' value='"+time+"'/>");
                $entry.append("<input type='submit' name='submit' value='Add'/>");

                $container.append($entry);
            }
        });



        $container.css({
            "position":"absolute",
            "padding":"5px",
            "top":"50%",
            "left":"50%",
            "width":"500px",
            "heigt" : "auto",
            "z-index": 10000,
            "background": "white",
            "transform": "translate(-50%, -50%)",
            "box-shadow" : "5px 5px 10px black"
        })

         $container.on("click", "[type='submit']", (event) => {

             var $entry = jQuery(event.currentTarget).parent();

             var ticket = $entry.find("[name='id']").val();
             var comment = $entry.find("[name='comment']").val();
             var time = $entry.find("[name='time']").val();

             var payLoad = {
                 "timeSpentSeconds" : 3600 * time,
             };

             if(comment) {
                payLoad.comment = comment;
             }

             jQuery.ajax({
                 async: false,
                 type: "POST",
                 url: "/rest/api/2/issue/"+ticket+"/worklog",
                 data: JSON.stringify(payLoad),
                 success: function(e){console.log(ticket,comment,time);},
                 contentType: "application/json",
                 dataType: "application/json"
             });

             $entry.remove();

             if($container.find(".jira-entry").length == 0) {
               $container.remove();
               window.location.hash="";
             }
         });
        jQuery("body").append($container);
    }
})();
