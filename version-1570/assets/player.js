(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function attachVideo(box) {
        var video = box.querySelector("video");
        var button = box.querySelector(".play-button");
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var hlsInstance = null;
        var isReady = false;

        function ensureStream() {
            if (isReady || !stream) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                isReady = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                isReady = true;
            }
        }

        function playOrPause() {
            ensureStream();
            if (video.paused) {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function() {});
                }
            } else {
                video.pause();
            }
        }

        if (button) {
            button.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                playOrPause();
            });
        }
        box.addEventListener("click", function(event) {
            if (event.target === video || event.target === box) {
                playOrPause();
            }
        });
        video.addEventListener("play", function() {
            box.classList.add("is-playing");
        });
        video.addEventListener("pause", function() {
            box.classList.remove("is-playing");
        });
        video.addEventListener("ended", function() {
            box.classList.remove("is-playing");
        });
        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachVideo);
    });
})();
