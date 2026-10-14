rpiApp = angular.module('angRPIApp', []);

rpiApp.controller('RPIListController', function($scope, $http) {

	$scope.rpis = [];

	$http.get("/getAllRPI").then(function(response) {
		$scope.rpis = response.data;
	});
});
