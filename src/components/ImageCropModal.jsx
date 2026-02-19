import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

// Utility: crop the image on a canvas and return a File
async function getCroppedFile(imageSrc, croppedAreaPixels, fileName) {
  const image = await createImageBitmap(
    await fetch(imageSrc).then((r) => r.blob()),
  );
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], fileName, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg");
  });
}

/**
 * Props:
 *  imageSrc      - object URL of the selected image
 *  aspect        - crop aspect ratio (default 1 for square, 3 for banner)
 *  title         - modal title string
 *  onCancel      - () => void
 *  onApply       - (File) => void  – returns the cropped File
 */
export default function ImageCropModal({
  imageSrc,
  aspect = 1,
  title = "Crop Image",
  onCancel,
  onApply,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const file = await getCroppedFile(
        imageSrc,
        croppedAreaPixels,
        title.replace(/\s+/g, "_") + ".jpg",
      );
      onApply(file);
    } finally {
      setApplying(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      {/* Card */}
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Cropper area */}
        <div className="relative w-full bg-gray-950" style={{ height: 340 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-5 py-3 border-t border-gray-800">
          <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <i className="fa-solid fa-magnifying-glass-plus text-gray-400 text-sm"></i>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm disabled:opacity-50"
          >
            {applying ? "Applying…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
