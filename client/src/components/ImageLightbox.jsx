import { useEffect } from "react";

const ImageLightbox = ({ src, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 20,
          background: "rgba(255,255,255,0.15)", border: "none",
          borderRadius: "50%", width: 40, height: 40,
          cursor: "pointer", color: "#fff", fontSize: "20px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >✕</button>
      <img
        src={src} alt="full view"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw", maxHeight: "90vh",
          objectFit: "contain", borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default ImageLightbox;