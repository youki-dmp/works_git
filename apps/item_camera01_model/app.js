import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let faceLandmarker;
let video;
let canvasElement;
let canvasCtx;
let waveformCanvas;
let waveformCtx;
let audioContext;
let analyser;
let micStream;

let characterImage = new Image();
let imageLoaded = false;
let volume = 0;
let sensitivity = 1.0;
let headRotation = { x: 0, y: 0, z: 0 };
let isBlinking = false;

const startBtn = document.getElementById('start_btn');
const imageUpload = document.getElementById('image_upload');
const sensitivityInp = document.getElementById('sensitivity');
const uiOverlay = document.getElementById('ui-overlay');

async function initFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1
  });
}

async function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    updateVolume();
  } catch (err) {
    console.error("Audio error:", err);
  }
}

function updateVolume() {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  volume = (sum / dataArray.length) * sensitivity;

  drawWaveform(dataArray);
  requestAnimationFrame(updateVolume);
}

function drawWaveform(data) {
  waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  waveformCtx.strokeStyle = '#4facfe';
  waveformCtx.lineWidth = 2;
  waveformCtx.beginPath();

  const sliceWidth = waveformCanvas.width / data.length;
  let x = 0;

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0;
    const y = v * waveformCanvas.height / 2;
    if (i === 0) waveformCtx.moveTo(x, y);
    else waveformCtx.lineTo(x, y);
    x += sliceWidth;
  }
  waveformCtx.stroke();
}

async function setupWebcam() {
  video = document.getElementById('webcam');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 }
  });
  video.srcObject = stream;
  video.addEventListener("loadeddata", predictWebcam);
}

let lastVideoTime = -1;
async function predictWebcam() {
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const results = faceLandmarker.detectForVideo(video, performance.now());

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      const blendshapes = results.faceBlendshapes[0].categories;

      // Blink detection
      const eyeBlinkLeft = blendshapes.find(b => b.categoryName === "eyeBlinkLeft").score;
      const eyeBlinkRight = blendshapes.find(b => b.categoryName === "eyeBlinkRight").score;
      isBlinking = (eyeBlinkLeft + eyeBlinkRight) / 2 > 0.5;

      // Simple rotation estimation
      const nose = landmarks[1];
      headRotation.y = (nose.x - 0.5) * 40; // Yaw
      headRotation.x = (nose.y - 0.5) * 40; // Pitch
    }
  }
  renderCharacter();
  requestAnimationFrame(predictWebcam);
}

function renderCharacter() {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (!imageLoaded) return;

  const centerX = canvasElement.width / 2;
  const centerY = canvasElement.height / 2;
  const imgWidth = 400;
  const imgHeight = (characterImage.height / characterImage.width) * imgWidth;

  canvasCtx.save();
  canvasCtx.translate(centerX, centerY);

  // Head rotation
  canvasCtx.rotate(headRotation.y * Math.PI / 180 * 0.5);

  // Vertical bounce based on volume
  const bounce = Math.sin(Date.now() * 0.01) * (volume * 0.1);
  canvasCtx.translate(0, bounce - (volume * 0.2));

  // Scale slightly when talking
  const scale = 1 + (volume * 0.002);
  canvasCtx.scale(scale, scale);

  // Draw image
  // Note: Simple PNGTuber logic. In a real 1-PNG app, we might squash the image for blinking/talking
  // but here we apply transforms to the whole image as a base.
  if (isBlinking) {
    canvasCtx.scale(1, 0.95); // Squish eyes effect
  }

  canvasCtx.drawImage(characterImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
  canvasCtx.restore();
}

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      characterImage.src = event.target.result;
      characterImage.onload = () => { imageLoaded = true; };
    };
    reader.readAsDataURL(file);
  }
});

sensitivityInp.addEventListener('input', (e) => {
  sensitivity = parseFloat(e.target.value);
});

startBtn.addEventListener('click', async () => {
  await initFaceLandmarker();
  await setupWebcam();
  await initAudio();
  uiOverlay.classList.add('hidden');
});

window.addEventListener('load', () => {
  canvasElement = document.getElementById('output_canvas');
  canvasCtx = canvasElement.getContext('2d');
  waveformCanvas = document.getElementById('waveform_canvas');
  waveformCtx = waveformCanvas.getContext('2d');

  // Handle resize
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
});
