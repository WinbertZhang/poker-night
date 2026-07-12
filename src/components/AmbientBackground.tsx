/* Fixed ambient blob layer — sits behind all page content.
   Pointer-events: none so it never blocks interaction. */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 0, pointerEvents: "none" }}
    >
      {/* Primary blob — top center, indigo */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(94,106,210,0.22) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float-a 10s ease-in-out infinite",
        }}
      />
      {/* Secondary blob — left, purple */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "-180px",
          width: "600px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(120,80,200,0.13) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "float-b 13s ease-in-out infinite",
        }}
      />
      {/* Tertiary blob — right, blue */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "-150px",
          width: "550px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(60,100,220,0.10) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "float-c 11s ease-in-out infinite",
        }}
      />
      {/* Bottom pulse — ambient warmth */}
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "30%",
          width: "700px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(94,106,210,0.08) 0%, transparent 70%)",
          filter: "blur(70px)",
          animation: "pulse-ambient 8s ease-in-out infinite",
        }}
      />
      {/* Grid overlay for technical feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
