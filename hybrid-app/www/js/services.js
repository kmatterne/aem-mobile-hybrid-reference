angular.module('hybridapp.services', [])

    .constant('appConfig', {
        manifestFileName: 'pge-content-packages.json'
    })

    .factory('appManifest', ['appConfig', function (appConfig) {

        var appManifestData = null;

        var readAndCacheManifestData = function (callback) {
            if (appManifestData) {
                return callback(null, appManifestData);
            }

            CQ.mobile.contentUtils.getJSON(appConfig.manifestFileName,
                function (error, data) {
                    if (error) {
                        return callback(error);
                    }
                    appManifestData = data;
                    return callback(null, appManifestData)
                }
            );
        };

        return {
            getData: readAndCacheManifestData
        }
    }])

    .factory('appState', [function () {
        var _auth;

        return {
            setAuth: function (auth) {
                _auth = auth;
            },
            getAuth: function () {
                return _auth;
            }
        }
    }])


    .config(function ($httpProvider) {
        $httpProvider.interceptors.push("AEMAuthInterceptor");
    })

    .factory('AEMAuthInterceptor', ['appState', function (appState) {
        return {
            request: function (config) {
                if (appState.getAuth() && appState.getAuth().getToken()) {
                    if (appState.getAuth() instanceof cq.mobileapps.auth.BasicAuth) {
                        config.headers.Authorization = "Basic " + appState.getAuth().getToken();
                    } else {
                        config.headers.Authorization = "Bearer " + appState.getAuth().getToken();
                    }
                }
                return config;
            }
        }
    }])

    .factory('AEMcsrfToken', ['$http', function($http) {
        var tokenPath = '/libs/granite/csrf/token.json';

        var requestToken = function(hostURL, callback) {
            var requestURI = hostURL + tokenPath;
            $http.get(requestURI).then(function(response) {
                callback(response.data.token);
            });
        };

        return {
            getToken : requestToken
        }
    }])
;


    