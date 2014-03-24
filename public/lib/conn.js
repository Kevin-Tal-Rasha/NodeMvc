var mysql = require("mysql");
var _config;
var _conn;
var app;

var Connection = function (a, conf) { app = a; _config = conf; }

function connect() {
    _conn = mysql.createConnection(_config);
    _conn.connect(handleError);
    _conn.on("error", handleError);
}

function handleError(err) {
    if (err) {
        //reconnect if connection is lost
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connect();
        } else {
            app.logger.error(err.stack || err);
        }
    }
}

Connection.prototype.connect = connect;

Connection.prototype.disconnect = function () {
    _conn.end(function (err) {
        _conn.destroy();
    });
}

Connection.prototype.query = function (sql, callback) {
    this.connect();

    app.logger.debug("SQL: " + sql);
    _conn.query(sql, function (err, rows, fields) {
        if (err)
            app.logger.error(err);
        else
            if (callback) callback(rows, fields);
    });

    this.disconnect();
}

module.exports = Connection;