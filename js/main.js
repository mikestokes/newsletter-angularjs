
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
		.when("/", {templateUrl: "partials/home.html", controller: "PageCtrl"})
		.when("/redirect", {templateUrl: "partials/home.html", controller: "RedirectCtrl"})
		.otherwise("/", {templateUrl: "partials/home.html", controller: "PageCtrl"});
}]);

/**
 * Controls all other Pages
 */

app.controller('PageCtrl', function ($scope, $location, $http, $log, $window) {

	$scope.articles = [];

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
				sort: 'site',
				tag: 'list'
			}).
			success(function(data, status, headers, config) {
				$log.info('Received articles: ' + data.list);

				var list = [];
				for (var k in data.list) {
					if (data.list.hasOwnProperty(k)) {
						var item = data.list[k];
						item.sortKey = null;

						for (var t in item.tags) {
							if (item.tags.hasOwnProperty(t) && t !== 'list') {
								item.sortKey = t;
							}
						}

						if (!item.excerpt || !item.excerpt.length > 5) {
							item.excerpt = 'Enter a description...';
						}

						list.push(item);
					}
				}

				// TODO: Sort by tag (excluding list) -- groupings :)
				// e.g. Cloud, Node, JavaScript, etc...

				angular.copy(list, $scope.articles);

				$log.log($scope.articles);
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

app.directive('editInPlace', function () {
		return {
				restrict: 'E',
				scope: {
						value: '='
				},
				template: '<span ng-click="edit()" ng-bind="value"></span><input ng-model="value"></input>',
				link: function ($scope, element, attrs) {

						// Let's get a reference to the input element, as we'll want to reference it.
						var inputElement = angular.element(element.children()[1]);

						// This directive should have a set class so we can style it.
						element.addClass('edit-in-place');

						// Initially, we're not editing.
						$scope.editing = false;

						// ng-click handler to activate edit-in-place
						$scope.edit = function () {
								$scope.editing = true;

								// We control display through a class on the directive itself. See the CSS.
								element.addClass('active');

								// And we must focus the element.
								// `angular.element()` provides a chainable array, like jQuery so to access a native DOM function,
								// we have to reference the first element in the array.
								inputElement[0].focus();
						};

						element.children().bind('blur', function() {
							 $scope.editing = false;
							 element.removeClass('active');
						});

						// When we leave the input, we're done editing.
						//inputElement.prop('onblur', function () {
						//    $scope.editing = false;
						//    element.removeClass('active');
						//});
				}
		};
});
