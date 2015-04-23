/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('tutorialWebApp', [
  'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "PageCtrl"})
    .when("/redirect", {templateUrl: "partials/home.html", controller: "RedirectCtrl"})
    // Pages
    .when("/about", {templateUrl: "partials/about.html", controller: "PageCtrl"})
    .when("/faq", {templateUrl: "partials/faq.html", controller: "PageCtrl"})
    .when("/pricing", {templateUrl: "partials/pricing.html", controller: "PageCtrl"})
    .when("/services", {templateUrl: "partials/services.html", controller: "PageCtrl"})
    .when("/contact", {templateUrl: "partials/contact.html", controller: "PageCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope, $location, $http, $log) {

  $scope.signin = function () {  
    $http.post('https://hotlunch.azure-mobile.net/api/pocket/', { consumer_key:'39239-0b722d6f64189f7ea3440174' }).
      success(function(data, status, headers, config) {
        $log.info('Received code: ' + data);
        redirect(data.code, data.redirect_uri);
      }).
      error(function(data, status, headers, config) {
        $log.error('Oops error getting code');
      });
  };

  var redirect = function (code, redirect_uri) {
    var uri = 'https://getpocket.com/auth/authorize?request_token=' + code + '&redirect_uri=' + redirect_uri;
    window.location = uri;
  };

});

app.controller('RedirectCtrl', function ($scope, $location, $http, $log) {

  alert('bang');

});

