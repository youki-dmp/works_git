import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, spring} from 'remotion';

const Title: React.FC<{text: string; color?: string; subtext?: string}> = ({text, color = 'black', subtext}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const opacity = interpolate(frame, [0, 10], [0, 1]);
	const scale = spring({frame, fps, config: {damping: 12}});

	return (
		<div style={{
			opacity,
			transform: `scale(${scale})`,
			textAlign: 'center',
			fontFamily: 'sans-serif'
		}}>
			<div style={{fontSize: 100, fontWeight: 'bold', color}}>{text}</div>
			{subtext && <div style={{fontSize: 50, marginTop: 20, color: '#666'}}>{subtext}</div>}
		</div>
	);
};

const Terminal: React.FC = () => {
	const frame = useCurrentFrame();
	const text = "$ npm install -g clawdbot\n\n[SUCCESS] Installed Clawdbot v1.0.0\n$ clawdbot start\n\nGateway running on port 3000...";
	const charsToShow = Math.floor(interpolate(frame, [0, 60], [0, text.length]));

	return (
		<div style={{
			backgroundColor: '#1e1e1e',
			color: '#d4d4d4',
			padding: 40,
			borderRadius: 20,
			fontSize: 40,
			fontFamily: 'monospace',
			width: '80%',
			height: '60%',
			boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
			whiteSpace: 'pre-wrap'
		}}>
			{text.slice(0, charsToShow)}
			<span style={{opacity: frame % 20 < 10 ? 1 : 0}}>_</span>
		</div>
	);
};

const DiscordMessage: React.FC<{author: string; content: string; delay: number; color: string}> = ({author, content, delay, color}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateLeft: 'clamp'});
	const translateY = interpolate(frame - delay, [0, 10], [20, 0], {extrapolateLeft: 'clamp'});

	return (
		<div style={{
			display: 'flex',
			marginBottom: 30,
			opacity,
			transform: `translateY(${translateY}px)`,
			width: '100%'
		}}>
			<div style={{
				width: 80,
				height: 80,
				borderRadius: '50%',
				backgroundColor: color,
				marginRight: 20,
				flexShrink: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 40,
				color: 'white',
				fontWeight: 'bold'
			}}>
				{author[0]}
			</div>
			<div>
				<div style={{color: 'white', fontWeight: 'bold', fontSize: 32, marginBottom: 5}}>{author}</div>
				<div style={{color: '#dcddde', fontSize: 30, lineHeight: 1.4}}>{content}</div>
			</div>
		</div>
	);
};

const DiscordChat: React.FC = () => {
	return (
		<div style={{
			backgroundColor: '#36393f',
			width: '90%',
			height: '80%',
			borderRadius: 15,
			padding: 50,
			boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
			display: 'flex',
			flexDirection: 'column'
		}}>
			<DiscordMessage 
				author="demupa" 
				content="今日私がやったこと、あなたpipiのインストールと苦労した点を動画にしたいな" 
				delay={10} 
				color="#5865f2"
			/>
			<DiscordMessage 
				author="PiPi" 
				content="物語の構成、バッチリ把握しました！✨" 
				delay={40} 
				color="#eb459e"
			/>
			<DiscordMessage 
				author="demupa" 
				content="君もやってみよう！" 
				delay={70} 
				color="#5865f2"
			/>
		</div>
	);
};

export const MyComposition: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center'}}>
			{/* 0-60: Intro */}
			<Sequence durationInFrames={60}>
				<Title text="Clawdbot" subtext="Twitterでおすすめ投稿をみたから試してみた！" />
			</Sequence>
			
			{/* 60-150: Terminal */}
			<Sequence from={60} durationInFrames={90}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
					<div style={{marginBottom: 40, fontSize: 50, fontWeight: 'bold'}}>ターミナルからは楽ちん！</div>
					<Terminal />
				</AbsoluteFill>
			</Sequence>

			{/* 150-240: Struggle */}
			<Sequence from={150} durationInFrames={90}>
				<AbsoluteFill style={{backgroundColor: '#36393f', justifyContent: 'center', alignItems: 'center'}}>
					<div style={{color: 'white', fontSize: 60, textAlign: 'center'}}>
						Discord連携で躓く...<br/>
						<span style={{fontSize: 120}}>🤔 💬 ❓</span><br/>
						<span style={{color: '#ff4444', fontWeight: 'bold'}}>「反応がない...！？」</span>
					</div>
				</AbsoluteFill>
			</Sequence>

			{/* 240-300: Naming */}
			<Sequence from={240} durationInFrames={60}>
				<AbsoluteFill style={{backgroundColor: '#ffeb3b', justifyContent: 'center', alignItems: 'center'}}>
					<div style={{fontSize: 80, fontWeight: 'bold', textAlign: 'center'}}>
						名前が決まった！<br/>
						<span style={{fontSize: 150, color: '#e91e63'}}>PiPi 🥧</span>
					</div>
				</AbsoluteFill>
			</Sequence>

			{/* 300-390: Discord Chat */}
			<Sequence from={300} durationInFrames={90}>
				<AbsoluteFill style={{backgroundColor: '#2f3136', justifyContent: 'center', alignItems: 'center'}}>
					<DiscordChat />
				</AbsoluteFill>
			</Sequence>

			{/* 390-450: Outro */}
			<Sequence from={390} durationInFrames={60}>
				<AbsoluteFill style={{backgroundColor: '#5865f2', justifyContent: 'center', alignItems: 'center'}}>
					<div style={{color: 'white', fontSize: 100, fontWeight: 'bold', textAlign: 'center'}}>
						君もやってみよう！<br/>
						<span style={{fontSize: 60, opacity: 0.8}}>Try Clawdbot now</span>
					</div>
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};
