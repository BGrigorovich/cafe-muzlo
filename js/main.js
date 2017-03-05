var API_URL = '192.168.33.119';

var $GET = [];
window.location.href.replace(/[?&#]+([^=&]+)=([^&]*)/gi, function (a, name, value) {
    $GET[name] = value;
});

Object.map = function (o, f, ctx) {
    ctx = ctx || this;
    var result = [];
    Object.keys(o).forEach(function (k) {
        result.push(f.call(ctx, o[k], k, o));
    });
    return result;
};

function spotifyApi(uri, params, success, fail) {
    params = Object.map(params, function (value, key, params) {
        return key + '=' + value;
    });
    params = params.length ? '?' + params.join('&') : '';
    $.ajax({
        url: 'https://api.spotify.com/v1/' + uri + params,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        success: success,
        fail: fail
    })
}

function initWebSockets(user_id) {
}

$(document).ready(function () {
    var ws = new WebSocket('ws://' + API_URL + ':8080/user_session');
    ws.onopen = function (event) {
        // setTimeout(function () {
        //     ws.send(JSON.stringify({'action': 'new_user_session', 'user_id': 4}));
        // }, 500)
        return false;
    };

    $('body').on('click', '.track', function () {
        var msg = {
            id: $(this).data('id')
        };
        ws.send(JSON.stringify(msg));
    });

    ws.onmessage = function (event) {
        console.log(event.data);
        var msg = event.data;
        if (msg.type == 'now_playing') {

        } else if (msg.type == 'pending_songs') {
            $('#playlist').append(msg.tracks.map(function (track) {

            }))
        } else if (msg.type == 'your_song_on_air') {

        } else if (msg.type == 'your_next_song') {

        }
        return false
    }

    function displayPlaylists() {
        $("#song-search").val('');
        $('#back-to-playlists-btn').hide();
        $('#search-results').empty().append(
            JSON.parse(localStorage.getItem('playlists')).items.map(function (playlist) {
                return '<li class="collection-item avatar playlist" data-id="' + playlist.id + '" data-owner="' + playlist.owner.id + '">' +
                    '<img width="42px" height="42px" src="' + playlist.images[0].url + '" class="circle">' +
                    '<span class="title">' + playlist.name + '</span><p></p>' +
                    '<a href="#!" class="secondary-content"><i class="material-icons">trending_flat</i></a></li>'
            }));
    }

    if (!$GET.hasOwnProperty('access_token')) {
        window.location.href = 'https://accounts.spotify.com/authorize?client_id=2a66a944d6184315b8d02096ed7030dc&' +
            'response_type=token&redirect_uri=http://192.168.32.166:8887/index.html&scope=playlist-read-collaborative';
    } else {
        localStorage.setItem('access_token', $GET['access_token'])
        spotifyApi('me', {}, function (response) {
                localStorage.setItem('spotify_user_id', response.id);
                localStorage.setItem('user_name', response.display_name);
            }, function () {
            }
        );
        spotifyApi('me/playlists', {}, function (response) {
                localStorage.setItem('playlists', JSON.stringify(response));
            }, function () {
            }
        );
        setTimeout(function () {
            $.post('http://' + API_URL + ':8000/register/',
                {
                    playlist_ids: JSON.stringify(JSON.parse(localStorage.getItem('playlists')).items.map(function (playlist) {
                        return playlist.id;
                    })),
                    spotify_user_id: localStorage.getItem('spotify_user_id'),
                    display_name: localStorage.getItem('user_name')
                })
                .done(function (response) {
                    localStorage.setItem('user_id', response.user_id);
                    initWebSockets(response.user_id);
                    displayPlaylists();
                })
                .fail(displayPlaylists);
        }, 1500);
    }

    $('#login-btn').click(function () {
        $.get('https://accounts.spotify.com/authorize', {userId: $('#user-id').val()})
            .done(function (response) {
                localStorage.setItem('spotify_user_id', response.user_id);
                $('#login-view').hide();
                $('#main-view').show();
                displayPlaylists();
            })
            .fail(function () {
                alert('Something went wrong');
            });
    });

    $('#back-to-playlists-btn').click(displayPlaylists);

    $('body').on('click', '.playlist', function () {
        var $this = $(this);
        spotifyApi('users/' + $this.data('owner') + '/playlists/' + $this.data('id'), {},
            function (response) {
                $('#back-to-playlists-btn').show();
                $('#search-results').empty().append(response.tracks.items.map(function (item) {
                        return '<li class="collection-item avatar track" data-id="' + item.track.id + '">' +
                            '<img src="' + item.track.album.images.slice(-1)[0].url + '" class="circle">' +
                            '<span class="title">' + item.track.name + '</span><p>' + item.track.artists[0].name + '</p>' +
                            '<a href="#!" class="secondary-content"><i class="material-icons">send</i></a></li>'
                    })
                );
            },
            function () {
            });
    });
    $("#song-search").keypress(function (e) {
        if (e.keyCode == 13) {
            spotifyApi('search', {q: $(this).val(), type: 'track'},
                function (response) {
                    $('#back-to-playlists-btn').show();
                    $('#search-results').empty().append(
                        response.tracks.items.filter(function (track) {
                            return track.type = 'track';
                        }).map(function (track) {
                            return '<li class="collection-item avatar track" data-id="' + track.id + '">' +
                                '<img src="' + track.album.images.slice(-1)[0].url + '" class="circle">' +
                                '<span class="title">' + track.name + '</span><p>' + track.artists[0].name + '</p>' +
                                '<a href="#!" class="secondary-content"><i class="material-icons">send</i></a></li>'
                        })
                    );
                },
                function () {
                })
        }
    });
});