import {Composition} from 'remotion';
import {Yukkuri} from './Yukkuri';
import {KantoSeries} from './KantoSeries';
import {VerticalYukkuri} from './VerticalYukkuri';
import {VerticalKantoSeries} from './VerticalKantoSeries';
import rawData from './data.json';
import rawSeries from '../../kanto_series.json';

interface DialogueItem {
    duration: number;
}

const data = rawData as DialogueItem[];
const series = rawSeries as Record<string, DialogueItem[]>;

export const RemotionRoot: React.FC = () => {
	const fps = 30;
	const tokyoDuration = Math.round(data.reduce((acc, item) => acc + item.duration, 0) * fps);
    
    let kantoTotalDuration = 0;
    Object.values(series).forEach(dialogue => {
        kantoTotalDuration += Math.round(dialogue.reduce((acc, item) => acc + (item.duration || 3), 0) * fps);
    });

	return (
		<>
            {/* Horizontal (16:9) */}
			<Composition
				id="TokyoHistory"
				component={Yukkuri}
				durationInFrames={tokyoDuration}
				fps={fps}
				width={1920}
				height={1080}
			/>
            <Composition
				id="KantoSeries"
				component={KantoSeries}
				durationInFrames={kantoTotalDuration || 300}
				fps={fps}
				width={1920}
				height={1080}
			/>

            {/* Vertical (9:16) for Shorts/TikTok */}
            <Composition
				id="TokyoHistoryVertical"
				component={VerticalYukkuri}
				durationInFrames={tokyoDuration}
				fps={fps}
				width={1080}
				height={1920}
			/>
            <Composition
				id="KantoSeriesVertical"
				component={VerticalKantoSeries}
				durationInFrames={kantoTotalDuration || 300}
				fps={fps}
				width={1080}
				height={1920}
			/>
		</>
	);
};
