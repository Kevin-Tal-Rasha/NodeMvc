var timer = require("timers");
var User = require("../../models/User.js");

exports.load = function (callback) {
    var req = this.req;
    var conn = this.app.dbPool;

    new User(conn).Get(function (users) {
        callback({ userList: users, msg: req.query.a || 11 });
    });
    //return { userList: new User(conn).Get(), msg: req.query.a || 11 }
}

exports.saveUser = function () {
    var user = new User(this.app.dbConnection);
    return user.Save();
}

exports.ajaxTest = function (id, name, callback) {
    var req = this.req;
    this.app.logger.info("ajax test running");

    timer.setTimeout(function () {
        callback({
            session: req.session.User,
            id: id,
            name: [{ n: name }, 1, 2]
        });
    }, 2000);
}

//exports.ajaxTest = function (id, name) {
//    var req = this.req;
//    var res = this.res;

//    return {
//        session: req.session.HelloWorld,
//        id: id,
//        name: [{ n: name }, 1, 2]
//    };
//}