/*global require, angular, console, module */
module.exports = function () {
    'use strict';
    angular.module('keyApp', [
        'ngRoute',
        'ngResource',
        'ngCookies'
    ]);


    angular
        .module('keyApp')
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider.
                    when('/login', {
                        templateUrl: 'pages/login.html',
                        controller: 'MainCtrl'
                    }).
                    when('/keys', {
                        templateUrl: 'pages/codes.html',
                        controller: 'ListCtrl',
                        name: 'keys'
                    }).
                    when('/codes', {
                        templateUrl: 'pages/codes.html',
                        controller: 'ListCtrl',
                        name: 'codes'
                    }).
                    when('/information', {
                        templateUrl: 'pages/information.html',
                        controller: 'ListCtrl',
                        name: 'information'
                    }).
                    when('/projects', {
                        templateUrl: 'pages/projects.html',
                        controller: 'ListCtrl',
                        name: 'projects'
                    }).
                    when(
                        '/projects/new',
                        {
                            controller: 'ProjectNewCtrl',
                            templateUrl: 'pages/proj.edit.html'
                        }
                    ).
                    when(
                        '/codes/add',
                        {
                            controller: 'CodeAddCtrl',
                            templateUrl: 'pages/code.edit.html',
                            name: 'codes'
                        }
                    ).
                    when(
                        '/keys/add',
                        {
                            controller: 'CodeAddCtrl',
                            templateUrl: 'pages/code.edit.html',
                            name: 'keys'
                        }
                    ).
                    when(
                        '/projects/edit/:id',
                        {
                            controller: 'ProjEditCtrl',
                            templateUrl: 'pages/proj.edit.html'
                        }
                    ).
                    otherwise({
                        redirectTo: '/projects'
                    });
            }]);
};