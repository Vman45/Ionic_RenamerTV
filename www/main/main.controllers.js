(function () {
	'use strict';

	angular.module('starter.main', ['starter.services.show', 'starter.services.freebox'])

		.controller('RenamerCtrl', function ($scope, Show, Freebox) {

			$scope.user = {};
			$scope.items = [];

			$scope.connected = false;

			var track_id = localStorage.getItem('track_id');
			var app_token = localStorage.getItem('app_token');
			var session_token = localStorage.getItem('session_token');

			// Verifier si on est connecté seulement si on s'est déjà identifié
			if (app_token !== null && track_id !== null) {
				Freebox.authOK(track_id).then(function (data) {
					if (data.success) {
						// Inverser le challenge et app_token, la documentation est fausse
						var password = CryptoJS.HmacSHA1(data.challenge, app_token);

						Freebox.openSession(password.toString()).then(function (data) {
							if (data.success) {
								$scope.connected = true;
							}
						}).catch(function (data) {
							$scope.connected = false;
						});
					}
				});
			}

			$scope.takeIt = function (item) {
				item.checked = !item.checked;
			};

			$scope.loadFiles = function () {

				var session_token = localStorage.getItem('session_token');

				if (session_token !== null) {
					$scope.user.session_token = session_token;

					Freebox.list($scope.user.session_token).then(function (data) {
						var items = [];

						angular.forEach(data.result, function (value, key) {

							if (value.type === 'file') {
								var item = {
									name: value.name,
									realname: "",
									fullname: value.path,
									checked: true
								};
								items.push(item);
							}
						});

						$scope.items = items;
					}).catch(function (data) {
						window.location.href = '#/tab/options';
					});
				} else {
					window.location.href = '#/tab/options';
				}
			};

			$scope.matchFiles = function () {

				if ($scope.items.length !== 0) {
					var items = [];

					// get the name from the list
					angular.forEach($scope.items, function (value, key) {
						if (value.checked) {
							Show.getRealNameShow(value.name).then(function (data) {
								var realnameShow = data.name + ' - ' + data.season + 'x' + data.episode + ' - ' + data.title + data.extension;

								var item = {
									name: value.name,
									realname: realnameShow,
									fullname: value.fullname,
									img: data.image,
									checked: true
								};
								items.push(item);
							});
						}
					});

					$scope.items = items;
				}
			};

			$scope.renameFiles = function () {
				if ($scope.items.length !== 0) {
					var items = [];

					// get the name from the list
					angular.forEach($scope.items, function (value, key) {

						Freebox.renameFile(value.fullname, value.realname, $scope.user.session_token).then(function (data) {

							var item = {
								name: value.name,
								realname: value.realname,
								fullname: value.fullname,
								checked: value.checked
							};

							if (data.success) {
								item = {
									name: value.realname,
									realname: ';)',
									fullname: value.fullname,
									img: value.img,
									checked: value.checked
								};
							}

							items.push(item);
						});
					});

					$scope.items = items;
				}
			};
		});
})();
