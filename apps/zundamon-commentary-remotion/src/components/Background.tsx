import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // ゆっくり回転・移動する背景の微細なグラデーション演出
  const rotation = interpolate(frame, [0, 900], [0, 360], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#0f172a",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 幾何学背景グラデーション */}
      <div
        style={{
          position: "absolute",
          width: "140%",
          height: "140%",
          background: "radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.12) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 60%)",
          transform: `rotate(${rotation * 0.05}deg)`,
        }}
      />

      {/* グリッドドットパターン */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 上下ビネット効果（動画の引き締め） */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, transparent 20%, transparent 80%, rgba(15, 23, 42, 0.8) 100%)",
        }}
      />
    </div>
  );
};
