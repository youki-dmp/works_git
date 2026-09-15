export const AI_MODELS = {
  // Mode-based selection using Gemini 3.5 Flash & 3 Pro Image models
  SPEED: {
    STRATEGY_PLANER: 'gemini-3.5-flash',
    DRAFT_GENERATOR: 'gemini-3.5-flash',
    FINAL_RENDERER: 'gemini-3.5-flash',
    CRITIQUE_MODEL: 'gemini-3.5-flash',
  },
  QUALITY: {
    STRATEGY_PLANER: 'gemini-3.5-flash',
    DRAFT_GENERATOR: 'gemini-3.5-flash',
    FINAL_RENDERER: 'gemini-3-pro-image-preview',
    CRITIQUE_MODEL: 'gemini-3.5-flash',
  },
  // Fallbacks / Direct Model Names
  DEFAULT_PLANNER: 'gemini-3.5-flash',
  DEFAULT_RENDERER: 'gemini-3-pro-image-preview',
  DEFAULT_CRITIQUE: 'gemini-3.5-flash',
};




export const SYSTEM_PROMPTS = {
  STRICT_IDENTITY_RULE: `
!!! CRITICAL VIOLATION CHECK - ZERO TOLERANCE !!!
You must PRESERVE the visual identity of provided assets with 100% fidelity.
1. FACE & CHARACTER: DO NOT interpret, recreate, or "improve" the person. Match the uploaded subject EXACTLY. Any change to facial structure, eye shape, or expression is a failure.
2. RAW LAYER PRESERVATION: Treat the subject as an unmodified, untouched image layer placed cleanly over the background. Do NOT repaint or distort the subject.
3. LOGO: If a logo is provided, place it as-is. DO NOT redraw or change its typography.
4. TYPOGRAPHY: Ensure Japanese characters are pixel-perfect and follow standard Japanese font forms.
`,
  VISUAL_HIERARCHY_RULES: `
1. SAFE ZONE: Keep bottom-right corner empty (strictly reserved for YouTube duration badge like "12:34").
2. MOBILE READABILITY: Use massive, high-contrast bold fonts for main copy.
3. COMPOSITION: Place elements in distinct visual layers: [Layer 1: Background] -> [Layer 2: Subject/Person] -> [Layer 3: Visual Effects/Glow] -> [Layer 4: Typography & Logos].
`,
  JAPANESE_FIDELITY_RULE: `
!!! JAPANESE TYPOGRAPHY CRITICAL - ZERO CHINESE FONT TOLERANCE !!!
1. STRICT JAPANESE GLYPHS: Never use Chinese font variants (Han Unification survivors). Characters like "待", "凸", "刃", "直", "角", "骨" must follow standard Japanese Ministry of Education (MEXT) forms. Avoid simplified or traditional Chinese strokes.
2. NO ARTIFACTS & NO MOJIBAKE: Render Kanji/Kana/Hiragana with crisp, ultra-high-definition vector-like outlines. No blur, distortion or compression artifacts.
3. FONT STYLE: Deep-impact Japanese Sans-Serif / Gothic. Modern, clean, extremely bold, with high-contrast outlines or drop shadows for maximum CTR.
4. ACCURACY: Provided Japanese text must be rendered exactly character-for-character with zero typos.
`,
  ABSOLUTE_IDENTITY_PRESERVATION_RULE: `
!!! ABSOLUTE IDENTITY LOCK - MANDATORY UNTOUCHED LAYER !!!
The user has requested ZERO MODIFICATION to the subject image.
1. DO NOT RE-GENERATE OR ALTER features. The person must remain 100% pixel-identical to Image 1.
2. COMPOSITE AS UNTOUCHED LAYER: Treat the provided character image as a raw foreground layer. Composite it directly over the generated background without modifying facial anatomy, clothing, or hair.
3. NO INTERPRETATION: Do not adjust hair style, facial lines, skin tone, or outfit details.
`,
  ABSOLUTE_SOURCE_OF_TRUTH_RULE: `
!!! SOURCE OF TRUTH PROTOCOL - IMAGE 1 IS LAW !!!
1. MASTER ASSET: Image 1 (Original Upload) is the ONLY source of truth for the character/subject.
2. ZERO DEVIATION: Ignore any character features generated in previous draft stages (Image 2+). 
3. UNTOUCHED COMPOSITING: Extract the subject from Image 1 cleanly and overlay it on the new background as an untouched layer.
4. NO RE-DRAWING: Do not re-interpret the pixels of the subject. Use exact facial features, hair, and clothing from Image 1.
`,
  TYPOGRAPHY_HEAVY_RULE: `
!!! SPECIALIZED TYPOGRAPHY LAYOUT ACTIVATED !!!
1. MASSIVE TEXT DOMINANCE: The main copy and sub copy MUST occupy 40% to 50% of the entire thumbnail space. Make text extremely large, thick, and impossible to ignore.
2. SUBJECT PLACEMENT: Push the subject cleanly to either the far left or far right to make massive room for typography. Do not obscure text with the subject.
3. HIGH CONTRAST BACKGROUND: Ensure background behind text provides maximum contrast.
4. STREAMING VIBE: Enhance layout with clean subtle streaming UI elements (like chat box, mic, or neon accents) if fitting, but TEXT SIZE is absolute priority.
`,
};

export const DRAFT_VARIATIONS = [
  { name: "High Contrast (高対比)", suffix: "Focus on maximum color contrast, punchy lighting, and high-impact visual separation." },
  { name: "Emotional (感情表現)", suffix: "Focus on deep emotional resonance, dramatic lighting, and focal point intensity." },
  { name: "Premium Clean (洗練)", suffix: "Minimalist, luxury clean aesthetic, modern high-class Japanese typography and crystal clear layout." }
];

