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
	const opacity = isActive ? 1 : 0.3;
	const scale = isActive ? 1.05 : 0.95;
	const position = name === 'zundamon' ? { left: 100 } : { right: 100 };
	const imgFile = name === 'zundamon' ? 'ずんだもん立ち絵素材2.3.png' : '四国めたん立ち絵素材2.1.png';
	const flip = name === 'zundamon' ? 'scaleX(-1)' : 'none';

    if (name === 'master') return null;

	return (
		<div style={{
			position: 'absolute',
			bottom: 50,
			...position,
			opacity,
			transform: `scale(${scale}) ${flip}`,
			width: 500,
		}}>
			<Img src={staticFile(imgFile)} style={{ width: '100%' }} />
		</div>
	);
};

export const Yukkuri: React.FC<YukkuriProps> = ({ seriesData, prefectureName, backgroundUrl, bgmFile }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	let currentStart = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'sans-serif' }}>
			<Audio src={staticFile(`batch-001/audio/${bgmFile}`)} volume={0.15} loop />

			<AbsoluteFill style={{ transform: `scale(${interpolate(frame, [0, 1800], [1, 1.2])})` }}>
				<Img src={staticFile(`background/${backgroundUrl}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
			</AbsoluteFill>

			{seriesData.map((item, i) => {
                const itemDuration = item.duration || 4.0;
				const start = Math.round(currentStart * fps);
				const duration = Math.round(itemDuration * fps);
				currentStart += itemDuration;

                const scaleVal = i === 0 
                    ? spring({ frame: frame - start, fps, config: { stiffness: 200 } })
                    : 1;

                const isMaster = item.speaker === 'master';
                const speakerColor = isMaster ? '#2196F3' : (item.speaker === 'zundamon' ? '#4CAF50' : '#E91E63');
                const speakerName = isMaster ? 'マスター' : (item.speaker === 'zundamon' ? 'ずんだもん' : '四国めたん');

				return (
					<Sequence key={i} from={start} durationInFrames={duration}>
						<AbsoluteFill>
							<Speaker name="zundamon" isActive={item.speaker === 'zundamon'} frame={frame - start} />
							<Speaker name="metan" isActive={item.speaker === 'metan'} frame={frame - start} />

							<div style={{
								position: 'absolute',
								bottom: isMaster ? 300 : 100,
								left: '10%',
								right: '10%',
								height: 180,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}>
								<div style={{
									backgroundColor: isMaster ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
									padding: '20px 50px',
									borderRadius: 20,
									border: `8px solid ${speakerColor}`,
									color: isMaster ? 'white' : '#333',
									fontSize: 48,
									fontWeight: '900',
									textAlign: 'center',
									width: '100%',
									boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
									position: 'relative',
                                    transform: `scale(${scaleVal})`,
								}}>
									<div style={{
										position: 'absolute',
										top: -45,
										[isMaster ? 'left' : (item.speaker === 'zundamon' ? 'left' : 'right')]: 20,
										fontSize: 32,
										color: 'white',
										backgroundColor: speakerColor,
										padding: '5px 25px',
										borderRadius: 15,
										fontWeight: 'bold',
										border: '3px solid white',
										boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
										whiteSpace: 'nowrap',
									}}>
										{speakerName}
									</div>
									{item.text}
								</div>
							</div>
							<Audio src={staticFile(`audio/${item.audio}`)} />
						</AbsoluteFill>
					</Sequence>
				);
			})}

			<AbsoluteFill style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
			<div style={{ position: 'absolute', top: 40, left: 40, color: 'white', fontSize: 32, backgroundColor: 'rgba(0,0,0,0.7)', padding: '12px 35px', borderRadius: 15, borderLeft: '12px solid #00ff00', fontWeight: '900', letterSpacing: '0.05em', zIndex: 100 }}>
				{prefectureName}
			</div>
		</AbsoluteFill>
	);
};
