angular.module("common.util").factory('common.util.http',
    [
        '$http',
        '$q',
        function ($http, $q) {

            var myQ = function (func) {
                var deferred = $q.defer();
                try {
                    func(deferred.resolve, deferred.reject);
                } catch (e) {
                    deferred.reject(e);
                }
                return deferred.promise;
            };

            function parse_http_data (data) {
                if (typeof data !== 'object') {
                    return null;
                }
                var keys = [];
                for (var key in data) {
                    keys.push(key);
                }
                keys.sort(function (a, b) {
                    return a.localeCompare(b);
                });

                var str = [];
                keys.forEach(function (e) {
                    str.push(encodeURIComponent(e) + "=" + encodeURIComponent(data[e]));
                });
                return str.join("&");
            }

            function config_http_options (options) {
                if (!options) {
                    return http.options;
                }
                var defaults = angular.copy(http.options);
                var defaultHeaders = angular.copy(defaults.headers);
                angular.extend(defaults, options);
                if (options.headers) {
                    angular.extend(defaultHeaders, options.headers);
                    defaults.headers = defaultHeaders;
                }
                if (typeof defaults.requestIntercept !== 'function') {
                    defaults.requestIntercept = http.defaults.requestIntercept;
                }
                if (typeof defaults.responseIntercept !== 'function') {
                    defaults.responseIntercept = http.defaults.responseIntercept;
                }
                if (typeof defaults.errorIntercept !== 'function') {
                    defaults.errorIntercept = http.defaults.errorIntercept;
                }
                return defaults;
            }

            var http = function (options) {

                return $q.when(options).then(options.requestIntercept).then(function (options) {
                    if (options.local === true) {
                        options.method = 'GET';
                    } else {
                        options.url = options.origin + options.url;
                    }
                    if (options.method == 'PUT' || options.method == 'POST') {
                        options.data = parse_http_data(options.data);
                    }
                    options.headers.HTTP_TIMESTAMP = Date.now();
                    return options;
                }).then($http).then(options.responseIntercept).catch(options.errorIntercept);

            };

            http.get = function (relativeUrl, config) {
                var options = config_http_options(config);
                options.method = 'GET';
                options.url = relativeUrl;
                return http(options);
            };
            http.delete = function (relativeUrl, config) {
                var options = config_http_options(config);
                options.method = 'DELETE';
                options.url = relativeUrl;
                return http(options);
            };
            http.post = function (relativeUrl, data, config) {
                var options = config_http_options(config);
                options.method = 'POST';
                options.url = relativeUrl;
                options.data = data;
                return http(options);
            };
            http.put = function (relativeUrl, data, config) {
                var options = config_http_options(config);
                options.method = 'PUT';
                options.url = relativeUrl;
                options.data = data;
                return http(options);
            };

            //原始 的 配置
            http.defaults = {
                requestIntercept: function (request) {
                    return request;
                },
                responseIntercept: function (response) {
                    return response;
                },
                errorIntercept: function (err) {
                    return $q.reject(err);
                }
            };

            http.options = {
                timeout: 7000,
                requestIntercept: http.defaults.requestIntercept,
                responseIntercept: http.defaults.responseIntercept,
                errorIntercept: http.defaults.errorIntercept,
                origin: '',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    HTTP_SIGNATURE: 'not_implemented'
                }
            };

            http.config = function (options) {
                http.options = config_http_options(options);
            };

            return http;

        }
    ]
);
