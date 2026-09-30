"use client";

import { QRCodeSVG } from "qrcode.react";

export default function AttendanceQr({ value }: { value: string }) {
  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 16, display: "inline-block" }}>
      <QRCodeSVG value={value} size={240} includeMargin />
    </div>
  );
}
