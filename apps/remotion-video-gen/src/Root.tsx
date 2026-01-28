import {Composition, staticFile} from 'remotion';
import {MusicVideo} from './MusicVideo';
import {KumikoShort1} from './KumikoShort1';
import {FullMix} from './FullMix';

export const RemotionRoot: React.FC = () => {
	const totalFrames = 5640 + 6750 + 6570 + 4980 + 6600;
	return (
		<>
			<Composition
				id="KumikoShort1"
				component={KumikoShort1}
				durationInFrames={720}
				fps={30}
				width={1280}
				height={720}
			/>
			<Composition
				id="FullMixBatch1"
				component={FullMix}
				durationInFrames={totalFrames}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="shinjuku-neon-rain-pro"
				component={MusicVideo}
				durationInFrames={5640}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					audioSrc: staticFile('batch-001/audio/Shinjuku Neon Rain（新宿・雨）_1.mp3'),
					imageSrc: staticFile('batch-001/images/Shinjuku Neon Rain（新宿・雨）_1.png'),
					title: 'Shinjuku Neon Rain',
				}}
			/>
			<Composition
				id="kyoto-sunset-zen-pro"
				component={MusicVideo}
				durationInFrames={6750}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					audioSrc: staticFile('batch-001/audio/Kyoto Sunset Zen（京都・夕暮れ）_1.mp3'),
					imageSrc: staticFile('batch-001/images/Kyoto Sunset Zen（京都・夕暮れ）_1.png'),
					title: 'Kyoto Sunset Zen',
				}}
			/>
			<Composition
				id="midnight-konbini-pro"
				component={MusicVideo}
				durationInFrames={6570}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					audioSrc: staticFile('batch-001/audio/Midnight Konbini（深夜のコンビニ）_1.mp3'),
					imageSrc: staticFile('batch-001/images/Midnight Konbini（深夜のコンビニ）_1.png'),
					title: 'Midnight Konbini',
				}}
			/>
			<Composition
				id="school-rooftop-breeze-pro"
				component={MusicVideo}
				durationInFrames={4980}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					audioSrc: staticFile('batch-001/audio/School Rooftop Breeze（放課後の屋上）_1.mp3'),
					imageSrc: staticFile('batch-001/images/School Rooftop Breeze（放課後の屋上）_1.png'),
					title: 'School Rooftop Breeze',
				}}
			/>
			<Composition
				id="tokyo-subway-dreams-pro"
				component={MusicVideo}
				durationInFrames={6600}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					audioSrc: staticFile('batch-001/audio/Tokyo Subway Dreams（地下鉄の旅）_1.mp3'),
					imageSrc: staticFile('batch-001/images/Tokyo Subway Dreams（地下鉄の旅） _1.png'),
					title: 'Tokyo Subway Dreams',
				}}
			/>
		</>
	);
};
