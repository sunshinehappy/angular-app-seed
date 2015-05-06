(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
require('./module/');
var pta = angular.module(
    'app', ['ngRoute', 'common', 'module', 'mobile-angular-ui']);

pta.config(
    [
        '$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: './page/index.html'
        }).
        when('/user/profile', {
            templateUrl: 'page/user/profile.html'
        }).
        when('/user/profile/complete', {
            templateUrl: 'page/user/complete-user-info.html'
        }).
        when('/user/profile/verify-edit', {
            templateUrl: 'page/user/verify-code.html'
        }).
        when('/user/profile/edit', {
            templateUrl: 'page/user/edit-profile.html'
        }).
        when('/error', {
            templateUrl: 'page/error.html'
        }).
        otherwise({
            templateUrl: 'page/error.html'
        });
    }
]);

pta.run(
    [
    '$rootScope',
    '$http',
    function($rootScope,$http) {
     console.log('run');
        $http.post('http://28eleme.test:8080/mockjs/1/login', {
            action:123
        }).then(function(response) {
            console.info(response.data);
        });
    }
]);

},{"./module/":2}],2:[function(require,module,exports){
require('./user/');
angular.module(
	'module',['module.user']
);

},{"./user/":4}],3:[function(require,module,exports){
module.exports = [
    '$scope',
    'service.user',
    function($scope, userSvr) {
        console.log('user info controller');
        $scope.bla = function() {
            console.log('bla is clicked');
            userSvr.test();
        };
    }
];
},{}],4:[function(require,module,exports){
angular.module(
	'module.user',[]
).controller(
	'controller.user.info',require('./controller/info')
).factory(
	'service.user',require('./service')
);

},{"./controller/info":3,"./service":5}],5:[function(require,module,exports){
module.exports = [
    'common.component.storage',
    'common.util.http',
    function(storage, http) {
        var service = {
            test: function() {
                storage.set('x', [5, 6, 7, 8, 9]).then(function() {
                    console.log('storage ok');
                }, function() {
                    console.log('storage error');
                });
            },
            register: function() {

            },
            getProfile: function() {

            }
        };
        return service;
    }
];
},{}]},{},[1])


//# sourceMappingURL=app.bundler.js.map