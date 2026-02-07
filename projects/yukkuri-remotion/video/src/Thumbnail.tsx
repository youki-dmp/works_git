import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from 'remotion';

interface ThumbnailProps {
	prefectureName: string;
	backgroundUrl: string;
	hookText: string;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ prefectureName, backgroundUrl, hookText }) => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'sans-serif' }}>
			{/* Background */}
			<AbsoluteFill>
				<Img 
                    src={staticFile(`background/${backgroundUrl}`)} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} 
                />
			</AbsoluteFill>

			{/* Character Left (Zundamon) */}
			<div style={{
				position: 'absolute',
				bottom: -50,
				left: -50,
				width: 800,
				transform: 'scaleX(-1)',
			}}>
				<Img src={staticFile('ずんだもん立ち絵素材2.3.png')} style={{ width: '100%' }} />
			</div>

			{/* Character Right (Metan) */}
			<div style={{
				position: 'absolute',
				bottom: -50,
				right: -50,
				width: 800,
			}}>
				<Img src={staticFile('四国めたん立ち絵素材2.1.png')} style={{ width: '100%' }} />
			</div>

			{/* Main Text Container */}
			<div style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -55%)',
				width: '90%',
				textAlign: 'center',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				{/* Prefecture Name Tag */}
				<div style={{
					backgroundColor: '#ff0000',
					color: 'white',
					fontSize: 80,
					fontWeight: '900',
					padding: '10px 60px',
					borderRadius: 15,
					marginBottom: 20,
					boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
					border: '5px solid white',
				}}>
					{prefectureName}
				</div>

				{/* Big Hook Text */}
				<div style={{
					color: '#ffff00',
					fontSize: 180,
					fontWeight: '900',
					lineHeight: 1.1,
					textShadow: '10px 10px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 15px 40px rgba(0,0,0,0.8)',
					letterSpacing: '-0.05em',
					transform: 'rotate(-2deg)',
				}}>
					{hookText}
				</div>

                {/* Sub Text */}
                <div style={{
                    marginTop: 30,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#333',
                    fontSize: 70,
                    fontWeight: '900',
                    padding: '10px 40px',
                    borderRadius: 50,
                    boxShadow: '0 5px 20px rgba(0,0,0,0.4)',
                }}>
                    1分でわかる歴史ミステリー
                </div>
			</div>

            {/* Warning / Clickbait Element */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                right: 40,
                backgroundColor: '#ffff00',
                color: '#000',
                fontSize: 50,
                fontWeight: '900',
                padding: '10px 30px',
                borderRadius: 10,
                transform: 'rotate(5deg)',
                border: '4px solid black',
            }}>
                閲覧注意
            </div>
		</AbsoluteFill>
	);
};
