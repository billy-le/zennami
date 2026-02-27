export function Orb() {
  return (
    <div className="relative w-40 h-40 mb-7 shrink-0">
      {/* Spinning ring */}
      <div
        className="absolute animate-spin-slow rounded-full border border-amber/15"
        style={{ inset: "-16px" }}
      >
        {/* Ring dot */}
        <div
          className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber rounded-full"
          style={{ boxShadow: "0 0 6px #c9a96e" }}
        />
      </div>

      {/* Main orb */}
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center animate-orb-breathe relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(143,168,136,0.4) 0%, transparent 50%), radial-gradient(circle at 65% 65%, rgba(26,35,24,0.9) 0%, transparent 60%), conic-gradient(from 180deg, #2d3b2e, #3d5238, #4a6741, #3d5238, #2d3b2e, #1a2318, #2d3b2e)",
        }}
      >
        {/* Inner disc */}
        <div
          className="size-17 rounded-full flex items-center justify-center border border-amber/25"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(201,169,110,0.2), rgba(26,35,24,0.95))",
          }}
        >
          <LeafIcon />
        </div>
      </div>
    </div>
  );
}

function LeafIcon() {
  return (
    <svg
      className="w-7 h-7 opacity-70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(201,169,110,0.8)"
      strokeWidth="1.2"
    >
      <path d="M12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12C22 17.5 17.5 22 12 22Z" />
      <path d="M7 12C7 9.2 9.2 7 12 7C14.8 7 17 9.2 17 12" />
      <path d="M12 17V7" />
    </svg>
  );
}
