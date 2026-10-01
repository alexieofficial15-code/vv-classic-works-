import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgPaths = [
  path.resolve(__dirname, '../public/hero_engine_1.jpg'),
  path.resolve(__dirname, '../public/hero_engine_2.jpg'),
  path.resolve(__dirname, '../public/hero_engine_3.jpg'),
  path.resolve(__dirname, '../public/hero_engine_4.jpg'),
  path.resolve(__dirname, '../public/hero_engine_5.jpg'),
  path.resolve(__dirname, '../public/hero_engine_6.jpg'),
  path.resolve(__dirname, '../public/hero_engine_7.jpg'),
];

const outputPath = path.resolve(__dirname, '../public/hero_engine_video.webm');
const assetsOutputPath = path.resolve(__dirname, '../src/assets/hero_engine_video.webm');

const base64Images = imgPaths.map(p => `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`);

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
    canvas { width: 1280px; height: 720px; display: block; }
  </style>
</head>
<body>
  <canvas id="c" width="1280" height="720"></canvas>
  <script>
    async function run() {
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;

      const loadImg = (src) => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });

      const images = await Promise.all(${JSON.stringify(base64Images)}.map(src => loadImg(src)));

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 3500000
      });

      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      const durationPerSlide = 3500; // 3.5 seconds per engine
      const fadeDuration = 1100; // 1.1s smooth crossfade
      const totalDuration = durationPerSlide * images.length;
      const fps = 30;
      const totalFrames = Math.floor((totalDuration / 1000) * fps);

      recorder.start();

      function drawCover(img, scale = 1.0, panX = 0, panY = 0, alpha = 1.0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        
        const imgRatio = img.width / img.height;
        const targetRatio = W / H;
        let dw, dh;
        if (imgRatio > targetRatio) {
          dh = H * scale;
          dw = dh * imgRatio;
        } else {
          dw = W * scale;
          dh = dw / imgRatio;
        }

        const dx = (W - dw) / 2 + panX * (dw - W);
        const dy = (H - dh) / 2 + panY * (dh - H);
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }

      function drawVignette() {
        ctx.save();
        const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, W * 0.7);
        grad.addColorStop(0, 'rgba(10, 10, 12, 0)');
        grad.addColorStop(0.7, 'rgba(10, 10, 12, 0.4)');
        grad.addColorStop(1, 'rgba(10, 10, 12, 0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.35);
        topGrad.addColorStop(0, 'rgba(10, 10, 12, 0.6)');
        topGrad.addColorStop(1, 'rgba(10, 10, 12, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, W, H * 0.35);

        ctx.restore();
      }

      for (let f = 0; f < totalFrames; f++) {
        const time = (f / fps) * 1000;
        const currentSlideIndex = Math.floor(time / durationPerSlide) % images.length;
        const nextSlideIndex = (currentSlideIndex + 1) % images.length;
        const slideProgress = (time % durationPerSlide) / durationPerSlide;

        ctx.fillStyle = '#0f0f11';
        ctx.fillRect(0, 0, W, H);

        const currScale = 1.04 + slideProgress * 0.07;
        const currPan = Math.sin(slideProgress * Math.PI) * 0.025;
        drawCover(images[currentSlideIndex], currScale, currPan, 0, 1.0);

        const transitionStart = (durationPerSlide - fadeDuration) / durationPerSlide;
        if (slideProgress > transitionStart) {
          const fadeProgress = (slideProgress - transitionStart) / (1 - transitionStart);
          const nextScale = 1.0 + fadeProgress * 0.05;
          drawCover(images[nextSlideIndex], nextScale, 0, 0, fadeProgress);
        }

        drawVignette();
        await new Promise(r => setTimeout(r, 1000 / fps));
      }

      recorder.stop();
      await new Promise(res => { recorder.onstop = res; });

      const blob = new Blob(chunks, { type: mimeType });
      const reader = new FileReader();
      reader.onloadend = () => {
        window._recordedBase64 = reader.result.split(',')[1];
      };
      reader.readAsDataURL(blob);
    }
    run();
  </script>
</body>
</html>
`;

async function main() {
  console.log('Launching browser to generate 7-engine WebM video loop...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.setContent(html);

  console.log('Rendering all 7 engine frames (approx 24-28 seconds)...');
  await page.waitForFunction('window._recordedBase64 !== undefined', { timeout: 60000 });

  const base64Data = await page.evaluate(() => window._recordedBase64);
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  fs.writeFileSync(assetsOutputPath, buffer);
  console.log(`Video generated successfully at: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

  await browser.close();
}

main().catch(err => {
  console.error('Error generating video:', err);
  process.exit(1);
});
