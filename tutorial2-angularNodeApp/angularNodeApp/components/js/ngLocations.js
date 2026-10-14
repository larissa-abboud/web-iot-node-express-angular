locApp = angular.module('angLocApp', []);

locApp.controller('LocationsListController',  function($scope, $http) {
	
	let URL_ALL_LOCS = "/getAllLocations";
	let URL_INSERT_LOC = "/insLocation?";
    
	$scope.locations = [];
			
	$http.get(URL_ALL_LOCS).then(function(response) {
	
      $scope.locations =  response.data;
	  
    });
	
	$scope.newLocation = function() {
		let newRawLoc = {};
		let newLoc ={};
		$http.get(URL_INSERT_LOC + `newAddress=${$scope.newAddress}&newCity=${$scope.newCity}`)
			.then(function (response) {
				newRawLoc = response.data;
				
				newLoc = {"locId": newRawLoc.id, "locAddress": newRawLoc.address, 
									"city": newRawLoc.city};
		

				$scope.locations.push(newLoc);
			});
	}
});

