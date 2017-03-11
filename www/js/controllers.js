angular.module('starter.controllers', ['starter.services'])

.controller('RenamerCtrl', function($scope, Show) {

	$scope.items = [];

	var item = { name:"Colony.S01E05.FRENCH.HDTV.Xvid-EXTREME.avi", realname:"", fullname: "" };
	var item_1 = { name:"Colony.S01E06.FRENCH.HDTV.Xvid-EXTREME.avi", realname:"", fullname: "" };
	
	$scope.items.push(item);
	$scope.items.push(item_1);
  
	$scope.loadFiles = function() {
		console.log("loadFiles");
	};
	  
	$scope.renameFiles = function() {
		
		var items = [];
		
		// get the name from the list
		angular.forEach($scope.items, function(value, key) {
			
			// get the name of the show
			var realnameShow = Show.getTest(value.name);

			realnameShow.then(

          function(response) { 

              	var item = { name:value.name, realname:response.data, fullname: "" };			
			items.push(item);

          },

          function(response) {

              console.log('error', response.error);

          });

			
		
        });
		
		$scope.items = items;
	};
})

.controller('OptionsCtrl', function($scope) {});
