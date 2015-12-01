/*global require, angular, console, module, confirm */
module.exports = function () {
    'use strict';
    angular.module('keyApp')
        .constant('apiUrl', '/api/');

    angular.module('keyApp')
        .factory('Projects', ['$http', 'apiUrl',
            function ($http, apiUrl) {
                return {
                    get: function () {
                        var promise = $http.get(apiUrl + 'active').then(function (response) {
                            return response.data;
                        });
                        return promise;
                    }
                };
            }]);

};