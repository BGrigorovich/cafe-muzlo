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
            xhr.setRequestHeader('Authorization', 'Bearer BQD83VFcb9_gTYuftHou6a7XWdC_pN8Zz-f9h7DmxoE9ySeCWi2fnmdtOsFeF1GpCrk3E9502NlJ0NGZPkvCVCcf-rN-iQfNJQWpDLZFcGcFqk8BEei4cGZklGTh4RyeNJEf_F3pQOQ53lmxPMqsNLICsfvD-DCF-YPutdeGTDlVsWtYAAOT4NkgYA1pIiuVPmABNCv3OGtx4l5JZ180Pb6BU5Lt50vcUX12himenUc3envN3FETjnek0UYihjnx4pQFhepKJ5meiYnsZ_Li_oLS0c5y8zJ3F2pPwnRN9voRq9A1Ig');
        },
        success: success,
        fail: fail
    })
}

$(document).ready(function () {
    function displayPlaylists() {
        spotifyApi('me/playlists', {},
            function (response) {
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
    displayPlaylists();
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
});