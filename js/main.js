const USER_ID = 'dan_1k';

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
    $.ajax({
        url: 'https://api.spotify.com/v1/' + uri + '?' + params.join('&'),
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer BQDuuPq4Zy1ZRzzOlt76BtfJeD1je6Uv21l239P9sP-0yy2LoovOkDiSW0fLYFpWSIRstxD5wApZq2tFvfjLUZAnP1VlZ8nwz3r6FIqlkVpp_ha97ohT0JkQf1AB-PAQLVPCCW8bCGdv8s20x0X1qLpVptTXW_ooMWi8FzjTeuL5CHum0N5BEgz90-QxFgff4UYs6-bFPJcsaRDAfCzcUTpWZ1_aCe_EgpgzenwYz28GgPdxdq5hCxQ7FGxHbBuyf68vwJzdG1lvHqy-YAwaiAP2g9x182Rt8ajr3D9CNSHBbEL_6w');
        },
        success: success,
        fail: fail
    })
}

$(document).ready(function () {
    spotifyApi('me/playlists', {},
        function (response) {
            $('#search-results').empty().append(
                response.items.map(function(playlist) {
                    return '<li class="collection-item avatar playlist" data-id="' + playlist.id + '">' +
                        playlist.images ? '<img width="42px" height="42px" src="' + playlist.images[0].url + '" class="circle">' : '' +
                    '<span class="title">' + playlist.name + '</span><p></p>' +
                    '<a href="#!" class="secondary-content"><i class="material-icons">send</i></a></li>'
                })
            );
        });

    $('body').on('click', '.playlist', function () {
        var $this = $(this);
        spotifyApi('me/playlists', {user_id: USER_ID, playlist_id: $this.data('id')},
            function (response) {
                response.tracks.items.map(function (track) {
                    return '<li class="collection-item avatar track" data-id="' + track.id + '">' +
                        '<img src="' + track.album.images.slice(-1)[0].url + '" class="circle">' +
                        '<span class="title">' + track.name + '</span><p>' + track.artists[0].name + '</p>' +
                        '<a href="#!" class="secondary-content"><i class="material-icons">send</i></a></li>'
                })
            },
            function () {});

    });

    $("#song-search").keypress(function (e) {
        if (e.keyCode == 13) {
            spotifyApi('search', {q: $(this).val(), type: 'track'},
                function (response) {
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