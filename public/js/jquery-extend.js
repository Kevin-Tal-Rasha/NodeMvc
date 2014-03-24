/// <reference path="jquery-1.10.2.min.js" />
/// <reference path="jquery-ui-1.8.16.min.js" />

String.prototype.trim = function () { return this.replace(/(^\s*)|(\s*$)/g, ""); }
String.prototype.trimPRE = function () { return this.replace("<pre>", "").replace("</pre>", "").replace("<PRE>", "").replace("</PRE>", ""); }

//for ie8
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
             ? Math.ceil(from)
             : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

function getReturnMsg(msg) {
    msg = msg.replace("#success#", "");
    return msg;
}

function isSuccess(msg) {
    return msg.indexOf("#success#") == 0
}

Date.prototype.toShortTimeString = function () {
    var M = this.getMonth() + 1;
    if (M < 10) M = "0" + M;
    var d = this.getDay() + 1;
    if (d < 10) d = "0" + d;
    var h = this.getHours();
    if (h < 10) h = "0" + h;
    var m = this.getMinutes();
    if (m < 10) m = "0" + m;

    var timeStr = h + ":" + m;
    var now = new Date();
    if (now.getDay() != this.getDay() || now.getMonth() != this.getMonth() || now.getYear() != this.getYear())
        timeStr = M + "-" + d + " " + timeStr;

    return timeStr;
}

jQuery.extend({
    space: function (count) {
        for (var i = 0; i < count; i++) document.write("&nbsp;")
    },
    getGUID: function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    rootPath: function () {
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var pos = curWwwPath.indexOf(pathName);
        var localhostPaht = curWwwPath.substring(0, pos);
        return (localhostPaht);
    },
    request: function (key) {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }

        if (key == void 0)
            return vars;
        else
            return (vars[key] == void 0) ? "" : vars[key];
    },
    play: function (url) {
        if (!$("#audio_player_container").length) {
            $("body").append("<div id='audio_player_container'></div>");
            if (Modernizr.audio) {
                $("#audio_player_container").html("<audio id='audio_player' hidden='hidden'></audio>");
            }
        }

        if (Modernizr.audio) {
            $("#audio_player").attr("src", url);
            $("#audio_player").get(0).play();
        }
        else {
            $("#audio_player_container").html("<embed id='audio_player' autoplay='true' loop='false' hidden='false'></embed>");
            $("#audio_player").attr("src", url);
        }
    },
    sleep: function (milliseconds) {
        var t_start = Number(new Date());
        while (t_start + milliseconds > Number(new Date())) { }
    },
    LoadInUpdatePanel: function (func) {
        $(function () {
            try {
                var page = Sys.WebForms.PageRequestManager.getInstance();
                func.call();
                page.add_endRequest(function () {
                    func.call();
                });
            }
            catch (ex) {
                func.call();
            }
        });
    },
    netPost: function (param) {
        var urlAddress = param.url.substring(0, param.url.lastIndexOf("/"));
        var methodName = param.url.substring(param.url.lastIndexOf("/") + 1);

        var dataJson = null;
        if (param.data == void 0)
            dataJson = { MethodName: methodName };
        else if (typeof (param.data) == "string") {
            param.data = param.data.replace(/\r\n/g, "&br;");
            param.data = param.data.replace(/\n/g, "&br;");
            param.data = param.data.replace(/</g, "&lt;");
            param.data = param.data.replace(/>/g, "&gt;");
            dataJson = eval("(" + param.data + ")");
            dataJson.MethodName = methodName;
        }
        else {
            dataJson = param.data;
            dataJson.MethodName = methodName;
        }
        var async = true;
        if (param.async != void 0)
            async = param.async;

        $.ajax({
            type: "POST",
            url: urlAddress,
            data: dataJson,
            async: async,
            cache: false,
            success: function (data) {
                if (isSuccess(data)) {
                    if (param.success != void 0) {
                        var resultData = getReturnMsg(data);
                        resultData = resultData.replace(/False/g, "false").replace(/True/g, "true");
                        try { resultData = eval("(" + resultData + ")"); }
                        catch (ex) {
                            try { resultData = eval(resultData); }
                            catch (ex) { }
                        }
                        if (resultData == void 0) resultData = new Array();
                        param.success(resultData);
                    }
                }
                else {
                    if (param.errMsg != void 0)
                        msgBox(param.errMsg + "<br>" + data);
                    else
                        msgBox(data);
                }
            },
            error: function (err) {
                msgBox("服务器连接出错，请联系管理员！");
            }
        });
    },
    postBack: function (methodName, param, callback_postback) {
        if (typeof (param) == "function") {
            callback_postback = param;
            param = void 0;
        }
        if (param == void 0) param = "";
        var arg = {
            methodName: methodName,
            param: param
        };
        $("#lblPostBackError").html("");
        __doPostBack('Master$btnForPostBack', JSON.stringify(arg));

        var callback = function () {
            if ($("#lblPostBackError").html() != "") {
                msgBox($("#lblPostBackError").html());
                $("#lblPostBackError").html("");
            }
            else
                if (callback_postback != void 0) callback_postback();
        };
        try {
            var page = Sys.WebForms.PageRequestManager.getInstance();
            page.remove_endRequest(callback);
            page.add_endRequest(callback);
        }
        catch (ex) { }
    },
    nodeAjax: function (param) {
        var dataJson = null;
        if (param.data == void 0)
            dataJson = {};
        else if (typeof (param.data) == "string") {
            param.data = param.data.replace(/\r\n/g, "&br;");
            param.data = param.data.replace(/\n/g, "&br;");
            param.data = param.data.replace(/</g, "&lt;");
            param.data = param.data.replace(/>/g, "&gt;");
            dataJson = eval("(" + param.data + ")");
        }
        else
            dataJson = param.data;

        var funcName = param.url.substring(param.url.lastIndexOf("/") + 1);
        var mvcPath = param.url.substring(0, param.url.lastIndexOf("/"));
        if (mvcPath == "")
            mvcPath = window.document.location.pathname;
        if (!param.type)
            param.type = "GET";
        else
            param.type = param.type.toUpperCase();

        $.ajax({
            type: param.type,
            url: "/MvcAjax/" + param.type,
            data: { args: dataJson, funcName: funcName, mvcPath: mvcPath },
            async: param.async || true,
            cache: false,
            success: function (data) {
                if (data && data.success) {
                    if (param.success != void 0) {
                        param.success(data.value);
                    }
                }
                else {
                    if (param.errMsg != void 0)
                        msgBox(param.errMsg + "<br>" + data.err);
                    else
                        msgBox(data);
                }
            },
            error: function (err) {
                msgBox("服务器连接出错，请联系管理员！");
            }
        });
    }
});

jQuery.fn.extend({
    inputAutoSize: function () {
        var textWidth = function (input) {
            var text = input.val().replace(/\s/g, "&nbsp;");
            if (input.attr("static-value") != void 0)
                text = input.attr("static-value").replace(/\s/g, "&nbsp;");
            var sensor = $("<span style='font-weight:bold'>" + text + "</span>").css({ display: 'none' });
            input.parent().append(sensor);
            var width = sensor.width();
            sensor.remove();
            return width;
        };
        var setWidth = function (input) { input.width(textWidth(input)); };

        setWidth($(this));
        $(this).unbind("keydown");
        $(this).unbind("value_changed");
        $(this).on("value_changed", function () {
            setWidth($(this));
        });
        $(this).keydown(function () { setWidth($(this)); });
    },
    fix: function (offset) {
        if (offset == void 0)
            offset = 0;

        $(this).css("padding-top", ($(document).scrollTop() - offset) + "px");
    },
    outerHtml: function () {
        return $('<div>').append($(this).clone()).remove().html();
    },
    getIndex: function (item) {
        for (var i = 0; i < $(this).length; i++)
            if (item[0] == $(this)[i])
                return i;
    },
    getValue: function () {
        var control = $(this);
        if (!control.length) return;
        var value = "";

        if (control.prop("tagName").toLowerCase() == "span")
            value = control.html();
        else if (control.hasClass("selectpicker"))
            value = control.comboBox("current", "inline");
        else if (control.hasClass("bootstrap-checkbox"))
            value = control.checkbox("current", "inline");
        else if (control.hasClass("bootstrap-radio"))
            value = control.radio("current", "inline");
        else
            value = control.val();

        return value;
    },
    getText: function () {
        var control = $(this);
        if (!control.length) return;
        var text = "";

        if (control.prop("tagName").toLowerCase() == "span")
            text = control.html();
        else if (control.hasClass("selectpicker"))
            text = control.comboBox("current", "text-inline");
        else if (control.hasClass("bootstrap-checkbox"))
            text = control.checkbox("current", "text-inline");
        else if (control.hasClass("bootstrap-radio"))
            text = control.radio("current", "text-inline");
        else
            text = control.val();

        return text;
    },
    setValue: function (value) {
        var control = $(this);
        if (!control.length) return;

        if (control.prop("tagName").toLowerCase() == "span")
            control.html(value);
        else if (control.hasClass("selectpicker"))
            control.comboBox("select", value);
        else if (control.hasClass("bootstrap-checkbox"))
            control.checkbox("check", value);
        else if (control.hasClass("bootstrap-radio"))
            control.radio("check", value);
        else
            control.val(value);

        control.trigger("value_changed");
    },
    setValidateRules: function () {
        var editing_control = $(this);
        //set validate rules to form
        if (editing_control.prop("tagName").toLowerCase() == "form") {
            editing_control.find("[j-validate]").each(function () {
                $(this).setValidateRules();
            });
            return;
        }

        //set validate rules to controls
        j_form = editing_control.closest("form");
        if (j_form.attr("validate_initialized") == void 0) {
            //set validate css
            j_form.validate({
                highlight: function (element) {
                    $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                },
                success: function (element) {
                    element.closest('.form-group').removeClass('has-error').addClass('has-success');
                    element.remove();
                }
            });

            j_form.attr("validate_initialized", true);
        }

        if (editing_control.attr("name") == void 0) {
            if (editing_control.attr("id") != void 0)
                editing_control.attr("name", editing_control.attr("id"));
            else
                editing_control.attr("name", $.getGUID());
        }

        var option = void 0;
        var option_msg = void 0;
        var j_validate = editing_control.attr("j-validate");
        var j_validate_msg = editing_control.attr("j-validate-msg");

        if (j_validate != void 0) {
            option = {};
            option_msg = {}
            var ruleList = j_validate.split(" ");
            for (var i = 0; i < ruleList.length; i++) {
                if (ruleList[i].indexOf("remote") == 0) {
                    var remoteStr = ruleList[i].substr(ruleList[i].indexOf(":") + 1);
                    var urlAddress = remoteStr.substring(0, remoteStr.lastIndexOf("/"));
                    var methodName = remoteStr.substring(remoteStr.lastIndexOf("/") + 1);

                    option.remote = {
                        url: urlAddress,
                        type: "post",
                        data: {
                            MethodName: methodName,
                            Parameter: function () {
                                return editing_control.getValue();
                            },
                            Id: function () {
                                var id_control = editing_control.closest("form").find("#j-grid-id");
                                if (id_control.length)
                                    return id_control.val();
                                else
                                    return "";
                            }
                        }
                    }
                    if (j_validate_msg != void 0)
                        option_msg.remote = j_validate_msg;
                    else
                        option_msg.remote = editing_control.attr("j-validate-msg-remote");
                }
                else if (ruleList[i].indexOf("minlength") == 0) {
                    option.minlength = ruleList[i].substr(ruleList[i].indexOf(":") + 1);
                    if (j_validate_msg != void 0)
                        option_msg.minlength = j_validate_msg;
                    else
                        option_msg.minlength = editing_control.attr("j-validate-msg-minlength");
                }
                else if (ruleList[i].indexOf("maxlength") == 0) {
                    option.maxlength = ruleList[i].substr(ruleList[i].indexOf(":") + 1);
                    if (j_validate_msg != void 0)
                        option_msg.maxlength = j_validate_msg;
                    else
                        option_msg.maxlength = editing_control.attr("j-validate-msg-maxlength");
                }
                else if (ruleList[i].indexOf("rangelength") == 0) {
                    option.rangelength = eval(ruleList[i].substr(ruleList[i].indexOf(":") + 1));
                    if (j_validate_msg != void 0)
                        option_msg.rangelength = j_validate_msg;
                    else
                        option_msg.rangelength = editing_control.attr("j-validate-msg-rangelength");
                }
                else if (ruleList[i].indexOf("min") == 0) {
                    option.min = ruleList[i].substr(ruleList[i].indexOf(":") + 1);
                    if (j_validate_msg != void 0)
                        option_msg.min = j_validate_msg;
                    else
                        option_msg.min = editing_control.attr("j-validate-msg-min");
                }
                else if (ruleList[i].indexOf("max") == 0) {
                    option.max = ruleList[i].substr(ruleList[i].indexOf(":") + 1);
                    if (j_validate_msg != void 0)
                        option_msg.max = j_validate_msg;
                    else
                        option_msg.max = editing_control.attr("j-validate-msg-max");
                }
                else if (ruleList[i].indexOf("range") == 0) {
                    option.range = eval(ruleList[i].substr(ruleList[i].indexOf(":") + 1));
                    if (j_validate_msg != void 0)
                        option_msg.range = j_validate_msg;
                    else
                        option_msg.range = editing_control.attr("j-validate-msg-range");
                }
                else {
                    switch (ruleList[i].toLowerCase()) {
                        case "required":
                            option.required = true;
                            if (j_validate_msg != void 0)
                                option_msg.required = j_validate_msg;
                            else
                                option_msg.required = editing_control.attr("j-validate-msg-required");
                            break;
                        case "email":
                            option.email = true;
                            if (j_validate_msg != void 0)
                                option_msg.email = j_validate_msg;
                            else
                                option_msg.email = editing_control.attr("j-validate-msg-email");
                            break;
                        case "url":
                            option.url = true;
                            if (j_validate_msg != void 0)
                                option_msg.url = j_validate_msg;
                            else
                                option_msg.url = editing_control.attr("j-validate-msg-url");
                            break;
                        case "date":
                            option.date = true;
                            if (j_validate_msg != void 0)
                                option_msg.date = j_validate_msg;
                            else
                                option_msg.date = editing_control.attr("j-validate-msg-date");
                            break;
                        case "dateISO":
                            option.dateISO = true;
                            if (j_validate_msg != void 0)
                                option_msg.dateISO = j_validate_msg;
                            else
                                option_msg.dateISO = editing_control.attr("j-validate-msg-dateISO");
                            break;
                        case "number":
                            option.number = true;
                            if (j_validate_msg != void 0)
                                option_msg.number = j_validate_msg;
                            else
                                option_msg.number = editing_control.attr("j-validate-msg-number");
                            break;
                        case "digits":
                            option.digits = true;
                            if (j_validate_msg != void 0)
                                option_msg.digits = j_validate_msg;
                            else
                                option_msg.digits = editing_control.attr("j-validate-msg-digits");
                            break;
                        case "creditcard":
                            option.creditcard = true;
                            if (j_validate_msg != void 0)
                                option_msg.creditcard = j_validate_msg;
                            else
                                option_msg.creditcard = editing_control.attr("j-validate-msg-creditcard");
                            break;
                        case "equalto":
                            var equalToId = editing_control.attr("j-validate-equalto");
                            if (!$(equalToId).length) equalToId = "#" + equalToId;
                            option.equalTo = $(equalToId);
                            if (j_validate_msg != void 0)
                                option_msg.equalTo = j_validate_msg;
                            else
                                option_msg.equalTo = editing_control.attr("j-validate-msg-equalto");
                            break;
                    }
                }
            }
        }
        if (editing_control.attr("required") != void 0) {
            if (option == void 0) option = {};
            if (option_msg == void 0) option_msg = {};
            option.required = true;
            option_msg.required = j_validate_msg;
        }

        if (editing_control.attr("type") == "email") {
            if (option == void 0) option = {};
            if (option_msg == void 0) option_msg = {};
            option.email = true;
            option_msg.email = j_validate_msg;
        }

        if (option != void 0) {
            option.messages = option_msg;
            editing_control.rules("add", option);
        }
    },
    bindData: function (callback, curValue, childValue, childCallback) {
        if (callback != void 0 && typeof (callback) != "function") {
            childCallback = childValue;
            childValue = curValue;
            curValue = callback;
            callback = void 0;
        }
        if (typeof (curValue) == "function") {
            childCallback = curValue;
            curValue = void 0
        }

        var control = $(this);
        var tableName = control.attr("j-db-binding");
        var textFieldName = control.attr("j-db-text");
        var valueFieldName = control.attr("j-db-value");
        var inputFieldName = control.attr("j-db-input");
        var filter = control.attr("j-db-filter");

        var parentField = control.attr("j-db-parent-field");
        var parentControl = void 0;
        var parentId = void 0;
        var parentControlId = control.attr("j-db-parent");
        if (parentControlId != void 0)
            parentControl = $("#" + parentControlId);
        if (parentControl != void 0)
            parentId = parentControl.getValue();

        if (tableName == void 0 || textFieldName == void 0 || valueFieldName == void 0)
            return;

        if (control.hasClass("selectpicker")) {
            control.html("<option value='-1'>加载中...</option>");
        }
        else {
            control.html("<span class='glyphicon glyphicon-loading'></span>&nbsp;加载中...");
        }
        $.ajaxPost({
            url: "/Common/AspxReader/GetJDBModelList",
            data: {
                tableName: tableName,
                textFieldName: textFieldName,
                valueFieldName: valueFieldName,
                inputFieldName: inputFieldName,
                filter: filter,
                parentId: parentId,
                parentField: parentField
            },
            success: function (data) {
                var control_id = control.attr("id");
                var control_onchange_str = "onchange=control_change('" + control_id + "','" + childValue + "')";
                if (control_id == void 0) control_onchange_str = "";

                control.html("");
                for (var i = 0; i < data.length; i++) {
                    if (control.hasClass("bootstrap-checkbox")) {
                        control.append("<input type='checkbox' value='" + data[i].Value + "' " + control_onchange_str + " />" + data[i].Text);
                    }
                    else if (control.hasClass("bootstrap-radio")) {
                        control.append("<input type='radio' value='" + data[i].Value + "' " + control_onchange_str + " />" + data[i].Text);
                    }
                    else if (control.hasClass("selectpicker")) {
                        control.append("<option value='" + data[i].Value + "'>" + data[i].Text + "</option>");
                    }
                }
                if (control.hasClass("bootstrap-checkbox"))
                    control.checkbox();
                else if (control.hasClass("bootstrap-radio"))
                    control.radio();
                else if (control.hasClass("selectpicker")) {
                    control.comboBox();
                    control.change(function () {
                        control_change(control_id, childValue, childCallback);
                    });
                }

                if (curValue != void 0 && curValue != null) control.setValue(curValue);
                if (callback != void 0) callback(control);
            },
            errMsg: "数据加载失败！"
        });
    }
});
function control_change(id, childValue, childCallback) {
    if (id != "undefined") {
        var control = $("[j-db-parent='" + id + "']:eq(0)");
        if (control.length)
            control.bindData(childCallback, childValue);
    }
};

function initDatepicker_discarded() {
    var datepicker = $(".datepicker");
    if (datepicker.parent().hasClass("j-grid-editing")) return;

    datepicker.addClass("input-group date");
    datepicker.html("<input class='form-control' type='text' value='' readonly>");
    var param = {};
    if (datepicker.hasClass("datepicker-date")) {
        param.format = "yyyy-mm-dd";
        param.startView = 2;
        param.minView = 2;
        datepicker.append("<span class='input-group-addon'><span class='glyphicon glyphicon-calendar'></span>");
    }
    else if (datepicker.hasClass("datepicker-time")) {
        param.format = "hh:ii";
        param.startView = 1;
        param.minView = 0;
        param.maxView = 1;
        datepicker.append("<span class='input-group-addon'><span class='glyphicon glyphicon-time'></span>");
    }
    else {
        param.format = "yyyy-mm-dd hh:ii";
        param.startView = 2;
        datepicker.append("<span class='input-group-addon'><span class='glyphicon glyphicon-th'></span>");
    }
    param.language = "zh-CN";
    param.weekStart = 7;
    param.todayBtn = 1;
    param.autoclose = 1;
    param.todayHighlight = 1;
    param.forceParse = 0;
    if (!datepicker.hasClass("datepicker-readonly"))
        datepicker.datetimepicker(param);
    if (datepicker.attr("value") != void 0)
        datepicker.datepicker_val(datepicker.attr("value"));
}
//initialize tools
$.LoadInUpdatePanel(function () {
    try {
        //tooltip
        $("[data-toggle='tooltip']").each(function () { $(this).tooltip(); });
    }
    catch (ex) { }
});