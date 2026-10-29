import { useState } from "react";

const MAX_IMAGE_LENGTH = 500000;

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be opened."));
    image.src = source;
  });
}

async function prepareImage(file) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Choose a PNG, JPG, or WebP image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
  const image = await loadImage(await readImage(file));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is unavailable in this browser.");
  let maxSide = 1400;
  while (maxSide >= 400) {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.84, 0.72, 0.6, 0.48]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= MAX_IMAGE_LENGTH) return dataUrl;
    }
    maxSide = Math.floor(maxSide * 0.75);
  }
  throw new Error("This image is too detailed to upload. Try a smaller image.");
}

export default function ImageUpload({ label, value, onChange }) {
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  async function select(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      onChange(await prepareImage(file));
    } catch (imageError) {
      setError(imageError.message);
    } finally {
      setProcessing(false);
      event.target.value = "";
    }
  }

  return (
    <div className="field image-upload-field">
      <span>{label}</span>
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={select} disabled={processing} aria-label={label} />
      {processing && <small>Preparing image…</small>}
      {error && <small role="alert">{error}</small>}
      {value && <div className="image-upload-preview"><img src={value} alt="Selected preview" /><button type="button" className="button button-quiet button-small" onClick={() => onChange("")}>Remove image</button></div>}
    </div>
  );
}
