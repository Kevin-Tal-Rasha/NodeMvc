$.LoadInUpdatePanel(function () {
    $(".bootstrap-checkbox").each(function () {
        if ($(this).parent().hasClass("j-grid-editing")) return;
        $(this).checkbox();
    });
    $(".bootstrap-radio").each(function () {
        if ($(this).parent().hasClass("j-grid-editing")) return;
        $(this).radio();
    });
});

jQuery.fn.extend({
    checkbox: function (command, arg, isTriggerEvent) {
        return initGroupButton("checkbox", $(this), command, arg, isTriggerEvent);
    },
    radio: function (command, arg, isTriggerEvent) {
        return initGroupButton("radio", $(this), command, arg, isTriggerEvent);
    }
});

function initGroupButton(type, control, command, arg, isTriggerEvent) {
    if (command == void 0) {
        var style = "btn-default";
        if (control.attr("data-style") != void 0) style = control.attr("data-style");
        var htmlGroupButton = "<div class='btn-group' data-toggle='buttons'>";
        control.children("input[type='" + type + "']").each(function () {
            var checked_indicator = "";
            if ($(this).attr("checked") == "checked") checked_indicator = "active";
            htmlGroupButton += "<label name='" + type + "' class='btn " + style + " " + checked_indicator + "' onclick=button_change($(this),'" + type + "')>";
            htmlGroupButton += $(this).outerHtml();
            htmlGroupButton += "<span name='text'>" + $(this)[0].nextSibling.nodeValue + "</span>";
            htmlGroupButton += "</label>";
        });
        htmlGroupButton += "</div>";
        control.html(htmlGroupButton);
    }
    else {
        switch (command) {
            case "current":
                var items = [];
                control.find("label[name='" + type + "']").each(function () {
                    if ($(this).children("input[type='" + type + "']").attr("checked") == "checked") {
                        items.push({
                            text: $(this).children("span[name='text']").html(),
                            value: $(this).children("input[type='" + type + "']").val()
                        });
                    }
                });
                if (arg == "inline") {
                    var result = "";
                    for (var i = 0; i < items.length; i++) {
                        if (i > 0) result += ";";
                        result += items[i].value;
                    }
                    return result;
                }
                else if (arg == "text-inline") {
                    var result = "";
                    for (var i = 0; i < items.length; i++) {
                        if (i > 0) result += ";";
                        result += items[i].text.trim();
                    }
                    return result;
                }
                else if (type == "radio")
                    return items[0];
                else
                    return items;
                break;
            case "check":
                if (isTriggerEvent == void 0) isTriggerEvent = true;
                var setCheck = function (c, t, a, byValue) {
                    var btn = find_button(c, t, a, byValue);
                    btn.addClass("active");
                    button_change(btn, t, true);
                    if (isTriggerEvent)
                        btn.children("input").change();
                };

                control.find("label").removeClass("active");
                control.find("input").attr("checked", false);
                if (arg != void 0) {
                    if (typeof (arg) == "number")
                        setCheck(control, type, arg);
                    else if (typeof (arg) == "string") {
                        var values = arg.split(";");
                        for (var i = 0; i < values.length; i++) {
                            values[i] = values[i].trim();
                            setCheck(control, type, values[i]);
                        }
                    }
                    else if (!arg.length)
                        setCheck(control, type, arg);
                    else {
                        for (var i = 0; i < arg.length; i++) {
                            setCheck(control, type, arg[i], true);
                        }
                    }
                }
                break;
        }
    }
}

function find_button(control, type, item, byValue) {
    if (!byValue && typeof (item) == "number")
        return control.find("label[name='" + type + "']").eq(item);
    else if (typeof (item) != "object") {
        var btn = control.find("label[name='" + type + "']").has("input[value='" + item + "']");
        if (!btn.length) {
            var spans = control.find("label[name='" + type + "'] span[name='text']");
            spans.each(function () {
                if ($(this).html().trim() == item)
                    btn = $(this).parent();
            });
        }
        return btn;
    }
    else {
        var btn = control.find("label[name='" + type + "']").has("input[value='" + item.value + "']");
        if (!btn.length) {
            var spans = control.find("label[name='" + type + "'] span[name='text']");
            spans.each(function () {
                if ($(this).html().trim() == item.text)
                    btn = $(this).parent();
            });
        }
        return btn;
    }
}

function button_change(btn, type, checked) {
    switch (type) {
        case "checkbox":
            //click event raises before active state realy changed
            //so set checked state false while active class already exist
            var checkbox = btn.children("input[type='checkbox']");
            if (checked == void 0) {
                if (btn.hasClass("active"))
                    checkbox.attr("checked", false);
                else
                    checkbox.attr("checked", true);
            }
            else
                checkbox.attr("checked", checked);
            break;
        case "radio":
            btn.children("input[type='radio']").attr("checked", true);
            btn.parent().find("label[name='radio']").not(btn).removeClass("active");
            btn.parent().find("label[name='radio']").not(btn).children("input[type='radio']").attr("checked", false);
            break;
    }
}