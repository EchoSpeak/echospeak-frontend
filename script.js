let audioContext = null;
let source = null;
let queue = [];
let websocket = null;
let currentSelection = null;

document.querySelectorAll(".language-box").forEach((box) => {
  box.addEventListener("click", (event) => {
    // Stop the current WebSocket connection if it exists
    reset();

    currentSelection = event.target;
    currentSelection.dataset.selected = "true";

    // Start a new WebSocket connection
    const url = box.dataset.url;
    websocket = new WebSocket(url);
    websocket.binaryType = "arraybuffer";

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    websocket.onmessage = function (event) {
      audioContext.decodeAudioData(
        event.data,
        function (buffer) {
          queue.push(buffer);
          if (source === null) {
            playNextAudio();
          }
        },
        function (e) {
          console.log("Error decoding audio data", e);
        }
      );
    };
  });
});

document.getElementById("stopButton").addEventListener("click", reset);

function reset() {
  if (websocket) {
    websocket.close();
    websocket = null;
  }

  if (source) {
    source.stop();
    source = null;
  }

  queue = [];

  if (currentSelection) {
    currentSelection.dataset.selected = "false";
    currentSelection = null;
  }
}

function playNextAudio() {
  if (queue.length === 0) {
    source = null;
    return;
  }

  let buffer = queue.shift();
  source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();

  source.onended = function () {
    playNextAudio();
  };
}