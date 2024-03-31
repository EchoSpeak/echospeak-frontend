let audioContext;
let source = null;
let queue = [];
let websocket;

document.getElementById("startButton").addEventListener("click", function () {
  // Disable the start button and enable the stop button
  document.getElementById("startButton").disabled = true;
  document.getElementById("stopButton").disabled = false;

  // Close the previous WebSocket connection if it exists
  if (websocket) {
    websocket.close();
    websocket = null;
  }

  const selectedUrl = document.getElementById("websocketSelect").value;
  websocket = new WebSocket(selectedUrl);
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

document.getElementById("stopButton").addEventListener("click", function () {
  // Disable the stop button and enable the start button
  document.getElementById("stopButton").disabled = true;
  document.getElementById("startButton").disabled = false;

  // Close the WebSocket connection and stop the audio
  if (websocket) {
    websocket.close();
    websocket = null;
  }
  if (source) {
    source.stop();
    source = null;
  }
  queue = [];
});

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
