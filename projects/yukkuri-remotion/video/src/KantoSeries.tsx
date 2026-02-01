import { AbsoluteFill, Audio, Img, useVideoConfig, useCurrentFrame, Sequence, staticFile, spring, interpolate } from 'remotion';
import rawSeries from '../../kanto_series.json';

interface DialogueItem {
    speaker: string;
    text: string;
    audio?: string;
    duration?: number;
    bg?: string;
}

const series = rawSeries as Record<string, DialogueItem[]>;

const Speaker: React.FC<{ name: string; isActive: boolean; frame: number }> = ({ name, isActive, frame }) => {
	const { fps } = useVideoConfig();
	const entrance = spring({ frame, fps, config: { damping: 12 } });
	const bounce = isActive ? Math.sin(frame / 2) * 10 : 0;
	const opacity = isActive ? 1 : 0.4;
	const scale = (isActive ? 1.05 : 0.95) * entrance;
	const position = name === 'zundamon' ? { left: 100 } : { right: 100 };
	const imgFile = name === 'zundamon' ? 'ずんだもん立ち絵素材2.3.png' : '四国めたん立ち絵素材2.1.png';
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
			<div style={{
				position: 'absolute',
				bottom: 100,
				left: '50%',
				transform: `translateX(-50%) ${name === 'zundamon' ? 'scaleX(-1)' : ''}`,
				fontSize: 36,
				color: 'white',
				backgroundColor: name === 'zundamon' ? '#4CAF50' : '#E91E63',
				padding: '8px 25px',
				borderRadius: 25,
				fontWeight: 'bold',
				border: '3px solid white',
				boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
				whiteSpace: 'nowrap',
			}}>
				{name === 'zundamon' ? 'ずんだもん' : '四国めたん'}
			</div>
		</div>
	);
};

const PrefectureScene: React.FC<{ name: string; dialogue: DialogueItem[] }> = ({ name, dialogue }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    let currentStart = 0;

    // Use a single reliable background to avoid 404 render crashes
    const sharedBg = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=80";

    const prefectureNames: Record<string, string> = {
        kanagawa: "神奈川県",
        saitama: "埼玉県",
        chiba: "千葉県",
        ibaraki: "茨城県",
        tochigi: "栃木県",
        gunma: "群馬県"
    };

    return (
        <AbsoluteFill>
             {/* Background */}
			<AbsoluteFill style={{
				transform: `scale(${interpolate(frame, [0, 1800], [1, 1.2])})`
			}}>
				<Img 
					src={sharedBg} 
					style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
				/>
			</AbsoluteFill>

            {/* Dialogue */}
            {dialogue.map((item, i) => {
				const start = Math.round(currentStart * fps);
				const duration = Math.round((item.duration || 3) * fps);
				currentStart += (item.duration || 3);

				return (
					<Sequence key={i} from={start} durationInFrames={duration}>
						<AbsoluteFill>
							<Speaker name="zundamon" isActive={item.speaker === 'zundamon'} frame={frame - start} />
							<Speaker name="metan" isActive={item.speaker === 'metan'} frame={frame - start} />
							<div style={{
								position: 'absolute', bottom: 100, left: '10%', right: '10%', height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center',
							}}>
								<div style={{
									backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '20px 50px', borderRadius: 20,
									border: `8px solid ${item.speaker === 'zundamon' ? '#4CAF50' : '#E91E63'}`,
									color: '#333', fontSize: 48, fontWeight: '900', textAlign: 'center', width: '100%', boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
									transform: `scale(${spring({ frame: frame - start, fps, config: { stiffness: 200 } })})`,
								}}>
									{item.text}
								</div>
							</div>
							{item.audio && <Audio src={staticFile(`audio/${item.audio}`)} />}
						</AbsoluteFill>
					</Sequence>
				);
			})}

            {/* Header */}
			<div style={{
				position: 'absolute', top: 40, left: 40, color: 'white', fontSize: 32, backgroundColor: 'rgba(0,0,0,0.7)',
				padding: '12px 35px', borderRadius: 15, borderLeft: '12px solid #00ff00', fontWeight: '900', letterSpacing: '0.05em',
			}}>
				首都圏シリーズ：{prefectureNames[name]}
			</div>
        </AbsoluteFill>
    );
}

export const KantoSeries: React.FC = () => {
    const { fps } = useVideoConfig();
    let currentTotalStart = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'sans-serif' }}>
            <Audio src={staticFile('batch-001/audio/Shinjuku Neon Rain（新宿・雨）_1.mp3')} volume={0.1} loop />
            
            {Object.entries(series).map(([name, dialogue]) => {
                const duration = Math.round(dialogue.reduce((acc, item) => acc + (item.duration || 3), 0) * fps);
                const start = currentTotalStart;
                currentTotalStart += duration;

                return (
                    <Sequence key={name} from={start} durationInFrames={duration}>
                        <PrefectureScene name={name} dialogue={dialogue} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
