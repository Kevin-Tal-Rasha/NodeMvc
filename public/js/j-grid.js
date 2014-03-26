jQuery.fn.extend({
    loadJGrid: function (btn, triggerEvent) {
        var j_grid = $(this);
        //find refresh method
        var j_grid_refresh = j_grid.attr("j-grid-load");
        if (j_grid_refresh != void 0) {
            if (j_grid.attr("j-grid-ejs")) {
                //node.js mode 
                $.nodeAjax({
                    url: j_grid_refresh,
                    success: function (data) {
                        j_grid.render(j_grid.attr("j-grid-ejs"), data);
                        setJGridStyle(j_grid);

                        //reset refresh icon
                        if (btn)
                            setJGridButtonNormal(btn, "glyphicon-refresh");
                        if (triggerEvent || true)
                            j_grid.trigger("loaded");
                    },
                    errMsg: j_grid.attr("j-grid-title") || "" + "加载失败！"
                });
            }
            else {
                //execute refreshing in postback mode
                $.postBack(j_grid_refresh, function () {
                    //reset refresh icon
                    setJGridButtonNormal(btn, "glyphicon-refresh");
                    j_grid.trigger("loaded");
                });
            }
        }
    }
});

//delete button
var delete_button_click = function () {
    var btn = $(this);
    confirmBox("删除操作无法恢复，您确定要删除吗？", function () {
        //find gridview by current button
        var j_grid = getJGrid(btn);
        //find current row index
        var btn_index = j_grid.find("tr:has(td) .j-grid-delete").getIndex(btn);
        if (btn_index < 0) return;

        //get current item id
        var id = j_grid.find(".j-grid-id").eq(btn_index).html();

        //get j_grid title
        var j_grid_title = j_grid.attr("j-grid-title") != void 0 ? j_grid.attr("j-grid-title") : "";
        //find delete method
        if (j_grid.attr("j-grid-delete") != void 0) {
            //get ajax mode setting
            var ajax = true;
            if (j_grid.attr("j-grid-ajax") != void 0) {
                if (j_grid.attr("j-grid-ajax").toLowerCase() == "false")
                    ajax = false;
            }
            if (ajax) {
                setJGridButtonLoading(btn, "glyphicon-trash");

                if (j_grid.attr("j-grid-ejs")) {
                    //node.js mode
                    $.nodeAjax({
                        url: j_grid.attr("j-grid-delete"),
                        data: { id: id },
                        success: function (data) {
                            //remove html element after data deleted
                            btn.parents("tr").remove();
                            setJGridButtonNormal(btn, "glyphicon-trash");
                            j_grid.trigger("deleted");
                        },
                        errMsg: j_grid_title + "删除失败！"
                    });
                }
                else {
                    //execute deleting in ajax mode
                    $.ajaxPost({
                        url: window.document.location.href + "/" + j_grid.attr("j-grid-delete"),
                        data: { id: id },
                        success: function (data) {
                            if (j_grid.find("tr:has(td)").length == 1) {
                                //if this the last row of the j-grid, just hide j-grid, donnot remove the row
                                j_grid.addClass("hidden");
                            }
                            else {
                                //remove html element after data deleted
                                btn.parents("tr").remove();
                            }
                            setJGridButtonNormal(btn, "glyphicon-trash");
                            j_grid.trigger("deleted");
                        },
                        errMsg: j_grid_title + "删除失败！"
                    });
                }
            }
            else
                //execute deleting in postback mode
                $.postBack(j_grid.attr("j-grid-delete"), { id: id });
        }
    });
};
function resetDelBtn() {
    $(".j-grid-delete").each(function () {
        var btn = $(this);
        //traverse all delete buttons
        //set styles
        setJGridButtonStyle(btn, "删除", "glyphicon-trash")
        //bind click events
        btn.unbind("click");
        btn.click(delete_button_click);
    });
};

//edit button
var edit_button_click = function () {
    var btn = $(this);
    //find gridview by current button
    var j_grid = getJGrid(btn);
    //find current row index
    var btn_index = j_grid.find("tr:has(td) .j-grid-edit").getIndex(btn);
    if (btn_index < 0) return;

    //get current value object
    var cur_item = getJGridItem(j_grid, btn_index);
    //create editing dialog html
    var htmlDialog = createJGridDialogHtml(j_grid, "edit");
    //open editing dialog
    openJGridDialog(j_grid, btn, htmlDialog, "edit", cur_item, function (item) {
        //set edited values to current row after data edited
        setJGridItem(j_grid, btn_index, item);

        item.index = btn_index;
        j_grid.trigger("edited", item);
    });
};
function resetEditBtn() {
    $(".j-grid-edit").each(function () {
        var btn = $(this);
        //traverse all edit buttons
        //set styles
        setJGridButtonStyle(btn, "编辑", "glyphicon-pencil")
        //bind click events
        btn.unbind("click");
        btn.click(edit_button_click);
    });
}

$.LoadInUpdatePanel(function () {

    //refresh button
    $(".j-grid-load").each(function () {
        var btn = $(this);
        //traverse all refresh buttons
        //set styles
        setJGridButtonStyle(btn, "刷新", "glyphicon-refresh");
        //bind click events
        btn.unbind("click");
        btn.click(function () {
            //set loading icon
            setJGridButtonLoading(btn, "glyphicon-refresh");
            //find gridview
            var j_grid_binding = btn.attr("j-grid-binding");
            if (j_grid_binding != void 0) {
                var j_grid = $("table[id$='" + j_grid_binding + "']");
                if (j_grid.length) {
                    j_grid.loadJGrid(btn);
                }
            }
        });
    });

    //delete button
    resetDelBtn();

    //edit button
    resetEditBtn();

    //add button
    $(".j-grid-add").each(function () {
        var btn = $(this);
        //traverse all refresh buttons
        //set styles
        setJGridButtonStyle(btn, "新增", "glyphicon-plus")
        //bind click events
        btn.unbind("click");
        btn.click(function () {
            //find gridview
            var j_grid = getJGrid(btn);
            //open adding dialog
            openJGridDialog(j_grid, btn, createJGridDialogHtml(j_grid, "add"), "add", function (item) {
                //append new html row element after data added
                //find a template html row
                var new_index = j_grid.find("tr:has(td)").has("[j-grid-field]").length;
                var template_index = 0;
                if (new_index > 1 && new_index % 2 != 0)
                    template_index = 1;

                if (j_grid.find("tr:has(td)").length) {
                    //get template html
                    var htmlTr = j_grid.find("tr:has(td)").eq(template_index).outerHtml();
                    if (j_grid.find("tr:last").has("[j-grid-field]").length)
                        //append tr to normal tables
                        j_grid.append(htmlTr);
                    else
                        //append tr above the last paging tr while handling paging tables
                        j_grid.find("tr:last").closest("table").closest("tr").before(htmlTr);

                    //bind button event
                    j_grid.find("a.j-grid-edit").eq(new_index).click(edit_button_click);
                    j_grid.find("a.j-grid-delete").eq(new_index).click(delete_button_click);

                    //show the grid if which was hidden, and remove the empty temp row
                    if (j_grid.hasClass("hidden")) {
                        j_grid.find("tr:has(td)").first().remove();
                        j_grid.removeClass("hidden");
                    }
                }
                else if (j_grid.attr("j-grid-ejs")) {
                    //node.js mode
                    j_grid.loadJGrid(null, false);
                }

                //set values to the new row
                setJGridItem(j_grid, new_index, item);

                item.index = new_index;
                j_grid.trigger("added", item);
            });
        });
    });

});

//initialize button style
function setJGridButtonStyle(btn, title, icon) {
    btn.addClass("btn");
    var needTooltip = false;
    if (btn.html() != "") btn.html("&nbsp;" + btn.html());
    else needTooltip = true;
    btn.html("<span data-toggle='tooltip' title='" + title + "' class='glyphicon " + icon + "'></span>" + btn.html());
    if (needTooltip) btn.children().tooltip();
}
//set loading icon
function setJGridButtonLoading(btn, originalIcon) {
    btn.find("span").removeClass(originalIcon).addClass("glyphicon-loading");
}
//set original icon
function setJGridButtonNormal(btn, originalIcon) {
    btn.find("span").removeClass("glyphicon-loading").addClass(originalIcon);
}

//initialize editing control
function initJGridControl(j_grid_field, item, binddata_callback) {
    j_grid_field.children().each(function () {
        var editing_control = $(this);
        //no need to initialize if this is a j-db-child control
        //j-db-child control could be initialized when j-db-parent is changed
        if (editing_control.attr("j-db-parent") != void 0) return;

        if (editing_control.attr("j-extend-load") != void 0) {
            //initialize j-extend control
            eval(editing_control.attr("j-extend-load"))(editing_control);
        }

        //hide the row if editing control is hidden
        if (editing_control.attr("type") == "hidden"
         || editing_control.attr("display") == "none"
         || editing_control.hasClass("hidden"))
            editing_control.closest(".form-group").hide();

        if (editing_control.attr("j-db-binding") != void 0 && editing_control.attr("j-extend-load") == void 0) {
            //initialize j-db-biding control
            //get child control value
            var child_control_value = void 0;
            var control_child = $("[j-db-parent='" + editing_control.attr("id") + "']:eq(0)");
            if (control_child.length) {
                if (control_child.parent("[j-grid-field]") != void 0) {
                    child_control_value = item[control_child.parent("[j-grid-field]").attr("j-grid-field")];
                }
            }

            //j-db-binding control
            editing_control.bindData(binddata_callback, null
                , child_control_value
                , function (childControl) {
                    jFieldSetValue(childControl, child_control_value);
                });
        }
        else if (editing_control.hasClass("selectpicker"))
            //initialize combobox
            editing_control.comboBox();
        else if (editing_control.hasClass("datepicker")) {
            //initialize datepicker
            editing_control.addClass("form-control");
            editing_control.width(150);
            editing_control.css("display", "inline");
            editing_control.datepicker();
        }
        else if (editing_control.hasClass("bootstrap-checkbox"))
            //initialize check box
            editing_control.checkbox();
        else if (editing_control.hasClass("bootstrap-radio"))
            //initialize radio button
            editing_control.radio();
        else
            //initialize other controls
            editing_control.addClass("form-control input-sm");

        //set validate rules to the control
        editing_control.setValidateRules();
        editing_control.keydown(function (event) { if (event.keyCode == 13) { return false; } });
    });
}

//find gridview
function getJGrid(btn) {
    var j_grid = void 0;
    var j_grid_binding = btn.attr("j-grid-binding");
    if (j_grid_binding != void 0)
        j_grid = $("table[id$='" + j_grid_binding + "']");
    else
        j_grid = btn.parents("table.j-grid");

    return j_grid;
}

//get value object from the row
function getJGridItem(j_grid, index) {
    var itemJson = "({";
    var existItem = false;
    //traverse cells in the content row, fetch the fields
    j_grid.find("tr:has(td)").eq(index).find("td").each(function (td_index) {
        $(this).children("span[j-grid-field]").each(function () {
            var j_grid_field = $(this);
            if (j_grid_field.length) {
                itemJson += "'" + j_grid_field.attr("j-grid-field") + "':'" + jFieldGetValue(j_grid_field) + "',";
                itemJson += "'" + j_grid_field.attr("j-grid-field") + "_display':'" + jFieldGetText(j_grid_field) + "',";
                existItem = true;
            }
        });
    });
    if (existItem) itemJson = itemJson.substr(0, itemJson.length - 1);
    itemJson += "})";
    return eval(itemJson);
}

//get values to the row
function setJGridItem(j_grid, index, item) {
    //traverse cells in the content row, set the fields
    j_grid.find("tr:has(td)").eq(index).find("td").each(function (td_index) {
        $(this).children("span[j-grid-field]").each(function () {
            var j_grid_field = $(this);
            var j_grid_field_name = j_grid_field.attr("j-grid-field");
            if (item[j_grid_field_name + "_display"] != void 0)
                j_grid_field.html(item[j_grid_field_name + "_display"]);
        });
    });
}

//create dialog html
function createJGridDialogHtml(j_grid, mode) {
    var htmldialog = "";
    if (j_grid != void 0 && j_grid.length) {
        htmldialog += "<form id='j-grid-dialog' class='form-horizontal' role='form'>";

        //traverse cells in the content row, fetch the fields
        j_grid.find("tr:has(td)").eq(0).find("td").each(function (td_index) {
            var td_span = $(this).children("span");
            if (td_span.length) {
                var isShowField = true;
                if (td_span.hasClass("j-grid-addonly") && mode == "edit")
                    isShowField = false;
                else if (td_span.hasClass("j-grid-editonly") && mode == "add")
                    isShowField = false;

                if (isShowField) {
                    var j_grid_field_name = td_span.attr("j-grid-field");
                    if (j_grid_field_name != void 0) {
                        if (td_span.hasClass("j-grid-id"))
                            //append a id field
                            htmldialog += "<div type='j-grid-field' j-grid-field='" + j_grid_field_name + "'><input id='j-grid-id' type='hidden' /></div>";
                        else {
                            //find field header
                            var header = "";
                            if (j_grid.find("th").length)
                                header = j_grid.find("th").eq(td_index).html();
                            else
                                header = "";
                            //append form-group
                            htmldialog += "<div class='form-group'>"
                            htmldialog += "<label class='col-sm-2 control-label'>" + header + "</label>"

                            //append editing field div
                            htmldialog += "<div class='col-sm-8' type='j-grid-field' j-grid-field='" + j_grid_field_name + "'>";
                            //append editing control
                            if (td_span.attr("j-grid-editing") != void 0) {
                                //custom control
                                var j_grid_editing = $("#" + td_span.attr("j-grid-editing"));
                                htmldialog += j_grid_editing.html();
                            }
                            else
                                //simple control
                                htmldialog += "<input type='text' class='form-control input-sm'>"
                            htmldialog += "</div>"

                            htmldialog += "</div>"
                        }
                    }
                }
            }
        });

        htmldialog += "</form>";
    }

    return htmldialog;
}

//open dialog
function openJGridDialog(j_grid, btn, htmldialog, mode, item, callback_ok) {
    if (typeof (item) == "function") {
        callback_ok = item;
        item = void 0;
    }

    var title = "新增";
    if (mode == "edit") title = "编辑";
    if (j_grid != void 0 && j_grid.length) {
        //item could be undefined while adding mode
        if (item == void 0) {
            //set id field value 0
            item = eval("({ '" + j_grid.find(".j-grid-id").attr("j-grid-field") + "': 0 })");
        }
        var j_grid_title = (j_grid.attr("j-grid-title") != void 0) ? j_grid.attr("j-grid-title") : "";
        //popup dialog
        $.dialog({
            title: title + j_grid_title,
            content: htmldialog,
            showing: function () {
                var j_grid_dialog = $("#j-grid-dialog");

                //initialize editing controls
                initJGridControl($("#j-grid-dialog [type='j-grid-field']"), item, function (control) {
                    if (control != void 0) {
                        //set value to j-db-binding control
                        //must set in callback function becauce j-db-binding is ajax
                        var j_grid_field_control = control.parent("[j-grid-field]");
                        if (j_grid_field_control != void 0) {
                            var fieldName = j_grid_field_control.attr("j-grid-field");
                            if (fieldName != void 0) {
                                jFieldSetValue(control, item[fieldName]);
                            }
                        }
                    }
                });

                //set values to normal controls
                for (var fieldName in item) {
                    var editing_control = j_grid_dialog.find("[j-grid-field='" + fieldName + "']").children();
                    if (editing_control.attr("j-db-binding") == void 0)
                        jFieldSetValue(editing_control, item[fieldName]);
                }
            },
            buttons: {
                "确 定": function () {
                    //valid the form first
                    if (!$("#j-grid-dialog").valid()) return;

                    var j_grid_dialog = $("#j-grid-dialog");
                    //get value object from the dialog fields
                    var itemJson = "({";
                    var j_grid_field = j_grid_dialog.find("[type='j-grid-field']");
                    j_grid_field.each(function () {
                        itemJson += "'" + $(this).attr("j-grid-field") + "':'" + jFieldGetValue($(this).children()) + "',";
                        itemJson += "'" + $(this).attr("j-grid-field") + "_display':'" + jFieldGetText($(this).children()) + "',";
                    });
                    if (j_grid_field.length) itemJson = itemJson.substr(0, itemJson.length - 1);;
                    itemJson += "})";

                    var item = eval(itemJson);
                    //find executing method
                    if (j_grid.attr("j-grid-" + mode) != void 0) {
                        //.net mode
                        var ajax = true;
                        if (j_grid.attr("j-grid-ajax") != void 0) {
                            if (j_grid.attr("j-grid-ajax").toLowerCase() == "false")
                                ajax = false;
                        }
                        if (ajax) {
                            if (mode == "add")
                                setJGridButtonLoading(btn, "glyphicon-plus");
                            else
                                setJGridButtonLoading(btn, "glyphicon-pencil");

                            var refreshData = function (data) {
                                //call callback function when executed
                                if (mode == "add") {
                                    var j_grid_id_field = j_grid.find(".j-grid-id").attr("j-grid-field");
                                    item[j_grid_id_field] = data[j_grid_id_field];
                                    item[j_grid_id_field + "_display"] = data[j_grid_id_field];
                                }
                                if (callback_ok != void 0) callback_ok(item);

                                if (mode == "add")
                                    setJGridButtonNormal(btn, "glyphicon-plus");
                                else
                                    setJGridButtonNormal(btn, "glyphicon-pencil");
                            };
                            //get ajax parameters, remove the display fields
                            var param = {};
                            for (var f in item) {
                                if (f.indexOf("_display") < 0) {
                                    param[f] = item[f];
                                }
                            }

                            if (j_grid.attr("j-grid-ejs")) {
                                //node.js mode
                                $.nodeAjax({
                                    type: "POST",
                                    url: j_grid.attr("j-grid-" + mode),
                                    data: { item: param },
                                    success: function (data) {
                                        refreshData(data);
                                    },
                                    errMsg: j_grid_title + title + "失败！"
                                });
                            }
                            else {
                                //execute in ajax mode
                                $.ajaxPost({
                                    url: window.document.location.href + "/" + j_grid.attr("j-grid-" + mode),
                                    data: { item: param },
                                    success: function (data) {
                                        refreshData(data);
                                    },
                                    errMsg: j_grid_title + title + "失败！"
                                });
                            }
                        }
                        else
                            //execute in postback mode
                            $.postBack(j_grid.attr("j-grid-" + mode), { item: item });
                    }
                    $.dialog("close");
                },
                "取 消": function () {
                    $.dialog("close");
                }
            },
            buttons_css: {
                "确 定": "btn-primary",
                "取 消": "btn-danger"
            }
        });
    }
}

function jFieldGetValue(control) {
    if (control.attr("j-extend-get-value") != void 0)
        return eval(control.attr("j-extend-get-value"))(control);
    else
        return control.getValue();
}
function jFieldGetText(control) {
    if (control.attr("j-extend-get-display") != void 0)
        return eval(control.attr("j-extend-get-display"))(control);
    else
        return control.getText();
}
function jFieldSetValue(control, value) {
    if (control.attr("j-extend-set-value") != void 0)
        eval(control.attr("j-extend-set-value"))(control, value);
    else
        control.setValue(value);
}

//bind events
jQuery.fn.extend({
    loaded: function (fn) {
        $(this).on("loaded", function (event, item) {
            if (fn != void 0)
                fn();
        });
    },
    edited: function (fn) {
        $(this).on("edited", function (event, item) {
            if (fn != void 0)
                fn(item);
        });
    },
    added: function (fn) {
        $(this).on("added", function (event, item) {
            if (fn != void 0)
                fn(item);
        });
    },
    deleted: function (fn) {
        $(this).on("deleted", function (event, item) {
            if (fn != void 0)
                fn();
        });
    }
});

function setJGridStyle(j_grid) {
    j_grid.find("tr:has(td)").each(function (index) {
        var tr = $(this);
        tr.removeClass("j-grid-row-selected")
          .removeClass("j-grid-row-odd")
          .removeClass("j-grid-row-even");

        if (index % 2 == 0)
            tr.removeClass("j-grid-row-selected").removeClass("j-grid-row-odd").addClass("j-grid-row-even");
        else
            tr.removeClass("j-grid-row-selected").removeClass("j-grid-row-even").addClass("j-grid-row-odd");
    });

    j_grid.find("th").eq(j_grid.find("td").getIndex(j_grid.find("td.j-grid-id"))).hide();
    //initialize tooltip
    $("[data-toggle='tooltip']").each(function () { $(this).tooltip(); });

    //delete button
    resetDelBtn();
    //edit button
    resetEditBtn();
}

function selectJGridRow(j_grid_id, data_id) {
    $("table[id$='" + j_grid_id + "']").find("tr:has(td)").each(function (index) {
        var curId = $(this).find(".j-grid-id").html();
        if (data_id == curId)
            setSelected($(this), index);
        else
            setUnselected($(this), index);
    });
}
function setSelected(tr, index) {
    tr.removeClass("j-grid-row-odd").removeClass("j-grid-row-even").addClass("j-grid-row-selected");
}
function setUnselected(tr, index) {
    if (index % 2 == 0)
        tr.removeClass("j-grid-row-selected").removeClass("j-grid-row-odd").addClass("j-grid-row-even");
    else
        tr.removeClass("j-grid-row-selected").removeClass("j-grid-row-even").addClass("j-grid-row-odd");
}