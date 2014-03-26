var url = require("url");
var fs = require("fs");
var path = require("path");
var querystring = require("querystring");
var common = require("./common.js");
var app;

var Mvc = function (a) {
    app = a;
};

function createContext(controllerName, req, res, callback) {
    common.callControllerFunc(controllerName, "load", app.ajaxTimeout, { req: req, res: res, app: app }, undefined, function (data) {
        var ctx = {
            ctx: { title: app.pageTitle }
        };
        if (data.value)
            common.combinJson(ctx.ctx, data.value);

        ctx.ctx.jsonStr = JSON.stringify(ctx);
        callback(ctx);
    });
}

function renderPage(res, path, context) {
    res.render(path, context, function (err, html) {
        if (err) {
            app.logger.error(err.stack || err);
            res.render("500.html", context);
            res.status("500");
        } else {
            res.send(html);
        }
    });
}

Mvc.prototype.init = function (startPage) {

    app.all("/MvcAjax/:type", function (req, res) {
        var type = req.params.type || "GET";
        var param = {};
        var paramFromAjax = {};

        if (type.toUpperCase() == "GET")
            paramFromAjax = req.query;
        else
            paramFromAjax = req.body;

        param.args = paramFromAjax.args || {};
        param.funcName = paramFromAjax.funcName;
        param.mvcPath = paramFromAjax.mvcPath;

        common.callControllerFunc(param.mvcPath, param.funcName, app.ajaxTimeout, { req: req, res: res, app: app }, param.args, function (data) {
            res.send(data);
        });
    });

    app.use(function (req, res) {
        var urlJson = url.parse(req.url);
        var pathname = urlJson.pathname == "/" ? startPage : urlJson.pathname;
        if (pathname.indexOf("/") == 0) pathname = pathname.substr(1);
        pathname = querystring.unescape(pathname);

        if (fs.existsSync(__dirname + "/../../views/" + pathname + ".html")) {
            createContext(pathname, req, res, function (context) {
                renderPage(res, pathname + ".html", context);
            });
        }
        else {
            //static files
            var isStaticFile = false;
            if (pathname.indexOf("fonts") == 0) {
                isStaticFile = true;
                var filepath = __dirname + "/../css/" + pathname;
                if (fs.existsSync(filepath)) {
                    var filecontent;
                    var fileextension = filepath.substring(filepath.lastIndexOf(".") + 1);
                    if (fileextension == "svg")
                        filecontent = fs.readFileSync(filepath).toString();
                    else
                        filecontent = fs.readFileSync(filepath, "binary");
                    if (filecontent) {
                        res.writeHead(200, { "Content-Type": "application/font-" + fileextension });
                        if (fileextension == "svg")
                            res.end(filecontent);
                        else
                            res.end(filecontent, "binary");
                    }
                }
            }
            else if (pathname.indexOf("download") == 0) {
                isStaticFile = true;
                var file = __dirname + '../../../static/ERP使用情况调查表.pdf';
                res.download(path.resolve(file));
            }
            else {
                var filepath = __dirname + "/../../static/" + pathname;
                if (!fs.existsSync(filepath)) {
                    filepath = __dirname + "/../../views/" + pathname;
                    if (!fs.existsSync(filepath)) filepath = null;
                }
                if (filepath) {
                    isStaticFile = true;
                    var filedata = fs.readFileSync(filepath);
                    res.send(filedata.toString());
                }
            }

            //404 page
            if (!isStaticFile) {
                createContext(pathname, req, res, function (context) {
                    res.render("404.html", context);
                    res.status("404");
                });
            }
        }
    });
};

module.exports = Mvc;
