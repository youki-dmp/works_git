import { AbsoluteFill, Audio, Img, useVideoConfig, useCurrentFrame, Sequence, staticFile, spring, interpolate } from 'remotion';
import rawData from './data.json';

interface DialogueItem {
    speaker: string;
    text: string;
    audio: string;
    duration: number;
}

const data = rawData as DialogueItem[];

const Speaker: React.FC<{ name: string; isActive: boolean; frame: number }> = ({ name, isActive, frame }) => {
	// Talk bounce animation
	const bounce = isActive 
		? Math.sin(frame / 2) * 15 
		: 0;

	const opacity = isActive ? 1 : 0.4;
	const scale = isActive ? 1.05 : 0.95;
	const position = name === 'zundamon' ? { left: 100 } : { right: 100 };
	const imgFile = name === 'zundamon' ? 'ずんだもん立ち絵素材2.3.png' : '四国めたん立ち絵素材2.1.png';
	
	// Flip Zundamon to face inwards
	const flip = name === 'zundamon' ? 'scaleX(-1)' : 'none';

	return (
		<div style={{
			position: 'absolute',
			bottom: 50 + bounce,
			...position,
			opacity,
			transform: `scale(${scale}) ${flip}`,
			width: 500,
		}}>
			<Img src={staticFile(imgFile)} style={{ width: '100%' }} />
		</div>
	);
};

export const Yukkuri: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	let currentStart = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'sans-serif' }}>
			{/* BGM */}
			<Audio 
				src={staticFile('batch-001/audio/Shinjuku Neon Rain（新宿・雨）_1.mp3')} 
				volume={0.15} 
				loop 
			/>

			{/* Background - Tokyo Landscape with slow zoom */}
			<AbsoluteFill style={{
				transform: `scale(${interpolate(frame, [0, 1800], [1, 1.2])})`
			}}>
				<Img 
					src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=80" 
					style={{ 
						width: '100%', 
						height: '100%', 
						objectFit: 'cover',
						opacity: 0.6 
					}} 
				/>
			</AbsoluteFill>

			{/* Dialogue Sequences */}
			{data.map((item, i) => {
				const start = Math.round(currentStart * fps);
				const duration = Math.round(item.duration * fps);
				currentStart += item.duration;

				return (
					<Sequence key={i} from={start} durationInFrames={duration}>
						<AbsoluteFill>
							{/* Characters */}
							<Speaker name="zundamon" isActive={item.speaker === 'zundamon'} frame={frame - start} />
							<Speaker name="metan" isActive={item.speaker === 'metan'} frame={frame - start} />

							{/* Caption Box */}
							<div style={{
								position: 'absolute',
								bottom: 100,
								left: '10%',
								right: '10%',
								height: 180,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}>
								<div style={{
									backgroundColor: 'rgba(255, 255, 255, 0.95)',
									padding: '20px 50px',
									borderRadius: 20,
									border: `8px solid ${item.speaker === 'zundamon' ? '#4CAF50' : '#E91E63'}`,
									color: '#333',
									fontSize: 48,
									fontWeight: '900',
									textAlign: 'center',
									width: '100%',
									boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
									position: 'relative',
								}}>
									{/* Nameplate - Top Left/Right of the Bubble */}
									<div style={{
										position: 'absolute',
										top: -45,
										[item.speaker === 'zundamon' ? 'left' : 'right']: 20,
										fontSize: 32,
										color: 'white',
										backgroundColor: item.speaker === 'zundamon' ? '#4CAF50' : '#E91E63',
										padding: '5px 25px',
										borderRadius: 15,
										fontWeight: 'bold',
										border: '3px solid white',
										boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
										whiteSpace: 'nowrap',
									}}>
										{item.speaker === 'zundamon' ? 'ずんだもん' : '四国めたん'}
									</div>

									{item.text}
								</div>
							</div>

							{/* Voice */}
							<Audio src={staticFile(`audio/${item.audio}`)} />
						</AbsoluteFill>
					</Sequence>
				);
			})}

			{/* Overlay Effects - Vignette */}
			<AbsoluteFill style={{
				boxShadow: 'inset 0 0 200px rgba(0,0,0,0.5)',
				pointerEvents: 'none'
			}} />

			{/* Header */}
			<div style={{
				position: 'absolute',
				top: 40,
				left: 40,
				color: 'white',
				fontSize: 32,
				backgroundColor: 'rgba(0,0,0,0.7)',
				padding: '12px 35px',
				borderRadius: 15,
				borderLeft: '12px solid #00ff00',
				fontWeight: '900',
				letterSpacing: '0.05em',
			}}>
				1分でわかる！東京都の成り立ち
			</div>
		</AbsoluteFill>
	);
};
