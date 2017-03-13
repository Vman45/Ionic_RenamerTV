angular.module('starter.controllers', ['starter.services'])

.controller('RenamerCtrl', function($scope, Show, Freebox) {

	$scope.user = {};
	$scope.items = [];

	$scope.loadFiles = function() {
		// debug 
		$scope.user.session_token = '6yAcAvmY2g37VoT1Zme5+OSNLuLijWCWWZRi4xtHVyj8+VhVYZn0rC3gWozZF/0D';
		
		console.log("session_token", $scope.user.session_token);
		Freebox.list($scope.user.session_token).then(function(data) {
			console.log("list", data);
			
			var items = [];
			
			angular.forEach(data.result, function(value, key) {
				
				if(value.type === 'file') {
					var item = { name: value.name, realname: "", fullname: value.path };			
					items.push(item);			
				}
			});
			
			$scope.items = items;
		});
	};
	  
	$scope.matchFiles = function() {
		
		if($scope.items.length != 0) {
			var items = [];
			
			// get the name from the list
			angular.forEach($scope.items, function(value, key) {
				
				Show.getRealNameShow(value.name).then(function(data) {
					var realnameShow = data.name + ' - ' + data.season + 'x' + data.episode + ' - ' + data.title + data.extension;

					var item = { name: value.name, realname: realnameShow, fullname: value.fullname };			
					items.push(item);			
				});
			});
			
			$scope.items = items;
		}
	};
	
	$scope.renameFiles = function() {
		console.log("renameFiles", $scope.items.length);
		
		if($scope.items.length != 0) {
			var items = [];
			
			// get the name from the list
			angular.forEach($scope.items, function(value, key) {
				
				Freebox.renameFile(value.fullname, value.realname, $scope.user.session_token).then(function(data) {

					var item = { name: value.name, realname: value.realname, fullname: value.fullname };

					if(data.success) {
						item = { name: 'OK', realname: value.realname, fullname: value.fullname };
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

	$scope.auth = function() {
		// Demande d'authentification
		Freebox.auth().then(function(data) {
			console.log("auth", data.track_id);
			console.log("auth", data.token);

			if(data.success) {
				$scope.status = 'pending';
				$scope.user.app_token = data.token; // à stocker (Storage)
				$scope.user.track_id = data.track_id;
				$scope.user.auth = 'true';
			}
		});
	};
	
	$scope.authOK = function() {
		// Valide l'authentification après validation sur la Freebox
		Freebox.authOK($scope.user.track_id).then(function(data) {
			console.log("authOK", data.success);
			
			if(data.success) {
				$scope.status = data.status;
				$scope.user.auth = 'true';
				$scope.user.challenge = data.challenge;
				$scope.user.confirm = data.status;
				
				// debug
				$scope.user.app_token = '3DnimC6tCpL7+4WM3lanek13RM+jGLWyHTmFXAElZYdBHIpBNZxpeZZKmPwBe3Xj';

				// Inverser le challenge et app_token, la documentation est fausse
				var password = CryptoJS.HmacSHA1($scope.user.challenge, $scope.user.app_token);

				Freebox.openSession(password.toString()).then(function(data) {
					console.log("openSession", data.success);
					
					if(data.success) {
						$scope.user.session_token = data.token;
					}
				});				
			}
		});
	};

	$scope.logout = function() {
		console.log("logout");
		
		$scope.user = {};
		$scope.status = null;
	
		// Déconnection de la Freebox
		Freebox.logout().then(function(data) {
			console.log("logout", data.success);
		});
	};

	$scope.test = function() {
		console.log("test");
	};	
});
