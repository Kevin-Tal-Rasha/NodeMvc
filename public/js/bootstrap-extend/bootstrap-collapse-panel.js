jQuery.fn.extend({
    //bootstrap collapse panel
    collapsePanel: function (command, list, curIndex) {
        panelId = $(this).attr("id");
        var appendMode = false;
        if (typeof (command) == "string") {
            switch (command) {
                case "title":
                    if (list == void 0)
                        return $("[id^='" + $(this).attr("id") + "_bootstrap_collapse_panel']").find(".in").prev(".panel-heading").find(".panel-title").html();
                    else {
                        $("[id^='" + $(this).attr("id") + "_bootstrap_collapse_panel']").find(".in").prev(".panel-heading").find(".panel-title").html(list);
                        list = void 0;
                    }
                    break;
                case "titles":
                    var titles = [];
                    $("[id^='" + $(this).attr("id") + "_bootstrap_collapse_panel']").find(".panel-title").each(function (index) {
                        titles.push($(this).html());
                    });
                    return titles;
                    break;
                case "length":
                    return $("[id^='" + $(this).attr("id") + "_bootstrap_collapse_body']").length;
                    break;
                case "append":
                    appendMode = true;
                    break;
                case "remove":
                    if (list != void 0)
                        $(this).find("div.panel").eq(list).remove();
                    return;
                    break;
                case "click-btn":
                    if (list != void 0)
                        $(this).find(".panel-btn").eq(list).click();
                    return;
                    break;
            }
        }
        else if (typeof (command) == "number") {
            //set collapse title while the first parameter is number
            curIndex = command;
            list = void 0;

            var btn = $("[id^='" + $(this).attr("id") + "_bootstrap_collapse_panel']").find("[name='btn_collapse']").eq(curIndex);
            if (btn.length) btn.click();
        }
        else {
            curIndex = list;
            list = command;
        }

        var getCollapsePanelItemsHtml = function (panelId) {
            var htmlItem = "";

            if (curIndex == void 0) curIndex = 0;
            var length = $("[id^='" + panelId + "_bootstrap_collapse_body']").length;
            for (var i = 0; i < list.length; i++) {
                if (list[i].css == void 0) list[i].css = "panel-default";

                var btnHtml = "";
                if (list[i].btnHtml == void 0)
                    list[i].btnHtml = "&nbsp;";
                if (list[i].btnFunc != void 0)
                    btnHtml = "<a class='btn btn-sm panel-btn' style='float:right;position:relative;top:-4px' onclick=" + list[i].btnFunc + ">" + list[i].btnHtml + "</a>";

                htmlItem += "<div class='panel " + list[i].css + "'><div class='panel-heading'>";
                htmlItem += "<a name='btn_collapse' style='color: black;text-decoration:none' data-toggle='collapse' data-parent='#" + panelId + "_bootstrap_collapse_panel' href='#" + panelId + "_bootstrap_collapse_body" + (length + i) + "'>";
                htmlItem += "<div class='panel-title' style='display:inline'>" + list[i].title + "</div></a>" + btnHtml + "</div>";
                if (!appendMode && curIndex == i)
                    htmlItem += "<div id='" + panelId + "_bootstrap_collapse_body" + (length + i) + "' class='panel-collapse in'>";
                else
                    htmlItem += "<div id='" + panelId + "_bootstrap_collapse_body" + (length + i) + "' class='panel-collapse collapse'>";
                htmlItem += "<div class='panel-body'>" + list[i].content + "</div></div></div>";
            }

            return htmlItem;
        }
        if (list != void 0) {
            if (appendMode && $("[id^='" + panelId + "_bootstrap_collapse_panel']").length) {
                $("[id^='" + panelId + "_bootstrap_collapse_panel']").append(getCollapsePanelItemsHtml(panelId));
            }
            else {
                //create new panel
                var htmlPanel = "<div class='panel-group' id='" + panelId + "_bootstrap_collapse_panel'>";
                htmlPanel += getCollapsePanelItemsHtml(panelId);
                htmlPanel += "</div>";
                $(this).html(htmlPanel);
            }
        }
    }
});