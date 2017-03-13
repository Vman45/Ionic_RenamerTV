angular.module('starter.services', [])

.factory('Freebox', function($http, $q) {
	
	var host = "http://mafreebox.freebox.fr";
	
	return {
		auth: function() {			
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
				app_version: "0.0.1",
				device_name: "PC dev"
 			 }
			};

			$http(req).success(function(data) { 
				deferred.resolve({ success: data.success, token: data.result.app_token, track_id: data.result.track_id });
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			
			return deferred.promise;
		},
		authOK:function(trackID) {
			var cmd = "/api/v3/login/authorize/";
			var deferred = $q.defer();
			
			$http.get(host + cmd + trackID).success(function(data) { 
				deferred.resolve({ success: data.success, status: data.result.status, challenge: data.result.challenge, password_salt: data.result.password_salt });
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			
			return deferred.promise;
		},
		getChallenge:function() {
			var cmd = "/api/v3/login/";
			var deferred = $q.defer();
			
			$http.get(host + cmd).success(function(data) { 
				deferred.resolve({ success: data.success, status: data.result.logged_in, challenge: data.result.challenge, password_salt: data.result.password_salt });
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			
			return deferred.promise;
		},
		openSession:function(password) {
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

			$http(req).success(function(data) { 
				deferred.resolve({ success: data.success, token: data.result.session_token });
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			
			return deferred.promise;
		},		
		list:function(session_app) {
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
			
			$http(req).success(function(data) { 
				deferred.resolve({ success: data.success, result: data.result });
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			
			return deferred.promise;
		},
		renameFile:function(src, dst, session_app) {
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

			$http(req).success(function(data) { 
				deferred.resolve({ success: data.success, result: data.result });
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			
			return deferred.promise;
		}		
	}
})

.factory('Show', function($http, $q) {

	return {
		getExtension: function(filename)
		{
			var exts = filename.split(".");
			return '.' + (exts[(exts.length-1)]);
		},
		getRealNameShow: function(name) {
			
			var urlShow = "http://api.tvmaze.com/singlesearch/shows?q=";
			var urlFullName = "http://api.tvmaze.com/shows/{show_id}/episodebynumber?season={show_season}&number={show_episode}";
			
			console.log('getRealNameShow', name)
			
			var showname = name.split('.S')[0].replace(/\./g, ' ');
			console.log('showname', showname)
			var show_season = /S\d{1,3}/gi.exec(name)[0].replace('S', '');
			var show_episode = /E\d{1,3}/gi.exec(name)[0].replace('E', '');
			var ext = this.getExtension(name);
			
			var promiseStart = $q.when('start');

			var promise_getTvID = promiseStart.then(function () {
				return $http.get(urlShow + showname).
					success(function(data) {
						//console.log('promise_getTvID', data.id)
						tv = {
							id: data.id
						};
					});
			});
				
			var promise2_getTvTitle = promise_getTvID.then(function () {
				var url = urlFullName.replace('{show_id}', tv.id)
							 .replace('{show_season}', show_season)
							 .replace('{show_episode}', show_episode)
										 
				return $http.get(url).
					success(function(data) {
						//console.log('promise2_getTvTitle', data.name)
						tv = {
							name: data.name
						};
					});
			});

			var promiseEnd = promise2_getTvTitle.then(function () {
				//console.log('promiseEnd')
				var show = { id:tv.id, name: showname, title: tv.name.replace(/:/g, ' '), season: show_season, episode: show_episode, extension: ext };
				return show;
			}, function (reason) {
				return $q.reject(reason);
			});

			return promiseEnd;
		}
	}
});
