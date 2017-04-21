(function () {
	'use strict';

	angular.module('starter.options', ['starter.services.freebox'])

	.controller('OptionsCtrl', function ($scope, Freebox) {

		$scope.user = {};
		$scope.status = "Veuillez-vous authentifier !";

		var track_id = localStorage.getItem('track_id');
		var app_token = localStorage.getItem('app_token');
		var session_token = localStorage.getItem('session_token');

		// Verifier si on est connecté seulement si on s'est déjà identifié
		if (app_token !== null && track_id !== null) {
			Freebox.authOK(track_id).then(function (data) {
				if (data.success) {
					$scope.user.challenge = data.challenge;
					$scope.user.confirm = data.status;

					// Inverser le challenge et app_token, la documentation est fausse
					var password = CryptoJS.HmacSHA1($scope.user.challenge, app_token);

					Freebox.openSession(password.toString()).then(function (data) {
						if (data.success) {
							$scope.status = 'Connecté';
							$scope.user.auth = 'true';

							$scope.user.session_token = data.token;
							localStorage.setItem('session_token', data.token);
						}
					}).catch (function (data) {
						$scope.status = "L'application a été revoquée, veuillez-vous identifier !";
					});
				}
			});
		}

		$scope.auth = function () {
			// Demande d'authentification
			Freebox.auth().then(function (data) {
				if (data.success) {
					$scope.status = "Veuillez confirmer sur l'écran de la Freebox";
					$scope.user.app_token = data.token;
					$scope.user.track_id = data.track_id;
					$scope.user.auth = 'true';
					localStorage.setItem('track_id', data.track_id);
					localStorage.setItem('app_token', data.token);
				}
			});
		};

		$scope.authOK = function () {
			// Valide l'authentification après validation sur la Freebox
			Freebox.authOK($scope.user.track_id).then(function (data) {
				if (data.success) {
					$scope.user.challenge = data.challenge;
					$scope.user.confirm = data.status;

					// Inverser le challenge et app_token, la documentation est fausse
					var password = CryptoJS.HmacSHA1($scope.user.challenge, $scope.user.app_token);

					Freebox.openSession(password.toString()).then(function (data) {
						if (data.success) {
							$scope.status = 'Connecté';
							$scope.user.auth = 'true';

							$scope.user.session_token = data.token;
							localStorage.setItem('session_token', data.token);
						}
					});
				}
			});
		};
	});
})();
