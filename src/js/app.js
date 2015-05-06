'use strict';
require('./module/');
var app = angular.module(
    'app', ['ngRoute','ngRap', 'common', 'module', 'mobile-angular-ui']
);

app.config(
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

app.run(
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
