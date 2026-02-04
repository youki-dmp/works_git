import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Yukkuri} from './Yukkuri';
import {VerticalYukkuri} from './VerticalYukkuri';
import {RegionalSeries} from './RegionalSeries';
import rawDataV3 from '../../tohoku_chubu_v3.json';
import rawRegions from '../../region_metadata.json';

const allPrefecturesV3 = rawDataV3 as Record<string, any[]>;
const regions = rawRegions as Record<string, any>;

export const RemotionRoot: React.FC = () => {
	const fps = 30;

	return (
		<>
            {/* Tohoku & Chubu V3 (High Quality 1.2x) */}
            {Object.entries(allPrefecturesV3).map(([prefId, dialogue]) => {
                const duration = Math.round(dialogue.reduce((acc, item) => acc + (item.duration || 4.0), 0) * fps);
                
                // Determine region for metadata
                const tohoku = ["aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima"];
                const regionId = tohoku.includes(prefId) ? "tohoku" : "chubu";
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
