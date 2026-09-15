import React from "react";
import { Composition } from "remotion";
import { CommentaryVideo } from "./CommentaryVideo";
import timelineDataRaw from "./data/timeline.json";

export const Root: React.FC = () => {
  const durationInFrames = (timelineDataRaw as any)?.totalDurationInFrames || 600;
  const fps = (timelineDataRaw as any)?.fps || 30;

  return (
    <>
      <Composition
        id="CommentaryVideo"
        component={CommentaryVideo}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
