import {AbsoluteFill, Series, staticFile} from 'remotion';
import {MusicVideo} from './MusicVideo';

const songs = [
	{
		id: 'shinjuku-neon-rain-pro',
		title: 'Shinjuku Neon Rain',
		audio: staticFile('batch-001/audio/Shinjuku Neon Rain（新宿・雨）_1.mp3'),
		image: staticFile('batch-001/images/Shinjuku Neon Rain（新宿・雨）_1.png'),
		durationInFrames: 5640,
	},
	{
		id: 'kyoto-sunset-zen-pro',
		title: 'Kyoto Sunset Zen',
		audio: staticFile('batch-001/audio/Kyoto Sunset Zen（京都・夕暮れ）_1.mp3'),
		image: staticFile('batch-001/images/Kyoto Sunset Zen（京都・夕暮れ）_1.png'),
		durationInFrames: 6750,
	},
	{
		id: 'midnight-konbini-pro',
		title: 'Midnight Konbini',
		audio: staticFile('batch-001/audio/Midnight Konbini（深夜のコンビニ）_1.mp3'),
		image: staticFile('batch-001/images/Midnight Konbini（深夜のコンビニ）_1.png'),
		durationInFrames: 6570,
	},
	{
		id: 'school-rooftop-breeze-pro',
		title: 'School Rooftop Breeze',
		audio: staticFile('batch-001/audio/School Rooftop Breeze（放課後の屋上）_1.mp3'),
		image: staticFile('batch-001/images/School Rooftop Breeze（放課後の屋上）_1.png'),
		durationInFrames: 4980,
	},
	{
		id: 'tokyo-subway-dreams-pro',
		title: 'Tokyo Subway Dreams',
		audio: staticFile('batch-001/audio/Tokyo Subway Dreams（地下鉄の旅）_1.mp3'),
		image: staticFile('batch-001/images/Tokyo Subway Dreams（地下鉄の旅） _1.png'),
		durationInFrames: 6600,
	},
];

export const FullMix: React.FC = () => {
	return (
		<AbsoluteFill>
			<Series>
				{songs.map((song) => (
					<Series.Sequence key={song.id} durationInFrames={song.durationInFrames}>
						<MusicVideo 
							audioSrc={song.audio} 
							imageSrc={song.image} 
							title={song.title} 
						/>
					</Series.Sequence>
				))}
			</Series>
		</AbsoluteFill>
	);
};
