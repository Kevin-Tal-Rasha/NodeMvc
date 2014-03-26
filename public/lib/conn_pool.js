var mysql = require('mysql');

var _config;
var _pool;
var app;

var ConnectionPool = function (a, conf) {
    app = a;
    _config = conf;
    _pool = mysql.createPool(_config);
}

ConnectionPool.prototype.query = function (sql, param, callback) {
    if (!callback) {
        callback = param;
        param = undefined;
    }

    _pool.getConnection(function (err, connection) {
        if (err)
            app.logger.error(err);
        else {
            var query = connection.query(sql, param, function (err, rows, fields) {
                if (err)
                    app.logger.error(err);
                else {
                    if (callback) callback(rows, fields);
                    connection.release();
                    //don't use the connection here, it has been returned to the pool.
                }
            });
            app.logger.debug("SQL: " + query.sql);
        }
    });
}

ConnectionPool.prototype.insert = function (table_name, param, callback) {
    var arrValues = [];
    var sqlFields;
    var sqlParam;
    for (var field in param) {
        arrValues.push(param[field]);

        if (!sqlFields)
            sqlFields = field;
        else
            sqlFields += "," + field;

        if (!sqlParam)
            sqlParam = "?";
        else
            sqlParam += ",?";
    }
    var sql = "INSERT INTO " + table_name + " (" + sqlFields + ") VALUES (" + sqlParam + ")";

    var context = this;
    this.query(sql, arrValues, function () {
        context.lastInsertId.call(context, table_name, callback);
    });
}

ConnectionPool.prototype.update = function (table_name, id_param, param, callback) {
    var arrValues = [];
    var sqlParam;
    var sqlId;
    for (var field in param) {
        arrValues.push(param[field]);

        if (!sqlParam)
            sqlParam = field + "=?";
        else
            sqlParam += ", " + field + "=?";
    }
    for (var field in id_param) {
        arrValues.push(id_param[field]);

        if (!sqlId)
            sqlId = field + "=?";
        else
            sqlId += ", " + field + "=?";
    }
    var sql = "UPDATE " + table_name + " SET " + sqlParam + " WHERE " + sqlId;
    this.query(sql, arrValues, function () {
        callback();
    });
}

ConnectionPool.prototype.delete = function (table_name, param, callback) {
    var arrValues = [];
    var sqlParam;
    for (var field in param) {
        arrValues.push(param[field]);

        if (!sqlParam)
            sqlParam = field + "=?";
        else
            sqlParam += " and " + field + "=?";
    }
    var sql = "DELETE FROM " + table_name + " WHERE " + sqlParam;
    this.query(sql, arrValues, function () {
        callback();
    });
}

ConnectionPool.prototype.lastInsertId = function (table_name, id_field_name, callback) {
    if (!callback) {
        callback = id_field_name;
        id_field_name = undefined;
    }

    this.query("SELECT MAX(" + (id_field_name || "Id") + ") AS MaxId FROM " + table_name, function (ids) {
        if (ids.length)
            callback(ids[0].MaxId);
        else
            callback(null);
    });
}

module.exports = ConnectionPool;