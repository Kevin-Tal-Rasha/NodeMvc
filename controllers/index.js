exports.load = function () {
    this.req.session.User = "admin";
	return {
		link : "MyModule/default"
	};
}
