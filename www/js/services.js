angular.module('starter.services', [])

.factory('ShowName', function($http, $q) {
	
	var urlShow = "http://api.tvmaze.com/singlesearch/shows?q=";
	var urlFullName = "http://api.tvmaze.com/shows/{show_id}/episodebynumber?season={show_season}&number={show_episode}";
	
	return {
		getRealNameShow: function(name) {
			
			var showname = nameTV.split('.')[0];
			var promise = this.getID(showname);
			
			promise.then(
			  function(response) {
				console.log(response.id);
				
				
			});
  
		},
		getID: function(name) {
			
			var deferred = $q.defer();
			
			$http.get(urlShow + name)
				.success(function(data) { 
				deferred.resolve({
				title: data.title,
				cost: data.price});
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			
			return deferred.promise;
		}
	}
 })

.factory('Show', function($http) {

	var urlShow = "http://api.tvmaze.com/singlesearch/shows?q=";
	var urlFullName = "http://api.tvmaze.com/shows/{show_id}/episodebynumber?season={show_season}&number={show_episode}";

	return {
		getTest: function(name) {
 
			$http({
				method : "GET",
				url : urlShow + name.split('.')[0]
			}).then(function mySucces(response) {
				
				var showname = name.split('.')[0];
				var show_season = /S\d{1,3}/gi.exec(name)[0].replace('S', '');
				var show_episode = /E\d{1,3}/gi.exec(name)[0].replace('E', '');
				var id = response.data.id;
				var url = urlFullName.replace('{show_id}', id)
										 .replace('{show_season}', show_season)
										 .replace('{show_episode}', show_episode)
				
				$http({
					method : "GET",
					url : url
				}).then(function mySucces(response) {
					
					var realname = showname + ' ' + show_season + 'x' + show_episode + ' - ' + response.data.name;
					console.log("getTest", realname);
					return realname;
				}, function myError(response) {
					return null;
				});
			}, function myError(response) {
				console.log("error", response.error);
				return null;
			});
		},
		getRealNameShow: function(nameTV) {
			
			var showname = nameTV.split('.')[0];
			var show_season = /S\d{1,3}/gi.exec(nameTV)[0].replace('S', '');
			var show_episode = /E\d{1,3}/gi.exec(nameTV)[0].replace('E', '');
			var id = this.getID(showname);
			var url = urlFullName.replace('{show_id}', id)
										 .replace('{show_season}', show_season)
										 .replace('{show_episode}', show_episode)
			
			console.log("url", url);
			
			$http({
				method : "GET",
				url : url
			}).then(function mySucces(response) {
				
				var realname = showname + show_season + 'x' + show_episode + ' - ' + response.data.name;
				console.log("getRealNameShow", realname);
				return realname;
			}, function myError(response) {
				return null;
			});
		},
		getID: function(name) {
			
			$http({
				method : "GET",
				url : urlShow + name
			}).then(function mySucces(response) {
				console.log("getID", response.data.id);
				return response.data.id;
			}, function myError(response) {
				console.log("error", response.error);
				return null;
			});
		}
	};
});
