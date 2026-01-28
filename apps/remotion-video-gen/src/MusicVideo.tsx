import { AbsoluteFill, Audio, Img, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';

interface MusicVideoProps {
	audioSrc: string;
	imageSrc: string;
	title: string;
}

export const MusicVideo: React.FC<MusicVideoProps> = ({ audioSrc, imageSrc, title }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Subtle zoom effect for the background image
	const scale = interpolate(frame, [0, 300 * fps], [1, 1.1], {
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			{/* Background Image with Zoom */}
			<AbsoluteFill style={{ transform: `scale(${scale})` }}>
				<Img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>

			{/* Dark Overlay for Text Readability */}
			<AbsoluteFill style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />

			{/* Audio */}
			<Audio src={audioSrc} />

			{/* Title Overlay */}
			<AbsoluteFill style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}>
				<div style={{
					color: 'white',
					fontSize: 80,
					fontFamily: 'serif',
					textShadow: '0 0 20px rgba(0,0,0,0.8)',
					letterSpacing: '0.1em',
					opacity: interpolate(frame, [0, 30, 150, 180], [0, 1, 1, 0], {
						extrapolateRight: 'clamp',
					}),
				}}>
					{title}
				</div>
			</AbsoluteFill>

			{/* Lo-fi Dust/Grain Effect (Simplified) */}
			<AbsoluteFill style={{
				opacity: 0.1,
				pointerEvents: 'none',
				backgroundImage: `url('https://www.transparenttextures.com/patterns/asfalt-dark.png')`,
			}} />
		</AbsoluteFill>
	);
};
