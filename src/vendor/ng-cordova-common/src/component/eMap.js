angular.module('common.component').factory('common.component.eMap',
    [
    'common.util.wgs2mars',
    'common.util.core',
    'common.util.device',
    'common.util.logger',
    '$q',
    '$http',
    function (wgs2mars, core, device, logger, Q, $http) {

        // Geolocation 定位设置
        var SET_PARAMS = {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true};
        // 默认设置：该设置不需要开放 zoom: 地图缩放级别 radius: 圆形覆盖半径
        var MAP_SETINGS = {zoom: 13, radius: 2000, strokeColor: 'rgba(150, 219, 94, 1)', fillColor: 'rgba(150, 219, 94, 0.59)'};
        var mapObj, marker, circle;

        // 初始化Amap
        function __initAmap(callback) {
            if (typeof AMap === 'undefined') {
                //jquery版本
                // $$.getJSON('http://webapi.amap.com/maps?v=1.3&key=d7fbf96818d5ca13faa47c9993951f9a' + '&callback=theFunctionName', {}, callback);
                
                // javascript版本
                window.onloadAMap = function () {
                    core.safeRun(callback);
                };
                var url = 'http://webapi.amap.com/maps?v=1.3&key=d7fbf96818d5ca13faa47c9993951f9a&callback=onloadAMap';
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                // script.onerror = function () {};
                // script.onload = function () {};
                document.querySelector('head').appendChild(script);
            } else {
                core.safeRun(callback);
            }
        }

        // 初始化地图对象，加载地图
        function __map(domId, location, zoom) {
            var deferred = Q.defer();
            __initAmap(function () {
                mapObj = new AMap.Map(domId, {
                        //二维地图显示视口
                        view: new AMap.View2D({
                            center: new AMap.LngLat(location.lng, location.lat),//地图中心点
                            zoom: zoom //地图显示的缩放级别
                        })
                    });
                console.log(mapObj);
                deferred.resolve(location);
            });
            return  deferred.promise;
        }

        // 逆编码
        function __geocoder(location, success_callback, error_callback) {
            __initAmap(function () {
                var lnglatXY = new AMap.LngLat(location.lng, location.lat);
                var MGeocoder;
                //加载地理编码插件
                AMap.service(['AMap.Geocoder'], function () {
                    MGeocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: 'all'
                    });
                    //逆地理编码
                    MGeocoder.getAddress(lnglatXY, function (status, result) {
                        // alert('成功调用逆地理编码');
                        if (status === 'complete' && result.info === 'OK') {
                            var ret = {
                                    message: '表示定位结果',
                                    code: 161,
                                    addr: result.regeocode.formattedAddress,
                                    coords: {
                                            radius: location.radius,
                                            longitude: location.lng,
                                            latitude: location.lat
                                        }
                                    };
                            if (typeof device !== 'undefined') {
                                ret.device = device;
                            } else {
                                ret.device = {type: 'brower'};
                            }
                            core.safeRun(success_callback, ret);
                        } else {
                            core.safeRun(error_callback, '未找到匹配地址');
                        }
                    });
                });
            });
        }

        // Location 定位
        function __geoLocation() {
            var deferred = Q.defer();
            var location = {};
            if (!device.isPhonegap() || device.isIOS()) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                    function (position) {
                        var gcjloc = wgs2mars.transformFromWGSToGCJ(position.coords.longitude, position.coords.latitude);
                        var location = {lng: parseFloat(gcjloc.lng.toFixed(7)), lat: parseFloat(gcjloc.lat.toFixed(7)), radius: parseFloat(position.coords.accuracy.toFixed(2))};
                        deferred.resolve({code: 1, msg: '获取地理定位成功', location: location});
                    },
                    function (error) {
                        console.log(error);
                        var errorMsg;
                        switch (error.code) {
                        case 1:
                            errorMsg = '您拒绝了系统定位的权限申请';
                            break;
                        case 2:
                            errorMsg = '无法获取到您所在的地理位置信息';
                            break;
                        case 3:
                            errorMsg = '获取地理位置信息超时';
                            break;
                        default:
                            errorMsg = '未知错误';
                            break;
                        }
                        deferred.reject({code: 0, msg: errorMsg, location: location });
                    },
                    SET_PARAMS);
                } else {
                    deferred.reject({code: 0, msg: '无法获取到您所在的地理位置信息', location: location});
                }
            }

            if (device.isAndroid()) {
                //通过百度sdk来获取经纬度,并且alert出经纬度信息
                var noop = function () {};
                window.plugins.locationService.getCurrentPosition(function (position) {
                    if (typeof device !== 'undefined') {
                        position.device = device;
                    } else {
                        position.device = {type: 'brower'};
                    }
                    var location = {lng: parseFloat(position.coords.longitude.toFixed(7)), lat: parseFloat(position.coords.latitude.toFixed(7)), radius: parseFloat(position.coords.radius.toFixed(2))};
                    deferred.resolve({code: 1, msg: '获取地理定位成功', location: location});
                    deferred.reject(position);
                    window.plugins.locationService.stop(noop, noop);
                }, function (e) {
                    deferred.reject({code: 0, msg: e.message, location: location});
                    window.plugins.locationService.stop(noop, noop);
                });
            }

            return deferred.promise;
        }

        // 绘制定位中心点
        function __marker(location) {
            var deferred = Q.defer();
            __initAmap(function () {
                marker = new AMap.Marker({
                        icon: "http://webapi.amap.com/images/marker_sprite.png",
                        position: new AMap.LngLat(location.lng, location.lat)
                    });
                marker.setMap(mapObj);  //在地图上添加点
                deferred.resolve(location);
            });
            return deferred.promise;
        }

        //添加圆形覆盖
        function __addCircle(location, radius) {
            var deferred = Q.defer();
            __initAmap(function () {
                circle = new AMap.Circle({ 
                    center: new AMap.LngLat(location.lng, location.lat),// 圆心位置
                    radius: radius, //半径
                    strokeColor: MAP_SETINGS.strokeColor, //线颜色
                    strokeOpacity: 1, //线透明度
                    strokeWeight: 2, //线粗细度
                    fillColor: MAP_SETINGS.fillColor, //填充颜色
                    fillOpacity: 0.35//填充透明度
                });
                circle.setMap(mapObj);
                deferred.resolve(location, radius);
            });
            return deferred.promise;
        }

        var eveMap = {

            /**
             *  获取地理位置
             *  success_callback, error_callback
             **/
            getLocation: function (success_callback, error_callback) {
                try {
                    if (!device.isPhonegap() || device.isIOS() || device.isAndroid()) {
                        __geoLocation().then(
                            function (ret) {
                                if (ret.code) {
                                    __geocoder(ret.location, success_callback, error_callback);
                                }
                            }, function (ret) {
                                core.safeRun(error_callback, ret.msg);
                            }
                        );
                    }
                } catch (e) {
                    logger.error(e.message, e.stack);
                    core.safeRun(error_callback, i18n.error.unknown_error);
                }
            },

            /**
             * 绘制带(定位 + 圆形覆盖)地图
             *  domId: html id (必须)
             *  success_callback, error_callback
             **/
            addMarker: function (domId, success_callback, error_callback) {
                try {
                    if (!device.isPhonegap() || device.isIOS() || device.isAndroid()) {
                        // 定位
                        __geoLocation().then(
                        function (ret) {
                            if (ret.code) {
                                // 初始化地图
                                __map(domId, ret.location, MAP_SETINGS.zoom).then(function (location) {
                                    // 绘制中心点
                                    __marker(location).then(
                                        function (location) {
                                            // 绘制圆形覆盖
                                            __addCircle(location, MAP_SETINGS.radius).then(function (location, radius) {
                                                core.safeRun(success_callback, location, MAP_SETINGS);
                                            });
                                        });
                                });
                            }
                        }, function (ret) {
                            core.safeRun(error_callback, ret.msg);
                        });
                    }
                } catch (e) {
                    console.log(e.message, e.stack);
                    core.safeRun(error_callback, i18n.error.unknown_error);
                }
            },
            
            /**
             * 更新圆形
             * location
             * radius: 半径/米
             **/
            updateCircle: function (location, radius) {
                try {
                    // 地图绘制失败
                    if (typeof AMap === 'undefined') return;
                    //新圆形属性
                    var circleoptions = {
                        center: new AMap.LngLat(location.lng, location.lat), //新圆心位置
                        radius: radius, //新半径
                        strokeColor: MAP_SETINGS.strokeColor, //线颜色
                        strokeOpacity: 1, //线透明度
                        strokeWeight: 2, //线粗细度
                        fillColor: MAP_SETINGS.fillColor, //填充颜色
                        fillOpacity: 0.35 //填充透明度
                    };
                    circle.setOptions(circleoptions); //更新圆属性
                    var zoom = 0;
                    if (radius >= 0 && radius <= 1000) {
                        zoom = 14;
                    } else if (radius > 1000 && radius <= 2500) {
                        zoom = 13;
                    } else if (radius > 2500 && radius <= 5000) {
                        zoom = 12;
                    } else if (radius > 5000 && radius <= 8000) {
                        zoom = 11;
                    } else {
                        zoom = 10;
                    }
                    mapObj.setZoomAndCenter(zoom, new AMap.LngLat(location.lng, location.lat));
                } catch (e) {
                    console.log(e.message, e.stack);
                }
            }
        };

        return eveMap;
    }
]);
