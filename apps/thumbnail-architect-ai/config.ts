export const AI_MODELS = {
  STRATEGY_PLANER: 'gemini-3.1-flash-lite-preview',
  DRAFT_GENERATOR: 'gemini-2.5-flash-image',
  FINAL_RENDERER: 'gemini-3-pro-image-preview',
  CRITIQUE_MODEL: 'gemini-3.1-flash-lite-preview',
};

export const SYSTEM_PROMPTS = {
  STRICT_IDENTITY_RULE: `
!!! CRITICAL VIOLATION CHECK - ZERO TOLERANCE !!!
You must PRESERVE the visual identity of provided assets with 100% fidelity.
1. FACE & CHARACTER: DO NOT interpret, recreate, or "improve" the person. Match the uploaded subject EXACTLY. Any change to facial structure, eye shape, or expression is a failure.
2. LOGO: If a logo is provided, place it as-is. DO NOT redraw or change its typography.
3. TYPOGRAPHY: Ensure Japanese characters are pixel-perfect.
`,
  VISUAL_HIERARCHY_RULES: `
1. SAFE ZONE: Keep bottom-right corner empty (for duration badge).
2. MOBILE READABILITY: Use massive, high-contrast bold fonts for main copy.
3. COMPOSITION: Use lighting to ground the subject, but never alter the subject's base features.
`,
  JAPANESE_FIDELITY_RULE: `
!!! JAPANESE TYPOGRAPHY CRITICAL - ZERO CHINESE FONT TOLERANCE !!!
1. STRICT JAPANESE GLYPHS: Never use Chinese font variants (Han Unification survivors). Characters like "待", "凸", "刃", "直" must follow standard Japanese Ministry of Education (MEXT) forms. Avoid simplified or traditional Chinese strokes.
2. NO ARTIFACTS: Render Kanji/Kana/Hiragana with crisp, high-definition outlines. No blur or compression artifacts.
3. FONT STYLE: Deep-impact Japanese Gothic/Sans-serif. Modern, clean, and extremely bold for high CTR.
4. ACCURACY: Provided Japanese text must be rendered exactly character-for-character.
`,
  ABSOLUTE_IDENTITY_PRESERVATION_RULE: `
!!! ABSOLUTE IDENTITY LOCK - MANDATORY !!!
The user has requested ZERO MODIFICATION to the subject.
1. DO NOT RE-GENERATE features. It is strictly forbidden to change the subject's identity.
2. USE AS-IS: Treat the provided character image as a fixed asset. 
3. NO INTERPRETATION: Do not adjust hair style, facial lines, or outfit details. 
4. PIXEL-PERFECT FIDELITY: The character in the output must be indistinguishable from the uploaded asset.
`,
  ABSOLUTE_SOURCE_OF_TRUTH_RULE: `
!!! SOURCE OF TRUTH PROTOCOL - IMAGE 1 IS LAW !!!
1. MASTER ASSET: Image 1 (Original Upload) is the ONLY source of truth for the character/subject.
2. ZERO DEVIATION: Ignore any character features generated in previous draft stages (Image 2+). 
3. PATCHING ONLY: Your task is to extract the subject from Image 1 and composite it perfectly onto the new background.
4. NO RE-DRAWING: Do not re-interpret the pixels of the subject. Use the subject's exact facial features, hair, and clothing from Image 1.
`,
  TYPOGRAPHY_HEAVY_RULE: `
!!! SPECIALIZED TYPOGRAPHY LAYOUT ACTIVATED !!!
1. MASSIVE TEXT DOMINANCE: The main copy and sub copy MUST occupy 40% to 50% of the entire thumbnail space. Make the text extremely large, thick, and impossible to ignore.
2. SUBJECT PLACEMENT: Push the subject securely to either the far left or far right to make massive room for the typography. Do not obscure the text with the subject.
3. HIGH CONTRAST BACKGROUND: Ensure the background behind the text provides maximum contrast so the huge letters pop out aggressively.
4. STREAMING VIBE: Enhance the layout with subtle streaming UI elements (like a chat box hint, microphone for singing, or neon accents) if it fits the topic, but TEXT SIZE is the absolute priority.
`,
};

export const DRAFT_VARIATIONS = [
  { name: "Contrast", suffix: "Focus on maximum color contrast and vibrant tones." },
  { name: "Emotional", suffix: "Focus on deep emotional facial close-up and dramatic lighting." },
  { name: "Premium", suffix: "Minimalist, luxury, clean typography style." }
];
