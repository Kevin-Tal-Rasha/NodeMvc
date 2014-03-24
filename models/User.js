var _conn;
var User = function (conn) { _conn = conn };

User.prototype.Save = function () {
    _conn.query("update userinfo set name = '张 三1' where id = 1");
}

User.prototype.Get = function (callback) {
    //return [
    //    { Id: 1, Name: "张 三" },
    //    { Id: 2, Name: "李 四" },
    //    { Id: 3, Name: "王 五" }
    //];
    _conn.query("select * from userinfo", function (rows) {
        callback(rows);
    });
}

module.exports = User;
