/**
 * config service
 */

angular.module("common").factory('common.config', function() {

    var config = {
        auth_expire : 60 * 24 * 60, /*60 days*/
        version : 'Test',
        release_time : 'Test',
        // xinge notification:
        xinge_access_id : '2100054419',
        xinge_access_key : 'A88UQ5P3F7DM'
    };

    if (typeof window.local_config === 'object') {
        for (var attr in window.local_config) {
            config[attr] = window.local_config[attr];
        }
    }

    return config;

});
