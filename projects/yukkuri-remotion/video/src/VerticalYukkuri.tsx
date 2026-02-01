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
	const scale = isActive ? 0.9 : 0.8; // Vertical needs a bit smaller but balanced
	
	// Characters on left/right edges
	const position = name === 'zundamon' ? { left: -100 } : { right: -100 };
	const imgFile = name === 'zundamon' ? 'ずんだもん立ち絵素材2.3.png' : '四国めたん立ち絵素材2.1.png';
	const flip = name === 'zundamon' ? 'scaleX(-1)' : 'none';

	return (
		<div style={{
			position: 'absolute',
			bottom: 350 + bounce,
			...position,
			opacity,
			transform: `scale(${scale}) ${flip}`,
			width: 700,
		}}>
			<Img src={staticFile(imgFile)} style={{ width: '100%' }} />
		</div>
	);
};

export const VerticalYukkuri: React.FC<{ isSeries?: boolean; seriesData?: DialogueItem[]; prefectureName?: string }> = ({ isSeries, seriesData, prefectureName }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
    const activeData = seriesData || data;

	let currentStart = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'sans-serif' }}>
			{/* Background */}
			<AbsoluteFill style={{
				transform: `scale(${interpolate(frame, [0, 1800], [2, 2.4])})` 
			}}>
				<Img 
					src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=80" 
					style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
				/>
			</AbsoluteFill>

			{/* Dialogue Sequences */}
			{activeData.map((item, i) => {
				const start = Math.round(currentStart * fps);
				const duration = Math.round(item.duration * fps);
				currentStart += item.duration;

				return (
					<Sequence key={i} from={start} durationInFrames={duration}>
						<AbsoluteFill>
							{/* Characters */}
							<Speaker name="zundamon" isActive={item.speaker === 'zundamon'} frame={frame - start} />
							<Speaker name="metan" isActive={item.speaker === 'metan'} frame={frame - start} />

							{/* Vertical Caption Box (Center Screen) */}
							<div style={{
								position: 'absolute',
								top: 500,
								left: '5%',
								right: '5%',
								padding: '50px 30px',
								backgroundColor: 'rgba(255, 255, 255, 0.95)',
								borderRadius: 30,
								border: `12px solid ${item.speaker === 'zundamon' ? '#4CAF50' : '#E91E63'}`,
								color: '#222',
								fontSize: 70,
								fontWeight: '900',
								textAlign: 'center',
								boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
								lineHeight: 1.3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
							}}>
                                {/* Nameplate */}
                                <div style={{
                                    position: 'absolute',
                                    top: -60,
                                    [item.speaker === 'zundamon' ? 'left' : 'right']: 20,
                                    fontSize: 44,
                                    color: 'white',
                                    backgroundColor: item.speaker === 'zundamon' ? '#4CAF50' : '#E91E63',
                                    padding: '10px 40px',
                                    borderRadius: 20,
                                    fontWeight: 'bold',
                                    border: '4px solid white',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {item.speaker === 'zundamon' ? 'ずんだもん' : '四国めたん'}
                                </div>
								{item.text}
							</div>

							<Audio src={staticFile(`audio/${item.audio}`)} />
						</AbsoluteFill>
					</Sequence>
				);
			})}

			{/* Header */}
			<div style={{
				position: 'absolute',
				top: 150,
				left: '50%',
				transform: 'translateX(-50%)',
				color: 'white',
				fontSize: 50,
				backgroundColor: 'rgba(0,0,0,0.8)',
				padding: '20px 50px',
				borderRadius: 25,
				borderBottom: '10px solid #00ff00',
				fontWeight: '900',
				whiteSpace: 'nowrap'
			}}>
				{prefectureName || '東京都の成り立ち'}
			</div>
		</AbsoluteFill>
	);
};
