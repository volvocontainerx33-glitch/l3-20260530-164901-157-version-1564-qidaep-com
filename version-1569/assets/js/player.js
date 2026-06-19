(function () {
    function startPlayer(shell) {
        if (!shell || shell.classList.contains('playing')) {
            return;
        }

        var video = shell.querySelector('video');
        var stream = shell.getAttribute('data-stream');

        if (!video || !stream) {
            return;
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
            shell.classList.add('playing');
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = stream;
                    playVideo();
                }
            });
            video._hlsInstance = hls;
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            return;
        }

        video.src = stream;
        playVideo();
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var button = shell.querySelector('.play-overlay');
        var video = shell.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                startPlayer(shell);
            });
            video.addEventListener('play', function () {
                shell.classList.add('playing');
            });
        }
    });
})();
