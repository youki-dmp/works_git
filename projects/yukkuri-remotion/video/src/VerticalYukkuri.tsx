import { AbsoluteFill, Audio, Img, useVideoConfig, useCurrentFrame, Sequence, staticFile, spring, interpolate } from 'remotion';

interface DialogueItem {
    speaker: string;
    text: string;
    audio: string;
    duration: number;
}

interface YukkuriProps {
    seriesData: DialogueItem[];
    prefectureName: string;
    backgroundUrl: string;
    bgmFile: string;
}

const Speaker: React.FC<{ name: string; isActive: boolean; frame: number }> = ({ name, isActive, frame }) => {
	const opacity = isActive ? 1 : 0.4;
	const baseScale = name === 'zundamon' ? 1.0 : 0.8; // Reduced size slightly to prevent overlap
	const scale = (isActive ? 1.05 : 0.95) * baseScale; 
	
	const position = name === 'zundamon' ? { left: -100 } : { right: -100 };
	const imgFile = name === 'zundamon' ? 'ずんだもん立ち絵素材2.3.png' : '四国めたん立ち絵素材2.1.png';
	const flip = name === 'zundamon' ? 'scaleX(-1)' : 'none';

	return (
		<div style={{
			position: 'absolute',
			bottom: -100, // Sunk deeper into the bottom edge
			...position,
			opacity,
			transform: `scale(${scale}) ${flip}`,
			width: 650, 
		}}>
			<Img src={staticFile(imgFile)} style={{ width: '100%' }} />
		</div>
	);
};

export const VerticalYukkuri: React.FC<YukkuriProps> = ({ seriesData, prefectureName, backgroundUrl, bgmFile }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	let currentStart = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'sans-serif' }}>
			<AbsoluteFill style={{ transform: `scale(${interpolate(frame, [0, 1800], [2, 2.4])})` }}>
				<Img src={staticFile(`background/${backgroundUrl}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
			</AbsoluteFill>

			{seriesData.map((item, i) => {
                const itemDuration = item.duration || 4.0;
				const start = Math.round(currentStart * fps);
				const duration = Math.round(itemDuration * fps);
				currentStart += itemDuration;

                const scaleVal = i === 0 
                    ? spring({ frame: frame - start, fps, config: { stiffness: 200 } })
                    : 1;

				return (
					<Sequence key={i} from={start} durationInFrames={duration}>
						<AbsoluteFill>
							{/* Characters */}
							<Speaker name="zundamon" isActive={item.speaker === 'zundamon'} frame={frame - start} />
							<Speaker name="metan" isActive={item.speaker === 'metan'} frame={frame - start} />

							{/* Vertical Caption Box - MOVED UP and TEXT ADJUSTED */}
							<div style={{
								position: 'absolute',
								top: 350, // Moved up from 500 to provide more head space
								left: 0,
                                right: 0,
								display: 'flex',
                                flexDirection: 'column',
								alignItems: 'center',
                                justifyContent: 'center',
							}}>
								<div style={{
									backgroundColor: 'rgba(255, 255, 255, 0.95)',
									padding: '40px 30px',
									borderRadius: 30,
									border: `12px solid ${item.speaker === 'zundamon' ? '#4CAF50' : '#E91E63'}`,
									color: '#222',
									fontSize: 64, 
									fontWeight: '900',
									textAlign: 'center',
									boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
									lineHeight: 1.25,
									width: '85%', 
									transform: `scale(${scaleVal})`,
									position: 'relative',
								}}>
									{/* Nameplate */}
									<div style={{
										position: 'absolute',
										top: -65,
										[item.speaker === 'zundamon' ? 'left' : 'right']: 20,
										fontSize: 40,
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
							</div>

							<Audio src={staticFile(`audio/${item.audio}`)} />
						</AbsoluteFill>
					</Sequence>
				);
			})}

			<div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: 50, backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px 50px', borderRadius: 25, borderBottom: '10px solid #00ff00', fontWeight: '900', whiteSpace: 'nowrap' }}>
				{prefectureName}
			</div>
		</AbsoluteFill>
	);
};
