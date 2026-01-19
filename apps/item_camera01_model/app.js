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
let imageBlink = new Image();
let imageMouth = new Image();
let imageBoth = new Image();

let imageLoaded = false;
let volume = 0;
let sensitivity = 1.0;
let headRotation = { x: 0, y: 0, z: 0 };
let isBlinking = false;
let neutralLandmarks = null;
let currentLandmarks = null;
let isCalibrating = false;

const appModeSelect = document.getElementById('app_mode');
const startBtn = document.getElementById('start_btn');
const calibrateBtn = document.getElementById('calibrate_btn');
const imageUpload = document.getElementById('image_upload');
const imageBlinkInput = document.getElementById('image_blink');
const imageMouthInput = document.getElementById('image_mouth');
const imageBothInput = document.getElementById('image_both');
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
let faceLandmarks = null;
let faceBlendshapes = null;

async function predictWebcam() {
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const results = faceLandmarker.detectForVideo(video, performance.now());

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      faceLandmarks = results.faceLandmarks[0];
      faceBlendshapes = results.faceBlendshapes[0].categories;

      if (isCalibrating) {
        neutralLandmarks = JSON.parse(JSON.stringify(faceLandmarks));
        isCalibrating = false;
        console.log("Calibration complete / キャリブレーション完了");
      }

      // Set neutral landmarks if not set to avoid frozen mesh
      if (!neutralLandmarks) {
        neutralLandmarks = JSON.parse(JSON.stringify(faceLandmarks));
      }

      currentLandmarks = faceLandmarks;

      // Blink detection
      const eyeBlinkLeft = faceBlendshapes.find(b => b.categoryName === "eyeBlinkLeft").score;
      const eyeBlinkRight = faceBlendshapes.find(b => b.categoryName === "eyeBlinkRight").score;
      isBlinking = (eyeBlinkLeft + eyeBlinkRight) / 2 > 0.4;

      // Rotation estimation
      const nose = faceLandmarks[1];
      const leftEye = faceLandmarks[33];
      const rightEye = faceLandmarks[263];

      headRotation.y = (nose.x - 0.5) * 60; // Yaw
      headRotation.x = (nose.y - 0.5) * 40; // Pitch
      headRotation.z = (rightEye.y - leftEye.y) * 100; // Roll
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

  // Pseudo-3D Rotation (Stabilized)
  const maxSkew = 0.08;
  canvasCtx.rotate(headRotation.z * Math.PI / 180);
  const yawRad = Math.max(-maxSkew, Math.min(maxSkew, headRotation.y * Math.PI / 180 * 0.2));
  const pitchRad = Math.max(-maxSkew, Math.min(maxSkew, headRotation.x * Math.PI / 180 * 0.2));
  canvasCtx.transform(1, pitchRad, yawRad, 1, 0, 0);
  canvasCtx.translate(headRotation.y * 0.8, headRotation.x * 0.8);

  // Bounce
  const bounce = Math.sin(Date.now() * 0.01) * (volume * 0.05);
  canvasCtx.translate(0, bounce - (volume * 0.1));

  // Draw base static image (only if mesh is not ready or restricted)
  if (!neutralLandmarks || !currentLandmarks) {
    canvasCtx.drawImage(characterImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
  } else {
    // The mesh will draw the image layers
    drawMovingMesh(imgWidth, imgHeight);
  }

  // Draw mesh lines for debugging if enabled
  if (document.getElementById('show_mesh').checked && neutralLandmarks) {
    drawDebugMesh(imgWidth, imgHeight);
  }

  canvasCtx.restore();
}

/**
 * Calculates a bounding box for the face area based on landmarks.
 */
function getFaceBounds() {
  if (!neutralLandmarks) return { minX: 0.3, minY: 0.2, maxX: 0.7, maxY: 0.8 };

  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  // Landmarks around the face (silhouette and features)
  const indices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  indices.forEach(i => {
    const p = neutralLandmarks[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  // Add padding
  const paddingX = (maxX - minX) * 0.2;
  const paddingY = (maxY - minY) * 0.2;
  return {
    minX: Math.max(0, minX - paddingX),
    minY: Math.max(0, minY - paddingY),
    maxX: Math.min(1, maxX + paddingX),
    maxY: Math.min(1, maxY + paddingY)
  };
}

/**
 * Advanced Mesh Warping Logic (Case 1)
 */
function drawMovingMesh(width, height) {
  const gridX = 10;
  const gridY = 10;
  const mode = appModeSelect.value;

  // State selection
  let cellX = 0; // Blink state
  let cellY = 0; // Mouth state
  if (isBlinking) cellX = 1;
  const jawOpen = (faceBlendshapes?.find(b => b.categoryName === "jawOpen")?.score || 0);
  if (jawOpen > 0.25 || volume > 5) cellY = 1;

  // Pick source image
  let sourceImg = characterImage;
  if (mode === 'separate') {
    if (cellX === 0 && cellY === 0) sourceImg = characterImage;
    else if (cellX === 1 && cellY === 0) sourceImg = imageBlink;
    else if (cellX === 0 && cellY === 1) sourceImg = imageMouth;
    else if (cellX === 1 && cellY === 1) sourceImg = imageBoth;
  }

  if (!sourceImg.complete || sourceImg.naturalWidth === 0) {
    sourceImg = characterImage; // Fallback
  }

  const cellW = 1.0 / gridX;
  const cellH = 1.0 / gridY;

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      // Normalized coordinates for the WHOLE image (0.0 to 1.0)
      const snx1 = ix * cellW, sny1 = iy * cellH;
      const snx2 = (ix + 1) * cellW, sny2 = iy * cellH;
      const snx3 = ix * cellW, sny3 = (iy + 1) * cellH;
      const snx4 = (ix + 1) * cellW, sny4 = (iy + 1) * cellH;

      // Texture pixel coordinates
      let u1 = snx1 * sourceImg.width, v1 = sny1 * sourceImg.height;
      let u2 = snx2 * sourceImg.width, v2 = sny2 * sourceImg.height;
      let u3 = snx3 * sourceImg.width, v3 = sny3 * sourceImg.height;
      let u4 = snx4 * sourceImg.width, v4 = sny4 * sourceImg.height;

      // If using sprite sheet, adjust the source UVs to the active 2x2 cell
      if (mode === 'spritesheet') {
        const tw = sourceImg.width / 2;
        const th = sourceImg.height / 2;
        u1 = (u1 / 2) + cellX * tw; v1 = (v1 / 2) + cellY * th;
        u2 = (u2 / 2) + cellX * tw; v2 = (v2 / 2) + cellY * th;
        u3 = (u3 / 2) + cellX * tw; v3 = (v3 / 2) + cellY * th;
        u4 = (u4 / 2) + cellX * tw; v4 = (v4 / 2) + cellY * th;
      }

      // Destination coordinates on canvas
      const p1 = getWarpedPoint(snx1, sny1, width, height);
      const p2 = getWarpedPoint(snx2, sny2, width, height);
      const p3 = getWarpedPoint(snx3, sny3, width, height);
      const p4 = getWarpedPoint(snx4, sny4, width, height);

      drawWarpedTriangle(sourceImg, u1, v1, u2, v2, u3, v3, p1, p2, p3);
      drawWarpedTriangle(sourceImg, u2, v2, u4, v4, u3, v3, p2, p4, p3);
    }
  }
}

function drawDebugMesh(width, height) {
  const gridX = 10;
  const gridY = 10;
  canvasCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
  canvasCtx.lineWidth = 1;

  for (let iy = 0; iy <= gridY; iy++) {
    for (let ix = 0; ix <= gridX; ix++) {
      const nx = ix / gridX;
      const ny = iy / gridY;
      const p = getWarpedPoint(nx, ny, width, height);

      // Draw point
      canvasCtx.fillStyle = "red";
      canvasCtx.fillRect(p.x - 1, p.y - 1, 2, 2);

      // Draw lines
      if (ix < gridX) {
        const pNext = getWarpedPoint((ix + 1) / gridX, ny, width, height);
        canvasCtx.beginPath();
        canvasCtx.moveTo(p.x, p.y);
        canvasCtx.lineTo(pNext.x, pNext.y);
        canvasCtx.stroke();
      }
      if (iy < gridY) {
        const pNext = getWarpedPoint(nx, (iy + 1) / gridY, width, height);
        canvasCtx.beginPath();
        canvasCtx.moveTo(p.x, p.y);
        canvasCtx.lineTo(pNext.x, pNext.y);
        canvasCtx.stroke();
      }
    }
  }
}

function getWarpedPoint(nx, ny, width, height) {
  let px = -width / 2 + nx * width;
  let py = -height / 2 + ny * height;

  // MESH DOWNGRADE: Remove mouth/eye warping to fix "uncanny" movements
  // We only keep basic pseudo-3D head tilting in the main renderCharacter transform.
  return { x: px, y: py };
}

function drawWarpedTriangle(img, sx1, sy1, sx2, sy2, sx3, sy3, p1, p2, p3) {
  canvasCtx.save();

  canvasCtx.beginPath();
  canvasCtx.moveTo(p1.x, p1.y);
  canvasCtx.lineTo(p2.x, p2.y);
  canvasCtx.lineTo(p3.x, p3.y);
  canvasCtx.closePath();
  canvasCtx.clip();

  const det = (sx1 - sx3) * (sy2 - sy3) - (sx2 - sx3) * (sy1 - sy3);
  if (Math.abs(det) < 0.0001) {
    canvasCtx.restore();
    return;
  }

  const a = ((p1.x - p3.x) * (sy2 - sy3) - (p2.x - p3.x) * (sy1 - sy3)) / det;
  const b = ((p1.y - p3.y) * (sy2 - sy3) - (p2.y - p3.y) * (sy1 - sy3)) / det;
  const c = ((sx1 - sx3) * (p2.x - p3.x) - (sx2 - sx3) * (p1.x - p3.x)) / det;
  const d = ((sx1 - sx3) * (p2.y - p3.y) - (sx2 - sx3) * (p1.y - p3.y)) / det;
  const e = p3.x - a * sx3 - c * sy3;
  const f = p3.y - b * sx3 - d * sy3;

  canvasCtx.transform(a, b, c, d, e, f);
  canvasCtx.drawImage(img, 0, 0, img.width, img.height);

  canvasCtx.restore();
}

const handleImageLoad = (file, targetImg) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      targetImg.src = event.target.result;
      targetImg.onload = () => { imageLoaded = true; };
    };
    reader.readAsDataURL(file);
  }
};

imageUpload.addEventListener('change', (e) => handleImageLoad(e.target.files[0], characterImage));
imageBlinkInput.addEventListener('change', (e) => handleImageLoad(e.target.files[0], imageBlink));
imageMouthInput.addEventListener('change', (e) => handleImageLoad(e.target.files[0], imageMouth));
imageBothInput.addEventListener('change', (e) => handleImageLoad(e.target.files[0], imageBoth));

appModeSelect.addEventListener('change', () => {
  const mode = appModeSelect.value;
  document.getElementById('input_blink').style.display = (mode === 'separate') ? 'block' : 'none';
  document.getElementById('input_mouth').style.display = (mode === 'separate') ? 'block' : 'none';
  document.getElementById('input_both').style.display = (mode === 'separate') ? 'block' : 'none';
});

sensitivityInp.addEventListener('input', (e) => {
  sensitivity = parseFloat(e.target.value);
});

calibrateBtn.addEventListener('click', () => {
  isCalibrating = true;
  console.log("Calibrating...");
});

startBtn.addEventListener('click', async () => {
  await initFaceLandmarker();
  await setupWebcam();
  await initAudio();
  uiOverlay.classList.add('hidden');
  calibrateBtn.style.display = 'block';
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
