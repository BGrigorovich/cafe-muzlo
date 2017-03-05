var API_URL = '192.168.33.119';
var $GET=[];
window.location.href.replace(/[?&#]+([^=&]+)=([^&]*)/gi,function(a,name,value){$GET[name]=value;});

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
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer BQDn7mVSUSUG3Zd23MuCtWYLS_UKS18NnW0AXf3tYNO9nLz9O2RoQoCC12fe8aFdmr7CYXhbwk7WfhqzLdPGkv_Mk7aTPm7Ll2GXX9JekZ79YLK7bpQW7D3IGiUGRScKl2OjjINITA49TT1BtcfJf4B3zoTCLn-PwIvliga6V_EEuA2x7d4YBYZ1YBI9o9sQHmLpYn8aZ1w00vnK6AL1AerbWQu_KQn6Dz5rFPUwpRNH7G_1BdDN89jKFY9Dgim9O03Iq0nzoZSJhZ3rX9cQIRzIs6hrjx9I7u9hDyqT1pwSCYb_3w');
        },
        success: success,
        fail: fail
    })
}

var ws = new WebSocket('ws://' + API_URL + ':8080', 'ws1');

$(document).ready(function () {
    function displayPlaylists() {
        spotifyApi('me/playlists', {},
            function (response) {
                $("#song-search").val('');
                $('#back-to-playlists-btn').hide();
                $('#search-results').empty().append(
                    response.items.map(function (playlist) {
                        return '<li class="collection-item avatar playlist" data-id="' + playlist.id + '">' +
                            '<img width="42px" height="42px" src="' + playlist.images[0].url + '" class="circle">' +
                            '<span class="title">' + playlist.name + '</span><p></p>' +
                            '<a href="#!" class="secondary-content"><i class="material-icons">trending_flat</i></a></li>'
                    })
                );
            });
    }

    if (!$GET.hasOwnProperty('access_token')) {
        window.location.href = 'https://accounts.spotify.com/authorize?client_id=2a66a944d6184315b8d02096ed7030dc&' +
            'response_type=token&redirect_uri=http://192.168.32.166:8887/index.html';
    } else {
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + $GET['access_token']
            },
            success: function (response) {
                localStorage.setItem('user_id', response.user_id)
            }
        });
    }
    // if (localStorage.getItem('user_id')) {
        // $('#main-view').show();
        // displayPlaylists();
    // } else {
    //     $('#login-view').show();
    // }

    $('#login-btn').click(function () {
        $.get('https://accounts.spotify.com/authorize', {userId: $('#user-id').val()})
            .done(function (response) {
                localStorage.setItem('user_id', response.user_id);
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
        spotifyApi('users/spotify/playlists/' + $this.data('id'), {},
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

    $('body').on('click', '.playlist', function () {
        var msg = {
            id: $(this).data('id')
        };
        ws.send(JSON.stringify(msg));
    });

    ws.onmessage = function (event) {
        console.log(event.data);
    }
});