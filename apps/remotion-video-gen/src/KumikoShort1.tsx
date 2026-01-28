import { AbsoluteFill, Video, Sequence, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';

export const KumikoShort1: React.FC = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			{/* Scene 1: Greeting (with frame) */}
			<Sequence from={0} durationInFrames={8 * fps}>
				<Video src={require('../../../ai-talent-auto-op/assets/scene1.mp4')} />
			</Sequence>

			{/* Scene 2: Explanation (Demonstration) */}
			<Sequence from={8 * fps} durationInFrames={8 * fps}>
				<Video src={require('../../../ai-talent-auto-op/assets/scene2.mp4')} />
			</Sequence>

			{/* Scene 3: Closing (LINE Induction) */}
			<Sequence from={16 * fps} durationInFrames={8 * fps}>
				<Video src={require('../../../ai-talent-auto-op/assets/scene3.mp4')} />
			</Sequence>
			
			{/* Overlay Text / Captions */}
			<AbsoluteFill style={{
				justifyContent: 'flex-end',
				alignItems: 'center',
				paddingBottom: 100,
			}}>
				<div style={{
					backgroundColor: 'rgba(0,0,0,0.6)',
					color: 'white',
					padding: '20px 40px',
					borderRadius: 20,
					fontSize: 40,
					fontFamily: 'sans-serif',
					textAlign: 'center',
					width: '80%'
				}}>
					{frame < 8 * fps && "こんにちは、佐藤くみこです。"}
					{frame >= 8 * fps && frame < 16 * fps && "スマホが『魔法の杖』に変わります。"}
					{frame >= 16 * fps && "続きはLINEで！"}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
