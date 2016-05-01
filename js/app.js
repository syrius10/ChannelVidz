$(document).ready(function() {
	document.addEventListener('deviceready', onDeviceReady, false);
});

function onDeviceReady() {

	//Check LocalStorage for channel
	if (localStorage.channel == null || localStorage.channel == '') {
		//Ask user for channel
		$('#popupDialog').popup("open");
	} else {
		var channel = localStorage.getItem('channel');
	}

	getPlaylist(channel);

	$(document.on('click', '#vidlist li', function(){
		showVideo($(this).attr('videoid'));
	});

	$('#channelBtnOK').click(function () {
		var channel = $('#channelName').val();
		setChannel(channel);
		getPlaylist(channel);
	});

	$('saveOptions').click(function(){
		saveOptions();
	});

	$('clearChannel').click(function(){
		clearChannel();
	});

	$(document).on('pageinit', '#options', function(e){
		var channel = localStorage.getItem('channel');
		var maxResults = localStorage.getItem('maxresults');
		$('#channelNameOptions').attr('value', channel);
		$('#maxResultsOptions').attr('value', maxResults);
	});
}

function getPlaylist(channel)	{
	$('#vidlist').html('');
	$.get(
			"https://www.googleapis.com/youtube/v3/channels",
			{
				part: 'contentDetails',
				forUsername: channel,
				key: 'AIzaSyAIqPR9bdoWefW1aCRJjQe4YzECzXEybgo'
			},
			function(data) {
				$.each(data.items, function(i, item) {
					console.log(item);
					playlistId = item.contentDetails.relatedPlaylists.uploads;
					getVideos(playlistId, localStorage.getItem('maxResults'));
				});
			}
		);
}

function getVideos(playlistId, maxResults) {
	$.get(
		"https://www.googleapis.com/youtube/v3/playlistItems", 
		{
			part: 'snippet',
			maxResults: maxResults,
			playlistId: playlistId,
			key: 'AIzaSyAIqPR9bdoWefW1aCRJjQe4YzECzXEybgo'
		}, function(data) {
			var output;
			$.each(data.items, function(i, item) {
				id = item.snippet.resourceId.videoId;
				title = item.snippet.title;
				thumb = item.snippet.thumbnails.default.url;
				$('#vidlist').append('<li videoId="'+id+'"><img src="'+thumb+'"><h3>'+title+'</h3></li>');
				$('#vidlist').listview('refresh');
			});
		}
		);
}

function showVideo(id) {
	console.log('Showing video ' + id);
	$('logo').hide();
	var output = '<iframe width="100%" height="250" src="https://www.youtube.com/embed/'+id+'" frameborder="0" allowfullscreen></iframe>';
	$('#showVideo').html(output);

}

function setChannel(channel) {
	localStorage.setItem('channel', channel);
	console.log('Channel Set: ' + channel);
}

function setMaxResults(maxResults) {
	localStorage.setItem('maxResults', maxResults);
	console.log('Max Reuslts changed: ' + maxResults);
}

function saveOptions() {
	var channel = $('#channelNameOptions').val();
	setChannel(channel);
	var maxResults = $('#maxResultsOptions').val();
	setMaxResults(maxResults);
	$('body').pagecontainer('change', '#main', {options});
	getPlaylist(channel);
}

function clearChannel() {
	localStorage.removeItem('channel');
	$('body').pagecontainer('change', '#main', {options});
	//Clear List
	$('#vidlist').html('');
	//Show Popup
	$('popupDialog').popup('open');
}