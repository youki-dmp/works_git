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
let headPosition = { x: 0, y: 0 };
let headScale = 1.0;
let isBlinking = false;
let blinkScore = 0; // Normalized 0-1
let mouthScore = 0; // Normalized 0-1
let smoothBlink = 0;
let smoothMouth = 0;
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

      // Continuous Scores for Interpolation
      const eyeBlinkLeft = faceBlendshapes.find(b => b.categoryName === "eyeBlinkLeft").score;
      const eyeBlinkRight = faceBlendshapes.find(b => b.categoryName === "eyeBlinkRight").score;
      blinkScore = (eyeBlinkLeft + eyeBlinkRight) / 2;

      const jawOpen = (faceBlendshapes.find(b => b.categoryName === "jawOpen")?.score || 0);
      mouthScore = Math.max(jawOpen, Math.min(1.0, volume / 30.0));

      // Smoothing (EMA)
      const alpha = 0.6; // High value = faster response, low value = smoother
      smoothBlink = smoothBlink * (1 - alpha) + blinkScore * alpha;
      smoothMouth = smoothMouth * (1 - alpha) + mouthScore * alpha;

      isBlinking = smoothBlink > 0.4;

      // Rotation estimation
      const nose = faceLandmarks[1];
      const eyeL = faceLandmarks[33];
      const eyeR = faceLandmarks[263];

      // Rotation estimation (Relative to Calibration)
      const neut = neutralLandmarks ? neutralLandmarks : currentLandmarks;
      headRotation.y = (nose.x - neut[1].x) * 60; // Yaw
      headRotation.x = (nose.y - neut[1].y) * 40; // Pitch
      headRotation.z = ((eyeR.y - eyeL.y) - (neut[263].y - neut[33].y)) * 100; // Roll

      // Position & Scale (Depth) - Relative to Calibration
      const eyeDist = Math.sqrt(Math.pow(eyeR.x - eyeL.x, 2) + Math.pow(eyeR.y - eyeL.y, 2));
      const neutralDist = Math.sqrt(Math.pow(neut[263].x - neut[33].x, 2) + Math.pow(neut[263].y - neut[33].y, 2));
      headScale = Math.max(0.7, Math.min(1.5, eyeDist / neutralDist));

      // Face center for translation
      headPosition.x = (nose.x - neut[1].x) * 120;
      headPosition.y = (nose.y - neut[1].y) * 80;
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

  // Advanced Body Transforms
  // Scale (Depth)
  canvasCtx.scale(headScale, headScale);

  // Translation (X/Y Movement)
  canvasCtx.translate(headPosition.x, headPosition.y);

  // Body Leaning (Tilt the whole character slightly)
  const leaning = headRotation.y * 0.002;
  canvasCtx.transform(1, 0, leaning, 1, 0, 0);

  // Pseudo-3D Rotation (Stabilized)
  const maxSkew = 0.08;
  canvasCtx.rotate(headRotation.z * Math.PI / 180);
  const yawRad = Math.max(-maxSkew, Math.min(maxSkew, headRotation.y * Math.PI / 180 * 0.2));
  const pitchRad = Math.max(-maxSkew, Math.min(maxSkew, headRotation.x * Math.PI / 180 * 0.2));
  canvasCtx.transform(1, pitchRad, yawRad, 1, 0, 0);

  // Bounce
  const bounce = Math.sin(Date.now() * 0.01) * (volume * 0.05);
  canvasCtx.translate(0, bounce - (volume * 0.1));

  // Draw Mesh Layer
  if (!neutralLandmarks || !currentLandmarks) {
    canvasCtx.drawImage(characterImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
  } else {
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
  const paddingX = (maxX - minX) * 0.25;
  const paddingYTop = (maxY - minY) * 0.15;
  const paddingYBottom = (maxY - minY) * 0.45; // Much more padding at the bottom for mouth/chin
  return {
    minX: Math.max(0, minX - paddingX),
    minY: Math.max(0, minY - paddingYTop),
    maxX: Math.min(1, maxX + paddingX),
    maxY: Math.min(1, maxY + paddingYBottom)
  };
}

/**
 * Advanced Mesh Warping Logic (Case 1)
 */
function drawMovingMesh(width, height) {
  const gridX = 30;
  const gridY = 30;
  const mode = appModeSelect.value;

  // Weights for interpolation
  // w00: Standard, w10: Blink, w01: MouthOpen, w11: Both

  // SHARPNESS ADJUSTMENT:
  // Use a power function to stay in states 0 or 1 longer.
  // Also, emphasize the dominant state.
  const sharpen = (v) => {
    // Simple curve: stays near 0/1 longer, moves fast in middle
    if (v < 0.25) return 0;
    if (v > 0.75) return 1;
    return (v - 0.25) / 0.5; // Linear ramp in the slightly wider middle (0.25 - 0.75)
  };

  const b = sharpen(smoothBlink);
  const m = sharpen(smoothMouth);
  const weights = [
    { cx: 0, cy: 0, img: characterImage, alpha: (1 - b) * (1 - m) },
    { cx: 1, cy: 0, img: (mode === 'separate' ? imageBlink : characterImage), alpha: b * (1 - m) },
    { cx: 0, cy: 1, img: (mode === 'separate' ? imageMouth : characterImage), alpha: (1 - b) * m },
    { cx: 1, cy: 1, img: (mode === 'separate' ? imageBoth : characterImage), alpha: b * m }
  ];

  const cellW = 1.0 / gridX;
  const cellH = 1.0 / gridY;

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const snx1 = ix * cellW, sny1 = iy * cellH;
      const snx2 = (ix + 1) * cellW, sny2 = iy * cellH;
      const snx3 = ix * cellW, sny3 = (iy + 1) * cellH;
      const snx4 = (ix + 1) * cellW, sny4 = (iy + 1) * cellH;

      // PART LOCALIZATION: Map neutralLandmarks to a centered space for Illustration
      const cx = snx1 + cellW / 2;
      const cy = sny1 + cellH / 2;
      let isPart = false;
      if (neutralLandmarks) {
        // Find face center in neutral landmarks
        const bounds = getFaceBounds();
        const fCX = (bounds.minX + bounds.maxX) / 2;
        const fCY = (bounds.minY + bounds.maxY) / 2;

        const mapX = (lx) => (lx - fCX) + 0.5;
        const mapY = (ly) => (ly - fCY) + 0.45; // Shifted slightly up for mouth

        const eL = neutralLandmarks[468]; // Iris L
        const eR = neutralLandmarks[473]; // Iris R
        const mC = neutralLandmarks[13];  // Upper Lip

        const dL = Math.hypot(cx - mapX(eL.x), cy - mapY(eL.y));
        const dR = Math.hypot(cx - mapX(eR.x), cy - mapY(eR.y));
        const dM = Math.hypot(cx - mapX(mC.x), cy - mapY(mC.y));

        // Larger radii for robust mapping
        isPart = (dL < 0.12 || dR < 0.12 || dM < 0.2);
      }

      const p1 = getWarpedPoint(snx1, sny1, width, height);
      const p2 = getWarpedPoint(snx2, sny2, width, height);
      const p3 = getWarpedPoint(snx3, sny3, width, height);
      const p4 = getWarpedPoint(snx4, sny4, width, height);

      if (!isPart || mode === 'single') {
        const sourceImg = characterImage;
        let u1 = snx1 * sourceImg.width, v1 = sny1 * sourceImg.height;
        let u2 = snx2 * sourceImg.width, v2 = sny2 * sourceImg.height;
        let u3 = snx3 * sourceImg.width, v3 = sny3 * sourceImg.height;
        let u4 = snx4 * sourceImg.width, v4 = sny4 * sourceImg.height;

        if (mode === 'spritesheet') {
          // Lock to top-left cell (0,0) for non-face parts
          u1 /= 2; v1 /= 2;
          u2 /= 2; v2 /= 2;
          u3 /= 2; v3 /= 2;
          u4 /= 2; v4 /= 2;
        }

        canvasCtx.globalAlpha = 1.0;
        drawWarpedTriangle(sourceImg, u1, v1, u2, v2, u3, v3, p1, p2, p3);
        drawWarpedTriangle(sourceImg, u2, v2, u4, v4, u3, v3, p2, p4, p3);
      } else {
        // Draw alpha-blended stack for face
        // OPACITY FIX: To prevent the "glowing/thin" look, we must ensure the bottom layer is 1.0 alpha.
        // We sort layers by weight and draw the most dominant one first at 1.0 alpha.
        const activeLayers = weights.filter(l => l.alpha > 0.01)
          .sort((a, b) => b.alpha - a.alpha);

        activeLayers.forEach((layer, index) => {
          let sourceImg = layer.img;
          if (!sourceImg.complete || sourceImg.naturalWidth === 0) sourceImg = characterImage;

          let u1 = snx1 * sourceImg.width, v1 = sny1 * sourceImg.height;
          let u2 = snx2 * sourceImg.width, v2 = sny2 * sourceImg.height;
          let u3 = snx3 * sourceImg.width, v3 = sny3 * sourceImg.height;
          let u4 = snx4 * sourceImg.width, v4 = sny4 * sourceImg.height;

          if (mode === 'spritesheet') {
            const tw = sourceImg.width / 2;
            const th = sourceImg.height / 2;
            u1 = (u1 / 2) + layer.cx * tw; v1 = (v1 / 2) + layer.cy * th;
            u2 = (u2 / 2) + layer.cx * tw; v2 = (v2 / 2) + layer.cy * th;
            u3 = (u3 / 2) + layer.cx * tw; v3 = (v3 / 2) + layer.cy * th;
            u4 = (u4 / 2) + layer.cx * tw; v4 = (v4 / 2) + layer.cy * th;
          }

          // The first layer (most dominant) is drawn at 1.0 alpha to fill the background.
          // Subsequent layers are drawn at their weights to "blend" in.
          canvasCtx.globalAlpha = (index === 0) ? 1.0 : layer.alpha;
          drawWarpedTriangle(sourceImg, u1, v1, u2, v2, u3, v3, p1, p2, p3);
          drawWarpedTriangle(sourceImg, u2, v2, u4, v4, u3, v3, p2, p4, p3);
        });
      }
    }
  }
  canvasCtx.globalAlpha = 1.0;
}

function drawDebugMesh(width, height) {
  const gridX = 30;
  const gridY = 30;
  canvasCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
  canvasCtx.lineWidth = 0.5;

  for (let iy = 0; iy <= gridY; iy++) {
    for (let ix = 0; ix <= gridX; ix++) {
      const nx = ix / gridX;
      const ny = iy / gridY;
      const p = getWarpedPoint(nx, ny, width, height);

      // PART LOCALIZATION: Use same mapping as drawMovingMesh
      let isPart = false;
      if (neutralLandmarks) {
        const bounds = getFaceBounds();
        const fCX = (bounds.minX + bounds.maxX) / 2;
        const fCY = (bounds.minY + bounds.maxY) / 2;
        const mapX = (lx) => (lx - fCX) + 0.5;
        const mapY = (ly) => (ly - fCY) + 0.45;

        const dL = Math.hypot(nx - mapX(neutralLandmarks[468].x), ny - mapY(neutralLandmarks[468].y));
        const dR = Math.hypot(nx - mapX(neutralLandmarks[473].x), ny - mapY(neutralLandmarks[473].y));
        const dM = Math.hypot(nx - mapX(neutralLandmarks[13].x), ny - mapY(neutralLandmarks[13].y));
        isPart = (dL < 0.12 || dR < 0.12 || dM < 0.2);
      }

      // Draw point
      canvasCtx.fillStyle = isPart ? "yellow" : "red";
      canvasCtx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);

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

const handleImageLoad = (file, targetImg, isPrimary = false) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      targetImg.onload = () => {
        if (isPrimary) imageLoaded = true;
        console.log("Image loaded:", targetImg.src.substring(0, 50) + "...");
      };
      targetImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

imageUpload.addEventListener('change', (e) => handleImageLoad(e.target.files[0], characterImage, true));
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
