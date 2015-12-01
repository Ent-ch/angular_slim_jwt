/*global require, angular, console, module */
module.exports = function () {
    'use strict';
    angular.module('keyApp')
        .factory('ApiRestService', ['$resource', 'apiUrl', '$http', 'AuthService',
            function ($resource, apiUrl, $http, AuthService) {
                $http.defaults.headers.common['Auth'] = AuthService.getToken();
                var rest = $resource(
                    apiUrl + 'back/:chap/:id',
                    {
                        chap: '',
                        id: ''
                    },
                    {
                        update: {
                            method: 'PUT'
                        }
                    }
                );
                return rest;
            }]);

    angular.module('keyApp')
        .factory('AuthService', ['$resource', 'apiUrl', '$http', '$cookies',
            function ($resource, apiUrl, $http, $cookies) {
                var fact;
                fact = {
                    token: false,
                    authorized: function () {
                        if (!this.getToken()) {
                            return false;
                        }
                        return true;
                    }, 
                    login: function (name, pass) {
                        var promise;
                        promise = $http.post(apiUrl + 'login', {uname: name, upass:pass}).then(
                            function (data) {
                                // console.log('ok login post');
                                // console.log(data.data.token);
                                fact.token = data.data.token;
                                $cookies.token = fact.token;
                            }
                        );
                        return promise;
                    },
                    getToken: function () {
                        var token = fact.token;
                        if (!token && $cookies.token) {
                            token = $cookies.token;
                        } 
                        // console.log(token);
                        return token;
                    },
                    logout: function () {
                        fact.token = false;
                        $cookies.token = '';
                    }
                };
                return fact;
            }]);

};