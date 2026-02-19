export const AI_MODELS = {
  STRATEGY_PLANER: 'gemini-3-pro-preview',
  DRAFT_GENERATOR: 'gemini-2.5-flash-image',
  FINAL_RENDERER: 'gemini-3-pro-image-preview',
  CRITIQUE_MODEL: 'gemini-3-pro-preview',
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
!!! JAPANESE RENDERING CRITICAL !!!
1. NO ARTIFACTS: Render Kanji/Kana/Hiragana with extreme clarity.
2. FONT STYLE: Modern, bold, high-impact Sans-serif (Gothic).
3. ACCURACY: The provided text must be copied character-for-character.
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
};

export const DRAFT_VARIATIONS = [
  { name: "Contrast", suffix: "Focus on maximum color contrast and vibrant tones." },
  { name: "Emotional", suffix: "Focus on deep emotional facial close-up and dramatic lighting." },
  { name: "Premium", suffix: "Minimalist, luxury, clean typography style." }
];
