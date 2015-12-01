/*global require, angular, console, module, confirm */
module.exports = function () {
    'use strict';

    angular.module('keyApp', [
        'ngRoute',
        'ngMessages',
        'ngCookies'
    ]);

    angular.module('keyApp')
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider.
                    when('/', {
                        templateUrl: 'pages/reg_form.html',
                        controller: 'DefaultCtrl',
                        name: 'activate'
                    }).
                    when('/restore', {
                        templateUrl: 'pages/rest_form.html',
                        controller: 'DefaultCtrl',
                        name: 'restore'
                    }).
                    otherwise({
                        redirectTo: '/'
                    });
            }]);

    angular.module('keyApp')
        .controller('DefaultCtrl', ['$scope', '$http', '$location', 'Projects', 'SentTime', '$timeout', 'apiUrl', '$route',
            function ($scope, $http, $location, Projects, SentTime, $timeout, apiUrl, $route) {
                var route = $route.current.$$route.name;
                $scope.showModel = {
                    dataSend: false
                };
                $scope.regModel = {};
                
                $scope.showModel.timeleft = SentTime.check();

                $timeout(function () {
                    $scope.showModel.timeleft = 0;
                }, $scope.showModel.timeleft);

                Projects.get().then(function (data) {
                    $scope.showModel.projects = data;
                    //                $scope.model.cproj = $scope.model.projects[0].id;
                });

                $scope.Submit = function () {
                    if ($scope.regForm.$invalid) {
                        angular.forEach($scope.regForm.$error, function (field) {
                            angular.forEach(field, function (errorField) {
                                errorField.$setTouched();
                            });
                        });
                    } else {
                        SentTime.set();
                        $http.post(apiUrl + route, $scope.regModel).then(
                            function (data) {
                                $scope.showModel.status = data.status;
                            },
                            function (error) {
                                console.log('error');
                                $scope.showModel.status = error.status;
                                console.log(error);
                            }
                        );
                        $scope.showModel.dataSend = true;
//                        $location.path('/sent');
                    }
                };
            }]);
    
    angular.module('keyApp')
        .factory('SentTime', ['$cookies',
            function ($cookies) {
                return {
                    timeout: 20000,
                    set: function () {
                        $cookies.time = Date.now() + this.timeout;
                    },
                    check: function () {
                        var left = 0;
                        if ($cookies.time !== undefined) {
                            left = $cookies.time - Date.now();
                            left = left > 0 ? left : 0;
                        }
                        return left;
                    }
                };
            }]);
};