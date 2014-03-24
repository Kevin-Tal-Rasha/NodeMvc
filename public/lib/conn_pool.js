var mysql = require('mysql');

var _config;
var _pool;
var app;

var ConnectionPool = function (a, conf) {
    app = a;
    _config = conf;
    _pool = mysql.createPool(_config);
}

ConnectionPool.prototype.query = function (sql, callback) {
    app.logger.debug("SQL: " + sql);

    _pool.getConnection(function (err, connection) {
        if (err)
            app.logger.error(err);
        else {
            connection.query(sql, function (err, rows, fields) {
                if (err)
                    app.logger.error(err);
                else {
                    if (callback) callback(rows, fields);
                    connection.release();
                    //don't use the connection here, it has been returned to the pool.
                }
            });
        }
    });
}

module.exports = ConnectionPool;