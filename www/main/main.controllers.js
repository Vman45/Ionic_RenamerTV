(function() {
    'use strict';
	
	angular.module('starter.main', ['starter.services.show', 'starter.services.freebox'])
	
	.controller('RenamerCtrl', function($scope, Show, Freebox) {

		$scope.user = {};
		$scope.items = [];

		$scope.loadFiles = function() {

			var session_token = localStorage.getItem('session_token');
		
			if(session_token !== null) {
				$scope.user.session_token = session_token;		

				Freebox.list($scope.user.session_token).then(function(data) {
					var items = [];
					
					angular.forEach(data.result, function(value, key) {
						
						if(value.type === 'file') {
							var item = { name: value.name, realname: "", fullname: value.path };			
							items.push(item);			
						}
					});
					
					$scope.items = items;
				}).catch(function(data) {
					window.location.href = '#/tab/options';
				});
			} else {
				window.location.href = '#/tab/options';
			}
		};
		  
		$scope.matchFiles = function() {
			
			if($scope.items.length != 0) {
				var items = [];
				
				// get the name from the list
				angular.forEach($scope.items, function(value, key) {
					
					Show.getRealNameShow(value.name).then(function(data) {
						var realnameShow = data.name + ' - ' + data.season + 'x' + data.episode + ' - ' + data.title + data.extension;

						var item = { name: value.name, realname: realnameShow, fullname: value.fullname, img: data.image };			
						items.push(item);			
					});
				});
				
				$scope.items = items;
			}
		};
		
		$scope.renameFiles = function() {
			if($scope.items.length != 0) {
				var items = [];
				
				// get the name from the list
				angular.forEach($scope.items, function(value, key) {
					
					Freebox.renameFile(value.fullname, value.realname, $scope.user.session_token).then(function(data) {

						var item = { name: value.name, realname: value.realname, fullname: value.fullname };

						if(data.success) {
							item = { name: value.realname, realname: ';)', fullname: value.fullname, img: value.img };
						}

						items.push(item);			
					});
				});
				
				$scope.items = items;
			}
		};
	});
})();