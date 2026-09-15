import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TimelineItem } from "../../scripts/generate-audio";

interface SpeakerConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  strokeColor: string;
}

interface SubtitleBannerProps {
  activeDialogue: TimelineItem | null;
  speakers: Record<string, SpeakerConfig>;
}

export const SubtitleBanner: React.FC<SubtitleBannerProps> = ({
  activeDialogue,
  speakers,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!activeDialogue) {
    return null;
  }

  const speaker = speakers[activeDialogue.speaker] || {
    name: activeDialogue.speaker,
    primaryColor: "#22c55e",
    secondaryColor: "#15803d",
    textColor: "#ffffff",
    strokeColor: "#052e16",
  };

  const offset = frame - activeDialogue.startFrame;
  const popProgress = spring({
    frame: offset,
    fps,
    config: {
      damping: 14,
      mass: 0.5,
      stiffness: 220,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 35,
        left: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        pointerEvents: "none",
        transform: `scale(${0.96 + popProgress * 0.04})`,
        opacity: Math.min(1, popProgress * 1.5),
      }}
    >
      {/* ネームプレート */}
      <div
        style={{
          alignSelf: activeDialogue.speaker === "zundamon" ? "flex-start" : "flex-end",
          marginLeft: activeDialogue.speaker === "zundamon" ? "260px" : "auto",
          marginRight: activeDialogue.speaker === "metan" ? "260px" : "auto",
          marginBottom: -14,
          zIndex: 51,
          backgroundColor: speaker.primaryColor,
          color: "#ffffff",
          padding: "6px 24px",
          borderRadius: "20px 20px 0 0",
          fontSize: 22,
          fontWeight: "900",
          letterSpacing: 2,
          border: `3px solid ${speaker.secondaryColor}`,
          borderBottom: "none",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          fontFamily: "'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif",
        }}
      >
        {speaker.name}
      </div>

      {/* テロップ本体（二重縁取り＆半透明カード） */}
      <div
        style={{
          width: "74%",
          minHeight: 110,
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(8px)",
          borderRadius: 24,
          border: `4px solid ${speaker.primaryColor}`,
          boxShadow: `0 12px 30px rgba(0, 0, 0, 0.6), 0 0 25px ${speaker.primaryColor}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 36px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 34,
            fontWeight: "900",
            lineHeight: 1.35,
            textAlign: "center",
            fontFamily: "'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
            textShadow: `
              -3px -3px 0 ${speaker.strokeColor},
               3px -3px 0 ${speaker.strokeColor},
              -3px  3px 0 ${speaker.strokeColor},
               3px  3px 0 ${speaker.strokeColor},
              -4px  0   0 ${speaker.strokeColor},
               4px  0   0 ${speaker.strokeColor},
               0   -4px 0 ${speaker.strokeColor},
               0    4px 0 ${speaker.strokeColor},
               0    6px 12px rgba(0,0,0,0.8)
            `,
          }}
        >
          {activeDialogue.text}
        </div>
      </div>
    </div>
  );
};
