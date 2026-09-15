import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TimelineItem } from "../../scripts/generate-audio";

interface CharacterAvatarProps {
  speakerId: string; // "zundamon" | "metan"
  position: "left" | "right";
  activeDialogue: TimelineItem | null;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  speakerId,
  position,
  activeDialogue,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isSpeaking = activeDialogue?.speaker === speakerId;

  // 1. バウンス（発話開始時にピョコッと跳ねるアニメーション）
  let bounceY = 0;
  if (isSpeaking && activeDialogue) {
    const dialogueOffset = frame - activeDialogue.startFrame;
    const bounceProgress = spring({
      frame: dialogueOffset,
      fps,
      config: {
        damping: 10,
        mass: 0.6,
        stiffness: 180,
      },
    });
    bounceY = -Math.sin(Math.min(Math.PI, bounceProgress * Math.PI)) * 25;
  }

  // 2. まばたき（目パチ）判定
  const blinkCycle = speakerId === "zundamon" ? 85 : 95;
  const cycleFrame = (frame + (speakerId === "zundamon" ? 0 : 25)) % blinkCycle;

  let eyeState: "open" | "half" | "closed" = "open";
  if (cycleFrame === 0 || cycleFrame === 3) {
    eyeState = "half";
  } else if (cycleFrame === 1 || cycleFrame === 2) {
    eyeState = "closed";
  }

  // 感情による目の切り替え（happyなら笑顔目閉じ）
  if (isSpeaking && activeDialogue?.expression === "happy") {
    eyeState = "closed";
  }

  // 3. 口パク（リップシンク）判定
  let mouthVowel = "closed";
  if (isSpeaking && activeDialogue && activeDialogue.phonemes?.length > 0) {
    const dialogueOffset = frame - activeDialogue.startFrame;
    if (dialogueOffset >= 0 && dialogueOffset < activeDialogue.durationInFrames) {
      let matchedVowel = "closed";
      for (const p of activeDialogue.phonemes) {
        if (p.frameOffset <= dialogueOffset) {
          matchedVowel = p.vowel;
        } else {
          break;
        }
      }
      mouthVowel = matchedVowel;
    }
  }

  // 4. 眉毛・表情判定
  let eyebrowState = "normal";
  if (activeDialogue?.expression === "angry") {
    eyebrowState = "angry";
  } else if (activeDialogue?.expression === "surprised") {
    eyebrowState = "surprised";
  }

  // アクティブ／非アクティブ演出
  const scale = isSpeaking ? 1.03 : 0.96;
  const opacity = isSpeaking ? 1 : 0.78;
  const brightness = isSpeaking ? 1 : 0.85;

  const basePath = `characters/${speakerId}`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        [position === "left" ? "left" : "right"]: 60,
        width: 440,
        height: 660,
        transform: `translateY(${bounceY}px) scale(${scale})`,
        transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
        opacity,
        filter: `brightness(${brightness}) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.5))`,
        pointerEvents: "none",
        zIndex: isSpeaking ? 20 : 10,
      }}
    >
      {/* 体・ベース（PNG優先、なければSVG） */}
      <picture>
        <source srcSet={staticFile(`${basePath}/body.png`)} type="image/png" />
        <Img
          src={staticFile(`${basePath}/base.svg`)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </picture>

      {/* 眉（坂本アヒル素材用） */}
      <picture>
        <source srcSet={staticFile(`${basePath}/eyebrow_${eyebrowState}.png`)} type="image/png" />
        <span />
      </picture>

      {/* 目（目パチ：PNG優先、なければSVG） */}
      <picture>
        <source srcSet={staticFile(`${basePath}/eye_${eyeState}.png`)} type="image/png" />
        <Img
          src={staticFile(`${basePath}/eye_${eyeState}.svg`)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </picture>

      {/* 口（音素リップシンク：PNG優先、なければSVG） */}
      <picture>
        <source srcSet={staticFile(`${basePath}/mouth_${mouthVowel}.png`)} type="image/png" />
        <Img
          src={staticFile(`${basePath}/mouth_${mouthVowel}.svg`)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </picture>
    </div>
  );
};
