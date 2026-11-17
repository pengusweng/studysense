import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The mark on the desk, for home screens. Same drawing as LogoMark, in the (only) dark palette. */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g transform="rotate(-4 16 16)">
    <rect x="5.5" y="3.5" width="21" height="25" rx="2.5" fill="#29233a" stroke="#ece7f7" stroke-width="1.6"/>
    <path d="M13 11h10.5M13 15.5h10.5" stroke="#4a4063" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M10.5 4.5v23" stroke="#ece7f7" stroke-opacity=".4" stroke-width="1.2"/>
  </g>
  <path d="M8.5 22.2 C 12 20.6, 15.5 23, 19.5 21.2 S 26 19.4, 29 20" fill="none" stroke="#b095ec" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#131019" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`} width={128} height={128} alt="" />
      </div>
    ),
    size,
  );
}
