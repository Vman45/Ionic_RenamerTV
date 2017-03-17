(function() {
    'use strict';

	angular.module('starter.services.show', ['ngCordova'])

	.factory('Show', function($http, $q) {

		return {
			getExtension: function(filename)
			{
				var exts = filename.split(".");
				return '.' + (exts[(exts.length-1)]);
			},
			getRealNameShow: function(name) {
				
				var urlShow = "https://api.tvmaze.com/singlesearch/shows?q=";
				var urlFullName = "https://api.tvmaze.com/shows/{show_id}/episodebynumber?season={show_season}&number={show_episode}";

				var split_name = name.split('.S');

				// Vérifie si c'est une série
				if(split_name.length === 1) {
					return $q.reject('Not a tv show.');
				}
				
				var showname = split_name[0].replace(/\./g, ' ');
				var show_season = /S\d{1,3}/gi.exec(name)[0].replace('S', '');
				var show_episode = /E\d{1,3}/gi.exec(name)[0].replace('E', '');
				var ext = this.getExtension(name);
				
				var promiseStart = $q.when('start');

				var promise_getTvID = promiseStart.then(function () {
					return $http.get(urlShow + showname).
						success(function(data) {
							//console.log('promise_getTvID', data.image.medium);
							tv0 = {
								id: data.id,
								image: data.image.medium
							};
						});
				});
					
				var promise2_getTvTitle = promise_getTvID.then(function () {
					var url = urlFullName.replace('{show_id}', tv0.id)
								 .replace('{show_season}', show_season)
								 .replace('{show_episode}', show_episode)
											 
					return $http.get(url).
						success(function(data) {
							//console.log('promise2_getTvTitle', data.name);
							tv = {
								name: data.name
							};
						});
				});

				var promiseEnd = promise2_getTvTitle.then(function () {
					//console.log('promiseEnd', tv0.id);
					var show = { id:tv0.id, name: showname, title: tv.name.replace(/:/g, ' '), season: show_season, episode: show_episode, extension: ext, image: tv0.image };
					return show;
				}, function (reason) {
					return $q.reject(reason);
				});

				return promiseEnd;
			}
		}
	});
})();
