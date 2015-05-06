angular.module('common.util').factory('common.util.logger', function () {

    window.logger = window.console || {
        log: function () {

        },
        warn: function () {

        },
        error: function () {

        }
    };

    return window.logger;

});

