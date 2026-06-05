const speedOfLight = 299792458;
const planckEv = 4.135667696e-15;

const wavelengthInput = document.querySelector("#wavelength");
const temperatureInput = document.querySelector("#temperature");
const wavelengthOut = document.querySelector("#wavelengthOut");
const frequencyOut = document.querySelector("#frequencyOut");
const energyOut = document.querySelector("#energyOut");
const regionOut = document.querySelector("#regionOut");
const waveCaption = document.querySelector("#waveCaption");
const tempOut = document.querySelector("#tempOut");
const tempExplain = document.querySelector("#tempExplain");
const thermalObject = document.querySelector("#thermalObject");

const heroCanvas = document.querySelector("#heroCanvas");
const waveCanvas = document.querySelector("#waveCanvas");
const heroCtx = heroCanvas.getContext("2d");
const waveCtx = waveCanvas.getContext("2d");

let phase = 0;

function formatFrequency(hz) {
  if (hz >= 1e12) return `${(hz / 1e12).toFixed(2)} THz`;
  return `${(hz / 1e9).toFixed(2)} GHz`;
}

function formatEnergy(ev) {
  if (ev >= 0.01) return `${ev.toFixed(3)} eV`;
  return `${ev.toExponential(2)} eV`;
}

function infraredRegion(micrometers) {
  if (micrometers < 1.4) {
    return {
      name: "Near infrared",
      note: "closest to visible red light and used in remotes, sensors, and fiber optics."
    };
  }
  if (micrometers < 3) {
    return {
      name: "Short-wave infrared",
      note: "useful for imaging through haze and studying materials."
    };
  }
  if (micrometers < 8) {
    return {
      name: "Mid infrared",
      note: "important for molecular fingerprints in spectroscopy."
    };
  }
  if (micrometers < 15) {
    return {
      name: "Long-wave infrared",
      note: "the region many thermal cameras use to detect warm objects."
    };
  }
  return {
    name: "Far infrared",
    note: "closer to microwaves and connected with low-energy thermal radiation."
  };
}

function resizeCanvas(canvas, ctx) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
}

function drawHero() {
  resizeCanvas(heroCanvas, heroCtx);
  const width = heroCanvas.getBoundingClientRect().width;
  const height = heroCanvas.getBoundingClientRect().height;
  heroCtx.clearRect(0, 0, width, height);

  const gradient = heroCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.48)");
  gradient.addColorStop(1, "rgba(255, 118, 49, 0.16)");
  heroCtx.fillStyle = gradient;
  roundedRect(heroCtx, 18, 18, width - 36, height - 36, 26);
  heroCtx.fill();

  const spectrumY = height * 0.76;
  const spectrumX = width * 0.11;
  const spectrumW = width * 0.78;
  const spectrumH = 28;
  const spectrum = heroCtx.createLinearGradient(spectrumX, 0, spectrumX + spectrumW, 0);
  spectrum.addColorStop(0, "#274f45");
  spectrum.addColorStop(0.25, "#337c92");
  spectrum.addColorStop(0.48, "#e8572f");
  spectrum.addColorStop(0.57, "#f5c938");
  spectrum.addColorStop(0.67, "#3e7bdc");
  spectrum.addColorStop(0.82, "#6b4aa3");
  spectrum.addColorStop(1, "#17151a");
  heroCtx.fillStyle = spectrum;
  roundedRect(heroCtx, spectrumX, spectrumY, spectrumW, spectrumH, 14);
  heroCtx.fill();
  heroCtx.strokeStyle = "rgba(29, 24, 32, 0.22)";
  heroCtx.lineWidth = 1;
  heroCtx.stroke();

  drawWaveLine(heroCtx, width, height, 86, 36, phase, "#7c1f1f", 6);
  drawWaveLine(heroCtx, width, height, 48, 24, phase * 1.35 + 2, "#e8572f", 4);
  drawWaveLine(heroCtx, width, height, 34, 14, phase * 1.8 + 4, "#f0b437", 3);

  heroCtx.fillStyle = "#1d1820";
  heroCtx.font = "800 16px system-ui";
  heroCtx.fillText("Infrared", spectrumX + spectrumW * 0.42, spectrumY + 54);
  heroCtx.fillText("Visible", spectrumX + spectrumW * 0.57, spectrumY + 54);
  heroCtx.fillText("Microwave", spectrumX + spectrumW * 0.16, spectrumY + 54);
}

function drawWaveLine(ctx, width, height, wavelengthPixels, amplitude, offset, color, lineWidth) {
  const centerY = height * 0.43;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 3) {
    const y = centerY + Math.sin((x / wavelengthPixels) + offset) * amplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawWaveModel(micrometers) {
  resizeCanvas(waveCanvas, waveCtx);
  const width = waveCanvas.getBoundingClientRect().width;
  const height = waveCanvas.getBoundingClientRect().height;
  waveCtx.clearRect(0, 0, width, height);

  waveCtx.fillStyle = "#17151a";
  waveCtx.fillRect(0, 0, width, height);

  waveCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  waveCtx.lineWidth = 1;
  for (let x = 0; x < width; x += 55) {
    waveCtx.beginPath();
    waveCtx.moveTo(x, 0);
    waveCtx.lineTo(x, height);
    waveCtx.stroke();
  }
  for (let y = 0; y < height; y += 55) {
    waveCtx.beginPath();
    waveCtx.moveTo(0, y);
    waveCtx.lineTo(width, y);
    waveCtx.stroke();
  }

  const normalized = (Math.log10(micrometers) - Math.log10(0.78)) / (Math.log10(1000) - Math.log10(0.78));
  const wavelengthPixels = 34 + normalized * 230;
  const amplitude = 70 - normalized * 22;
  const centerY = height * 0.48;

  const glow = waveCtx.createLinearGradient(0, 0, width, 0);
  glow.addColorStop(0, "#f0b437");
  glow.addColorStop(0.45, "#e8572f");
  glow.addColorStop(1, "#b91c36");

  waveCtx.beginPath();
  for (let x = 0; x <= width; x += 2) {
    const y = centerY + Math.sin((x / wavelengthPixels) + phase) * amplitude;
    if (x === 0) waveCtx.moveTo(x, y);
    else waveCtx.lineTo(x, y);
  }
  waveCtx.strokeStyle = glow;
  waveCtx.lineWidth = 7;
  waveCtx.lineCap = "round";
  waveCtx.shadowColor = "rgba(232, 87, 47, 0.7)";
  waveCtx.shadowBlur = 18;
  waveCtx.stroke();
  waveCtx.shadowBlur = 0;

  drawCrestMarkers(waveCtx, width, centerY, wavelengthPixels, amplitude);
}

function drawCrestMarkers(ctx, width, centerY, wavelengthPixels, amplitude) {
  const crestA = wavelengthPixels * (Math.PI * 0.5 - phase);
  let first = crestA;
  while (first < 40) first += Math.PI * 2 * wavelengthPixels;
  const second = first + Math.PI * 2 * wavelengthPixels;
  if (second > width - 40) return;

  const y1 = centerY + Math.sin((first / wavelengthPixels) + phase) * amplitude;
  const y2 = centerY + Math.sin((second / wavelengthPixels) + phase) * amplitude;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.moveTo(first, y1 + 22);
  ctx.lineTo(first, y1 + 92);
  ctx.moveTo(second, y2 + 22);
  ctx.lineTo(second, y2 + 92);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(first, y1 + 72);
  ctx.lineTo(second, y2 + 72);
  ctx.stroke();

  ctx.fillStyle = "#fff3df";
  ctx.font = "800 14px system-ui";
  ctx.fillText("one wavelength", first + 14, y1 + 64);
}

function updateWaveData() {
  const micrometers = Number(wavelengthInput.value);
  const meters = micrometers * 1e-6;
  const frequency = speedOfLight / meters;
  const energy = planckEv * frequency;
  const region = infraredRegion(micrometers);

  wavelengthOut.textContent = micrometers < 10 ? `${micrometers.toFixed(2)} µm` : `${micrometers.toFixed(1)} µm`;
  frequencyOut.textContent = formatFrequency(frequency);
  energyOut.textContent = formatEnergy(energy);
  regionOut.textContent = region.name;
  waveCaption.textContent = `At ${wavelengthOut.textContent}, this wave is in ${region.name.toLowerCase()} and is ${region.note}`;
}

function updateTemperature() {
  const temp = Number(temperatureInput.value);
  const heat = temp / 100;
  tempOut.textContent = `${temp}°C`;

  if (temp < 20) tempExplain.textContent = "cooler, so the thermal image stays darker.";
  else if (temp < 55) tempExplain.textContent = "warm enough to glow brightly on a thermal image.";
  else tempExplain.textContent = "hot, producing much stronger infrared emission.";

  const hueA = 250 - heat * 210;
  const hueB = 20 + heat * 38;
  thermalObject.style.background = `radial-gradient(circle at 42% 32%, hsl(${hueB}, 100%, 82%), hsl(${hueB}, 96%, 56%) 25%, hsl(${hueA}, 78%, 50%) 58%, #14143c 100%)`;
  thermalObject.style.boxShadow = `0 0 ${18 + heat * 72}px hsla(${hueB}, 100%, 58%, ${0.25 + heat * 0.65})`;
  thermalObject.style.transform = `translate(-50%, -54%) scale(${0.82 + heat * 0.28})`;
}

function animate() {
  phase += 0.025;
  drawHero();
  drawWaveModel(Number(wavelengthInput.value));
  requestAnimationFrame(animate);
}

wavelengthInput.addEventListener("input", updateWaveData);
temperatureInput.addEventListener("input", updateTemperature);
window.addEventListener("resize", () => {
  drawHero();
  drawWaveModel(Number(wavelengthInput.value));
});

updateWaveData();
updateTemperature();
animate();
