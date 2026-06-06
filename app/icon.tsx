import { ImageResponse } from "next/og";
 
// Kích thước của Favicon
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";
 
// Hàm sinh icon động của Next.js
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          padding: 4,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fbfbfa"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
