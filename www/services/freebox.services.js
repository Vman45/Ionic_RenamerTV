(function () {
	'use strict';

	angular.module('starter.services.freebox', ['ngCordova'])

	.factory('Freebox', function ($http, $q) {

		var host = "http://mafreebox.freebox.fr";

		return {
			auth: function () {
				var cmd = "/api/v3/login/authorize/";
				var deferred = $q.defer();

				var req = {
					method: 'POST',
					url: host + cmd,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json',
						'charset': 'utf-8'
					},
					data: {
						app_id: "fr.freebox.renamertv",
						app_name: "RenamerTV",
						app_version: "1.0.2",
						device_name: device.model
					}
				};

				$http(req).success(function (data) {
					deferred.resolve({
						success: data.success,
						token: data.result.app_token,
						track_id: data.result.track_id
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});

				return deferred.promise;
			},
			authOK: function (trackID) {
				var cmd = "/api/v3/login/authorize/";
				var deferred = $q.defer();

				$http.get(host + cmd + trackID).success(function (data) {
					deferred.resolve({
						success: data.success,
						status: data.result.status,
						challenge: data.result.challenge,
						password_salt: data.result.password_salt
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});

				return deferred.promise;
			},
			getChallenge: function () {
				var cmd = "/api/v3/login/";
				var deferred = $q.defer();

				$http.get(host + cmd).success(function (data) {
					deferred.resolve({
						success: data.success,
						status: data.result.logged_in,
						challenge: data.result.challenge,
						password_salt: data.result.password_salt
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});

				return deferred.promise;
			},
			openSession: function (password) {
				var cmd = "/api/v3/login/session/";
				var deferred = $q.defer();

				var req = {
					method: 'POST',
					url: host + cmd,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json',
						'charset': 'utf-8'
					},
					data: {
						app_id: "fr.freebox.renamertv",
						password: password
					}
				};

				$http(req).success(function (data) {
					deferred.resolve({
						success: data.success,
						token: data.result.session_token
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});

				return deferred.promise;
			},
			list: function (session_app) {
				var cmd = "/api/v3/fs/ls/L0Rpc3F1ZSBkdXIvVMOpbMOpY2hhcmdlbWVudHM="; // Dossier "Téléchargements"
				var deferred = $q.defer();

				var req = {
					method: 'GET',
					url: host + cmd,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json',
						'charset': 'utf-8',
						'X-Fbx-App-Auth': session_app
					},
				};

				$http(req).success(function (data) {
					deferred.resolve({
						success: data.success,
						result: data.result
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});

				return deferred.promise;
			},
			renameFile: function (src, dst, session_app) {
				var cmd = "/api/v3/fs/rename/";
				var deferred = $q.defer();

				var req = {
					method: 'POST',
					url: host + cmd,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json',
						'charset': 'utf-8',
						'X-Fbx-App-Auth': session_app
					},
					data: {
						src: src,
						dst: dst
					}
				};

				$http(req).success(function (data) {
					deferred.resolve({
						success: data.success,
						result: data.result
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});

				return deferred.promise;
			}
		};
	});
})();
