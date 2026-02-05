import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Yukkuri} from './Yukkuri';
import {VerticalYukkuri} from './VerticalYukkuri';
import {RegionalSeries} from './RegionalSeries';
import rawDataV3 from '../../all_prefectures_v2.json';
import rawRegions from '../../region_metadata.json';

import singaporeV2Law from './laws_singapore_v2.json';
import swissV2Law from './laws_switzerland_v2.json';
import ukV2Law from './laws_uk_v2.json';
import canadaV2Law from './laws_canada_v2.json';

// Flatten the nested structure for easier mapping
const regions = rawRegions as Record<string, any>;
const allPrefecturesV3: Record<string, any[]> = {};
Object.keys(rawDataV3).forEach(region => {
    Object.assign(allPrefecturesV3, (rawDataV3 as any)[region]);
});

export const RemotionRoot: React.FC = () => {
	const fps = 30;

    const swissV2Duration = Math.round(swissV2Law.reduce((acc, item) => acc + (item.duration || 4.0), 0) * fps);
    const singaporeV2Duration = Math.round(singaporeV2Law.reduce((acc, item) => acc + (item.duration || 4.0), 0) * fps);
    const ukV2Duration = Math.round(ukV2Law.reduce((acc, item) => acc + (item.duration || 4.0), 0) * fps);
    const canadaV2Duration = Math.round(canadaV2Law.reduce((acc, item) => acc + (item.duration || 4.0), 0) * fps);

	return (
		<>
            {/* World's Weird Laws Series (Horizontal) */}
            <Composition
                id="Law-Canada-Horizontal"
                component={Yukkuri}
                durationInFrames={canadaV2Duration}
                fps={fps}
                width={1920}
                height={1080}
                defaultProps={{
                    seriesData: canadaV2Law,
                    prefectureName: "世界の変な法律：カナダ",
                    backgroundUrl: "city.jpg",
                    bgmFile: "Shinjuku Neon Rain（新宿・雨）_1.mp3"
                }}
            />
            <Composition
                id="Law-UK-Horizontal"
                component={Yukkuri}
                durationInFrames={ukV2Duration}
                fps={fps}
                width={1920}
                height={1080}
                defaultProps={{
                    seriesData: ukV2Law,
                    prefectureName: "世界の変な法律：イギリス",
                    backgroundUrl: "city.jpg",
                    bgmFile: "Shinjuku Neon Rain（新宿・雨）_1.mp3"
                }}
            />
            <Composition
                id="Law-Singapore-Horizontal"
                component={Yukkuri}
                durationInFrames={singaporeV2Duration}
                fps={fps}
                width={1920}
                height={1080}
                defaultProps={{
                    seriesData: singaporeV2Law,
                    prefectureName: "世界の変な法律：シンガポール",
                    backgroundUrl: "city.jpg",
                    bgmFile: "Shinjuku Neon Rain（新宿・雨）_1.mp3"
                }}
            />
            <Composition
                id="Law-Switzerland-Horizontal"
                component={Yukkuri}
                durationInFrames={swissV2Duration}
                fps={fps}
                width={1920}
                height={1080}
                defaultProps={{
                    seriesData: swissV2Law,
                    prefectureName: "世界の変な法律：スイス",
                    backgroundUrl: "mountain.jpg",
                    bgmFile: "Shinjuku Neon Rain（新宿・雨）_1.mp3"
                }}
            />

            {/* Tohoku & Chubu V3 (High Quality 1.2x) */}
            {Object.entries(allPrefecturesV3).map(([prefId, dialogue]) => {
                const duration = Math.round(dialogue.reduce((acc, item) => acc + (item.duration || 4.0), 0) * fps);
                
                // Determine region for metadata
                let regionId = "tohoku";
                for (const rId in regions) {
                    if (regions[rId].prefectures.includes(prefId)) {
                        regionId = rId;
                        break;
                    }
                }
                const regionInfo = regions[regionId];
                
                const prefectureNames: Record<string, string> = {
                    aomori: "青森県", iwate: "岩手県", miyagi: "宮城県", akita: "秋田県", yamagata: "山形県", fukushima: "福島県",
                    niigata: "新潟県", toyama: "富山県", ishikawa: "石川県", fukui: "福井県", yamanashi: "山梨県", nagano: "長野県", gifu: "岐阜県", shizuoka: "静岡県", aichi: "愛知県"
                };
                const title = prefectureNames[prefId] || prefId;

                return (
                    <React.Fragment key={prefId}>
                        <Composition
                            id={`${prefId}-V3-Horizontal`}
                            component={Yukkuri}
                            durationInFrames={duration || 1800}
                            fps={fps}
                            width={1920}
                            height={1080}
                            defaultProps={{
                                seriesData: dialogue,
                                prefectureName: `${title}`,
                                backgroundUrl: regionInfo.bg,
                                bgmFile: regionInfo.bgm
                            }}
                        />
                        <Composition
                            id={`${prefId}-V3-Vertical`}
                            component={VerticalYukkuri}
                            durationInFrames={duration || 1800}
                            fps={fps}
                            width={1080}
                            height={1920}
                            defaultProps={{
                                seriesData: dialogue,
                                prefectureName: `${title}`,
                                backgroundUrl: regionInfo.bg,
                                bgmFile: regionInfo.bgm
                            }}
                        />
                    </React.Fragment>
                );
            })}
		</>
	);
};
