jQuery.extend({
    createComboBox: function (id, items, defaultItem) {
        if (items == void 0 || !items.length) return "";

        var htmlCombo = "<div";
        if (id != void 0)
            htmlCombo += " id='" + id + "' name='" + id + "'";
        htmlCombo += " class='dropdown'>";

        htmlCombo += createBootstrapComboBoxHtml(id, items, defaultItem);

        htmlCombo += "</div>";
        return htmlCombo;
    }
});

jQuery.fn.extend({
    //bootstrap combobox extend
    comboBox: function (command, arg, isTriggerChangeEvent) {
        if (typeof (command) != "string") {
            isTriggerChangeEvent = arg;
            arg = command;
            command = void 0
        }

        if (command == void 0) {
            var items = void 0;
            var default_item = void 0;

            //get parameters
            if (arg != void 0) {
                if (arg != void 0)
                    items = arg;
                if (isTriggerChangeEvent != void 0)
                    default_item = isTriggerChangeEvent;
            }

            //create comboBox
            var div = $(this);
            if (div.attr("id") == void 0) return;
            div.addClass("dropdown");
            div.html(createBootstrapComboBoxHtml(div.attr("id"), items, default_item));
        }
        else {
            //command mode
            switch (command) {
                case "items":
                    return $(this).getComboBoxItems();
                    break;
                case "add":
                    return $(this).addComboBoxItem(arg);
                    break;
                case "remove":
                    return $(this).removeComboBoxItem(arg);
                    break;
                case "clear":
                    return $(this).clearComboBoxItem();
                    break;
                case "select":
                    return $(this).setComboBoxSelectedItem(arg, isTriggerChangeEvent);
                    break;
                case "current":
                    return $(this).getComboBoxSelectedItem();
                    break;
                case "change":
                    return $(this).comboBoxChange(arg);
                    break;
            }
        }
    },
    getComboBoxItems: function () {
        var div = $(this);
        if (div.attr("id") == void 0) return;

        var itemList = new Array();
        var lis = div.find("ul.dropdown-menu").find("li");
        for (var i = 0; i < lis.length; i++) {
            var item = {};
            item.text = $(lis[i]).children("a").html();
            item.value = $(lis[i]).attr("value");
            itemList.push(item);
        }

        return itemList;
    },
    addComboBoxItem: function (item) {
        var div = $(this);
        if (div.attr("id") == void 0) return;

        div.find("ul.dropdown-menu").append(createBootstrapComboBoxItemHtml(div.attr("id"), item));
        if ($(this).getComboBoxItems().length == 1)
            bootstrapComboBoxChange(div.attr("id"), item.text, item.value);
    },
    removeComboBoxItem: function (item) {
        var div = $(this);
        if (div.attr("id") == void 0) return;
        var id = div.attr("id");

        var li = [];
        var item_value = "";
        if (typeof (item) == "number") {
            //find index
            li = div.find("li").eq(item);
            item_value = li.attr("value");
        }
        else {
            //find item by value
            item_value = item.value;
            li = div.find("li[value='" + item_value + "']");
        }
        if (li.length) li.remove();

        //set select item
        var value = $('#' + id + "_selected_value").val();
        if (value == item_value) {
            var lis = div.find("ul.dropdown-menu").find("li");
            if (lis.length)
                bootstrapComboBoxChange(id, $(lis[0]).children("a").html(), $(lis[0]).attr("value"));
            else
                bootstrapComboBoxChange(div.attr("id"), "", "");
        }
    },
    clearComboBoxItem: function () {
        var div = $(this);
        if (div.attr("id") == void 0) return;

        div.find("ul.dropdown-menu").html("");
        bootstrapComboBoxChange(div.attr("id"), "", "");
    },
    setComboBoxSelectedItem: function (selectedItem, isTriggerChangeEvent) {
        if (selectedItem.value == "undefined") return;

        var div = $(this);
        if (div.attr("id") == void 0) return;

        var items = $(this).getComboBoxItems();
        for (var i = 0; i < items.length; i++) {
            if (items[i].value == selectedItem.value) {
                selectedItem.text = items[i].text
                break;
            }
        }
        bootstrapComboBoxChange(div.attr("id"), selectedItem.text, selectedItem.value, isTriggerChangeEvent);
    },
    getComboBoxSelectedItem: function () {
        var div = $(this);
        if (div.attr("id") == void 0) return;
        var item = {};
        item.text = $('#' + div.attr("id") + "_selected_text").html();
        item.value = $('#' + div.attr("id") + "_selected_value").val();
        return item;
    },
    comboBoxChange: function (func) {
        $(this).unbind("bootstrapComboBoxChange");
        $(this).on("bootstrapComboBoxChange", function (event, text, value) {
            func(text, value);
        });
    }
});

function createBootstrapComboBoxItemHtml(id, item) {
    return "<li value='" + item.value + "'><a href='javascript:void(0)' onclick=bootstrapComboBoxChange('" + id + "','" + item.text + "','" + item.value + "',true)>" + item.text + "</a></li>";
}

function createBootstrapComboBoxHtml(id, items, defaultItem) {
    var htmlCombo = "<a";
    htmlCombo += " role='button' class='btn btn-default btn-xs' data-toggle='dropdown' data-target='#' href='javascript:void(0)'>";

    if (defaultItem == void 0) {
        defaultItem = { text: "", value: "" };
        if (items != void 0)
            if (items.length)
                defaultItem = items[0];
    }
    htmlCombo += "<span id='" + id + "_selected_text'>" + defaultItem.text + "</span>&nbsp;<span class='caret'></span></a>";

    htmlCombo += "<input id='" + id + "_selected_value' type='hidden' value='" + defaultItem.value + "' />";
    htmlCombo += "<ul class='dropdown-menu' role='menu' aria-labelledby='dLabel'>";

    if (items != void 0) {
        for (var i in items) {
            htmlCombo += createBootstrapComboBoxItemHtml(id, items[i]);
        }
    }

    htmlCombo += "</ul>";
    return htmlCombo;
}

function bootstrapComboBoxChange(id, text, value, isTriggerChangeEvent) {
    $('#' + id + "_selected_text").html(text);
    $('#' + id + "_selected_value").val(value);
    if (isTriggerChangeEvent)
        $('#' + id).trigger("bootstrapComboBoxChange", [text, value]);
};
