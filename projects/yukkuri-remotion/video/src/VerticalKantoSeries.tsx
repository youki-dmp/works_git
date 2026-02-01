import { AbsoluteFill, Audio, useVideoConfig, Sequence, staticFile } from 'remotion';
import { VerticalYukkuri } from './VerticalYukkuri';
import rawSeries from '../../kanto_series.json';

interface DialogueItem {
    speaker: string;
    text: string;
    audio: string;
    duration: number;
}

const series = rawSeries as Record<string, DialogueItem[]>;

const prefectureNames: Record<string, string> = {
    kanagawa: "神奈川県",
    saitama: "埼玉県",
    chiba: "千葉県",
    ibaraki: "茨城県",
    tochigi: "栃木県",
    gunma: "群馬県"
};

export const VerticalKantoSeries: React.FC = () => {
    const { fps } = useVideoConfig();
    let currentTotalStart = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <Audio src={staticFile('batch-001/audio/Shinjuku Neon Rain（新宿・雨）_1.mp3')} volume={0.1} loop />
            
            {Object.entries(series).map(([name, dialogue]) => {
                const duration = Math.round(dialogue.reduce((acc, item) => acc + (item.duration || 3), 0) * fps);
                const start = currentTotalStart;
                currentTotalStart += duration;

                return (
                    <Sequence key={name} from={start} durationInFrames={duration}>
                        <VerticalYukkuri 
                            isSeries 
                            seriesData={dialogue as any} 
                            prefectureName={`首都圏：${prefectureNames[name]}`} 
                        />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
