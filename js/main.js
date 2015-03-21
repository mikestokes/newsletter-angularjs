
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
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope, $location, $http, $log, $window) {

  var consumer_key = '39239-0b722d6f64189f7ea3440174';

  $scope.signin = function () {
    $http.post('https://hotlunch.azure-mobile.net/api/pocket/code', { consumer_key: consumer_key }).
      success(function(data, status, headers, config) {
        $log.info('Received code: ' + JSON.stringify(data));
        window.localStorage.setItem('consumer_key', consumer_key);
        window.localStorage.setItem('code', data.code);
        redirect(data.code, data.redirect_uri);
      }).
      error(function(data, status, headers, config) {
        $log.error('Oops error getting code');
      });
  };

  var redirect = function (code, redirect_uri) {
    var loginWindow = $window.open('https://getpocket.com/auth/authorize?request_token=' + code + '&redirect_uri=' + redirect_uri);
    loginWindow.onbeforeunload = function () {
      getPocketArticles();
    };
  };

  var getPocketArticles = function () {

    $http.post('https://hotlunch.azure-mobile.net/api/pocket/getlist', {
        consumer_key: consumer_key,
        access_token: window.localStorage.getItem('access_token'),
        state: 'all',
        detailType: 'complete',
        sort: 'site'//,
        //tag: 'list',
        //favorite: '1'
      }).
      success(function(data, status, headers, config) {
        $log.info('Received articles: ' + data);

      }).
      error(function(data, status, headers, config) {
        $log.error('Oops error gettings your Pocket articles');
      });
  };

});

app.controller('RedirectCtrl', function ($scope, $location, $http, $log, $window, $timeout) {

  var consumer_key = window.localStorage.getItem('consumer_key'),
      code = window.localStorage.getItem('code');

  $http.post('https://hotlunch.azure-mobile.net/api/pocket/token', { consumer_key: consumer_key, code: code }).
      success(function(data, status, headers, config) {
        $log.info('Received code: ' + JSON.stringify(data));
        window.localStorage.setItem('access_token', data.access_token);
        window.localStorage.setItem('username', data.username);

        $timeout(function() {
          $window.close();
        }, 1000);
      }).
      error(function(data, status, headers, config) {
        $log.error('Oops error getting token');
      });

});

