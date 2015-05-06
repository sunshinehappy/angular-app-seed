angular.module(
	'module.user',[]
).controller(
	'controller.user.info',require('./controller/info')
).factory(
	'service.user',require('./service')
);
