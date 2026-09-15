import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TimelineItem } from "../../scripts/generate-audio";

interface SlideAreaProps {
  activeDialogue: TimelineItem | null;
}

export const SlideArea: React.FC<SlideAreaProps> = ({ activeDialogue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentSlide = activeDialogue?.slide || "slide1.svg";

  // スライド切り替え時のアニメーション
  const offset = activeDialogue ? frame - activeDialogue.startFrame : 0;
  const enterScale = spring({
    frame: offset,
    fps,
    config: {
      damping: 15,
      mass: 0.6,
      stiffness: 150,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: "50%",
        transform: `translateX(-50%) scale(${0.95 + enterScale * 0.05})`,
        width: 1060,
        height: 596,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.65), 0 0 30px rgba(99, 102, 241, 0.2)",
        border: "3px solid rgba(255, 255, 255, 0.15)",
        zIndex: 5,
        backgroundColor: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img
        src={staticFile(`slides/${currentSlide}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};
