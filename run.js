var server = require("./public/lib/server.js");
server.start({
    port: 3237,
    title: "TSDN - 东忠最具权威技术网站",
    startPage: "index",
    ajaxTimeout: 30, //seconds
    db: {
        host: "localhost",
        user: "root",
        password: "root",
        database: "tp_home",
        port: 3306
    },
    logger: {
        level: "AUTO",  //set "ERROR" for publish, AUTO for debug
        appenders: [
			{ type: "console" },
            {
            	type: "dateFile",
            	filename: "public/logs/nodejs",
            	pattern: " yyyy-MM-dd.log",
            	alwaysIncludePattern: true
            }
        ],
        replaceConsole: true
    }
});