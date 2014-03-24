var fs = require('fs');
var timer = require("timers");

exports.enableMultiViews = function (app) {
    // Monkey-patch express to accept multiple paths for looking up views.
    // this path may change depending on your setup.
    var lookup_proxy = app.get("view").prototype.lookup;

    app.get("view").prototype.lookup = function (viewName) {
        var context, match;
        if (this.root instanceof Array) {
            for (var i = 0; i < this.root.length; i++) {
                context = { root: this.root[i] };
                match = lookup_proxy.call(context, viewName);
                if (match) {
                    return match;
                }
            }
            return null;
        }
        return lookup_proxy.call(this, viewName);
    };
}

exports.combinJson = function (des, src, override) {
    if (src instanceof Array) {
        for (var i = 0, len = src.length; i < len; i++)
            this.combinJson(des, src[i], override);
    }
    for (var i in src) {
        if (override || !(i in des)) {
            des[i] = src[i];
        }
    }
    return des;
}

exports.getFieldValueArray = function (obj) {
    var argArray = [];
    if (obj) {
        for (var field in obj)
            argArray.push(obj[field]);
    }
    return argArray;
}

exports.getController = function (controllerName) {
    if (controllerName.indexOf("/") != 0)
        controllerName = "/" + controllerName;

    if (fs.existsSync(__dirname + "/../../controllers" + controllerName + ".js"))
        return require("../../controllers" + controllerName + ".js");
}

exports.getControllerFunc = function (controllerName, funcName) {
    var controller = this.getController(controllerName);
    var result = {};
    if (controller)
        return controller[funcName];
}

exports.getFuncArguments = function (fn) {
    var argStr = fn.toString().match(/function.*{/);
    if (argStr.length)
        argStr = argStr[0].toLowerCase().replace("function", "").replace("{", "").replace("(", "").replace(")", "").replace(/\s*/g, "").trim();
    if (argStr == "")
        return [];
    else
        return argStr.split(",");
}

exports.callControllerFunc = function (controllerName, funcName, ajaxTimeout, context, arg, callback) {
    var data = { success: true };
    var sent = false;
    var hasCallback = false;
    var controllerFunc = this.getControllerFunc(controllerName, funcName);
    if (controllerFunc) {
        var funcArgs = this.getFuncArguments(controllerFunc);
        if (funcArgs.indexOf("callback") >= 0)
            hasCallback = true;
    }

    arg = arg || {};
    if (hasCallback) {
        arg.callback = function (value) {
            if (!sent) {
                sent = true;
                data.value = value;
                callback(data);
            }
        };
    }

    try {
        if (controllerFunc)
            data.value = controllerFunc.apply(context, this.getFieldValueArray(arg));
    } catch (ex) {
        data.value = undefined;
        data.success = false;
        data.err = ex;
    }
    if (!data.success || !hasCallback) {
        if (!sent) {
            sent = true;
            callback(data);
        }
    }
    else {
        timer.setTimeout(function () {
            if (!sent) {
                sent = true;
                data.success = false;
                data.err = "服务器请求超时！";
                callback(data);
            }
        }, ajaxTimeout * 1000);
    }

}