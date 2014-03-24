var express = require("express");
var http = require("http");
var url = require("url");
var common = require("./common.js");
var logger = require("./logger.js");
var app = express();

var rootdir = __dirname + "/../..";

app.use("/js", express.static(rootdir + "/public/js"));
app.use("/css", express.static(rootdir + "/public/css"));
app.use("/images", express.static(rootdir + "/public/images"));
app.use("/static", express.static(rootdir + "/static"));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({ secret: "potato cat" }));

common.enableMultiViews(app);
app.engine(".html", require("ejs").__express);
app.set("views", [rootdir + "/views", rootdir + "/public/errorpages"]);
app.set("view engine", "html");

var Connection = require("./conn.js");
var ConnectionPool = require("./conn_pool.js");
var Mvc = require("./mvc.js");

process.on("uncaughtException", function (err) {
    app.syslogger.error("UncaughtException thrown: " + err);
});

module.exports.App = app;
module.exports.start = function (config) {
    var port = 3237;
    app.pageTitle = "";
    app.ajaxTimeout = 30;
    var startPage = "index";

    if (config) {
        if (typeof (config) == "number")
            port = config;
        else
            port = config.port || port;
        app.pageTitle = config.title || "";
        app.ajaxTimeout = config.ajaxTimeout || "";

        startPage = config.startPage || "index";

        if (config.db) {
            app.dbConnection = new Connection(app, config.db);
            app.dbPool = new ConnectionPool(app, config.db);
        }

        if (config.logger) {
            logger.configure(config.logger);

            app.logger = logger.getLogger("module");
            app.syslogger = logger.getLogger("system");
            app.getLogger = logger.getLogger;
            app.configure(function () {
                app.use(logger.connectLogger(app.syslogger));
            });
        }
    }

    var mvc = new Mvc(app);
    mvc.init(startPage);

    http.createServer(app).listen(port, function () {
        app.syslogger.info("Server running at http://127.0.0.1:" + port + "/");
    });
}