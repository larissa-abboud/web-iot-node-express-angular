custApp = angular.module('angCustApp', []);

custApp.controller('CustomersListController', function($scope, $http) {

	// Relative URLs: they work whatever the server name and port are
	let URL_ALL_CUSTS  = "/getAllCustomers";
	let URL_ALL_LOCS   = "/getAllLocations";
	let URL_DEL_CUST   = "/delCustomer?id=";
	let URL_INSERT_CUST = "/insCustomer?";

	// ---- model ----
	$scope.customers = [];
	$scope.locations = [];     // used by the <select> of the add form
	$scope.message = "";

	// ---- initialization: ask the server for the data ----
	$http.get(URL_ALL_CUSTS).then(function(response) {
		$scope.customers = response.data;
	});

	$http.get(URL_ALL_LOCS).then(function(response) {
		$scope.locations = response.data;
	});

	// ---- delete ----
	$scope.deleteCustomer = function(customer) {

		if (!confirm("do you confirm that you want to delete the customer " + customer.custName + " ?")) {
			return;   // user clicked "Cancel"
		}

		$http.get(URL_DEL_CUST + customer.custId).then(
			function(response) {
				// success: remove the customer from the array -> the table updates itself
				let index = $scope.customers.indexOf(customer);
				$scope.customers.splice(index, 1);
				$scope.message = customer.custName + " deleted.";
			},
			function(response) {
				// error (e.g. the customer still has parcels)
				$scope.message = "Error: " + response.data.error;
			}
		);
	};

	// ---- add ----
	$scope.newCustomer = function() {

		let url = URL_INSERT_CUST +
		          "name=" + encodeURIComponent($scope.newName) +
		          "&locId=" + encodeURIComponent($scope.newLocId);

		$http.get(url).then(
			function(response) {
				$scope.customers.push(response.data);   // the server sends back the new customer
				$scope.message = response.data.custName + " added.";
				$scope.newName = "";
				$scope.newLocId = null;
			},
			function(response) {
				$scope.message = "Error: " + response.data.error;
			}
		);
	};
});
