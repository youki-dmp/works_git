import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { CharacterAvatar } from "./components/CharacterAvatar";
import { SlideArea } from "./components/SlideArea";
import { SubtitleBanner } from "./components/SubtitleBanner";
import timelineDataRaw from "./data/timeline.json";
import { TimelineData, TimelineItem } from "../scripts/generate-audio";

const timelineData = timelineDataRaw as unknown as TimelineData;

export const CommentaryVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // 現在再生中のセリフを判定
  let activeDialogue: TimelineItem | null = null;
  for (const item of timelineData.timeline) {
    if (frame >= item.startFrame && frame < item.startFrame + item.durationInFrames) {
      activeDialogue = item;
      break;
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* 1. 背景 */}
      <Background />

      {/* 2. スライド・図解エリア */}
      <SlideArea activeDialogue={activeDialogue} />

      {/* 3. 音声トラックのシーケンス配置 */}
      {timelineData.timeline.map((item) => (
        <Sequence
          key={`audio-${item.id}`}
          from={item.startFrame}
          durationInFrames={item.durationInFrames}
        >
          <Audio src={staticFile(item.audioFile)} volume={1.0} />
        </Sequence>
      ))}

      {/* 4. 左側キャラクター: ずんだもん */}
      <CharacterAvatar
        speakerId="zundamon"
        position="left"
        activeDialogue={activeDialogue}
      />

      {/* 5. 右側キャラクター: 四国めたん */}
      <CharacterAvatar
        speakerId="metan"
        position="right"
        activeDialogue={activeDialogue}
      />

      {/* 6. 字幕テロップバナー */}
      <SubtitleBanner
        activeDialogue={activeDialogue}
        speakers={timelineData.speakers}
      />
    </div>
  );
};
