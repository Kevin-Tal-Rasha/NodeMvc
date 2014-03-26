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

Connection.prototype.query = function (sql, param, callback) {
    if (!callback) {
        callback = param;
        param = undefined;
    }

    this.connect();

    var query = _conn.query(sql, param, function (err, rows, fields) {
        if (err)
            app.logger.error(err);
        else
            if (callback) callback(rows, fields);
    });
    app.logger.debug("SQL: " + query.sql);

    this.disconnect();
}

Connection.prototype.lastInsertId = function (table_name, id_field_name, callback) {
    if (!callback) {
        callback = id_field_name;
        id_field_name = undefined;
    }

    this.query("SELECT MAX(?) FROM ?", [table_name, id_field_name || "Id"], function (id) {
        callback(id);
    });
}

module.exports = Connection;