angular.module('starter.controllers', ['starter.services', 'ngCordova'])

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
})

.controller('OptionsCtrl', function($scope, Freebox) {
	
	$scope.user = {};
	$scope.status = null;
	
	var track_id = localStorage.getItem('track_id');
	var session_token = localStorage.getItem('session_token');
	
	$scope.auth = function() {
		// Demande d'authentification
		Freebox.auth().then(function(data) {
			console.log("auth", data.track_id);
			console.log("auth", data.token);

			if(data.success) {
				$scope.status = "Veuillez confirmer sur l'écran de la Freebox";
				$scope.user.app_token = data.token;
				$scope.user.track_id = data.track_id;
				$scope.user.auth = 'true';
				localStorage.setItem('track_id', data.track_id);
				localStorage.setItem('app_token', data.token);
			}
		});
	};
	
	$scope.authOK = function() {
		// Valide l'authentification après validation sur la Freebox
		Freebox.authOK($scope.user.track_id).then(function(data) {
			console.log("authOK", data.success);
			
			if(data.success) {
				$scope.status = 'Connecté';
				$scope.user.auth = 'true';
				$scope.user.challenge = data.challenge;
				$scope.user.confirm = data.status;
				
				// Inverser le challenge et app_token, la documentation est fausse
				var password = CryptoJS.HmacSHA1($scope.user.challenge, $scope.user.app_token);

				Freebox.openSession(password.toString()).then(function(data) {
					console.log("openSession", data.success);
					
					if(data.success) {
						$scope.user.session_token = data.token;
						localStorage.setItem('session_token', data.token);
					}
				});				
			}
		});
	};
});
