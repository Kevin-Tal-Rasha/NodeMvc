var log4js = require("log4js");
var _level = "AUTO";

exports.configure = function (conf) {
    _level = conf.level || "AUTO";
    delete conf["level"];

    log4js.configure(conf);
}

exports.connectLogger = function (logger, level) {
    return log4js.connectLogger(logger, { level: level || _level, format: ":method :url" });
}

exports.getLogger = function (name, level) {
    var logger = log4js.getLogger(name);
    logger.setLevel(level || _level);
    return logger;
}