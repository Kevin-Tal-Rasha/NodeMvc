jQuery.extend({
    dialog: function (args) {
        //close this dialog
        if (args == "close") {
            $("#dynamic_div_dialog").dialog("close");
            return;
        }

        if (args == void 0 || args.content == void 0) return;

        if (!$("#dynamic_div_dialog").length)
            $("body").append("<div id='dynamic_div_dialog'></div>");

        $("#dynamic_div_dialog").html(args.content);
        var title = $("#dynamic_div_dialog").children().attr("title");
        if (title != void 0) $("#dynamic_div_dialog").attr("title", title);
        $("#dynamic_div_dialog").dialog(args);
    }
});

jQuery.fn.extend({
    //bootstrap dialog
    dialog: function (args) {
        var div_modal = $("#bootstrap_modal");

        var title = "";
        if ($(this).attr("title") != void 0)
            title = $(this).attr("title");
        var buttons = void 0;
        var buttons_css = void 0;

        var callback_showing = void 0;
        var callback_shown = void 0;
        var callback_hiding = void 0;
        var callback_hidden = void 0;

        var options = void 0;

        if (args != void 0) {
            //close this dialog
            if (args == "close") {
                div_modal.modal("hide");
                return;
            }

            if (args.title != void 0)
                title = args.title;
            if (args.buttons != void 0)
                buttons = args.buttons;
            if (args.buttons_css != void 0)
                buttons_css = args.buttons_css;

            if (args.showing != void 0)
                callback_showing = args.showing;
            if (args.shown != void 0)
                callback_shown = args.shown;
            if (args.hiding != void 0)
                callback_hiding = args.hiding;
            if (args.hidden != void 0)
                callback_hidden = args.hidden;

            if (args.options != void 0)
                options = args.options;
        }

        //set title
        div_modal.find(".modal-title").html("<b>" + title + "</b>");

        //set content
        $(this).css("display", "none");
        div_modal.find(".modal-body").html($(this).html());

        //add buttons
        if (buttons == void 0)
            //set a default close button
            div_modal.find(".modal-footer").html("<button type='button' class='btn btn-default' data-dismiss='modal'>关 闭</button>");
        else {
            div_modal.find(".modal-footer").html("");
            for (var btnName in buttons) {
                var footer = div_modal.find(".modal-footer");
                var index = div_modal.find(".modal-footer button").length;
                if (index > 0)
                    footer.append("&nbsp;");
                footer.append("<button type='button' class='btn btn-default'>" + btnName + "</button>");

                //get button element
                var btn = div_modal.find(".modal-footer button").eq(index);
                //bind button event
                btn.click(buttons[btnName]);
                //set button css
                for (var btnCssName in buttons_css) {
                    if (btnCssName == btnName) {
                        btn.addClass(buttons_css[btnCssName]);
                        break;
                    }
                }
            }
        }

        //bind events
        if (callback_showing != void 0)
            div_modal.on('show.bs.modal', function (e) {
                div_modal.unbind("show.bs.modal");
                callback_showing.call();
            });
        if (callback_shown != void 0)
            div_modal.on('shown.bs.modal', function (e) {
                div_modal.unbind("shown.bs.modal");
                callback_shown.call();
            });
        if (callback_hiding != void 0)
            div_modal.on('hide.bs.modal', function (e) {
                div_modal.unbind("hide.bs.modal");
                callback_hiding.call();
            });
        if (callback_hidden != void 0)
            div_modal.on('hidden.bs.modal', function (e) {
                if ($(".modal-backdrop").length) $(".modal-backdrop").eq(0).remove();
                div_modal.unbind("hidden.bs.modal");
                callback_hidden.call();
            });
        else
            div_modal.on('hidden.bs.modal', function (e) {
                if ($(".modal-backdrop").length) $(".modal-backdrop").eq(0).remove();
                div_modal.unbind("hidden.bs.modal");
            });

        if ($("#dynamic_div_dialog").length)
            $("#dynamic_div_dialog").html("");
        //show bootstrap modal
        div_modal.modal(options);
    }
});

$(function () {
    var bootstrap_modal = "<div id='bootstrap_modal' class='modal fade'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h4 class='modal-title'></h4></div><div class='modal-body'></div><div class='modal-footer'></div></div></div></div>";
    $(document.body).prepend(bootstrap_modal);

    var boardDiv = "<div id='alert_msgBox' style='display:none;'></div>";
    $(document.body).append(boardDiv);
});

function msgBox(text, callback) {
    var ok = false;
    var params = {
        title: document.title,
        buttons: {
            "确 定": function () {
                ok = true;
                $(this).dialog("close");
            }
        },
        buttons_css: {
            "确 定": "btn-primary"
        },
        hidden: function () {
            if (ok && callback != void 0) callback();
        }
    };

    $("#alert_msgBox").html(text);
    $("#alert_msgBox").dialog(params);
}

function confirmBox(text, callback_ok, callback_cancel) {
    var ok = false;

    $("#alert_msgBox").html(text);
    $("#alert_msgBox").dialog({
        title: document.title,
        buttons: {
            "确 认": function () {
                ok = true;
                $(this).dialog("close");
            },
            "取 消": function () {
                ok = false;
                $(this).dialog("close");
            }
        },
        buttons_css: {
            "确 认": "btn-primary",
            "取 消": "btn-danger"
        },
        hidden: function () {
            if (ok) {
                if (callback_ok != void 0) callback_ok.call(); //方法回调
            }
            else {
                if (callback_cancel != void 0) callback_cancel.call(); //方法回调
            }
        }
    });
}