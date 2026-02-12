export const AI_MODELS = {
  STRATEGY_PLANER: 'gemini-3-pro-preview',
  DRAFT_GENERATOR: 'gemini-2.5-flash-image',
  FINAL_RENDERER: 'gemini-3-pro-image-preview',
  CRITIQUE_MODEL: 'gemini-3-pro-preview',
};

export const SYSTEM_PROMPTS = {
  STRICT_IDENTITY_RULE: `
!!! CRITICAL VIOLATION CHECK !!!
You must PRESERVE the visual identity of provided assets.
1. FACE & CHARACTER: Do not generate a new person. Match the uploaded subject EXACTLY.
2. LOGO: If a logo is provided, place it naturally (e.g., corner). DO NOT change the text or design of the logo. No redrawing.
3. TYPOGRAPHY: Ensure Japanese characters are rendered correctly without artifacts.
`,
  VISUAL_HIERARCHY_RULES: `
1. SAFE ZONE: Keep bottom-right corner empty (for duration badge).
2. MOBILE READABILITY: Use huge, high-contrast, bold fonts for the main copy.
3. COMPOSITION: Lead the viewer's eye across the thumbnail using lighting and contrast.
`,
  JAPANESE_FIDELITY_RULE: `
!!! JAPANESE RENDERING CRITICAL !!!
1. NO ARTIFACTS: Render Japanese Kanji/Kana/Hiragana characters with pixel-perfect clarity.
2. FONT STYLE: Use modern, bold, high-impact Sans-serif (Gothic) fonts suitable for YouTube.
3. NO MISTAKES: Do not mix characters or generate nonsense glyphs. The provided text must be legible and accurate.
`,
  ABSOLUTE_IDENTITY_PRESERVATION_RULE: `
!!! IDENTITY LOCK ENABLED !!!
The user has requested ABSOLUTE character/logo preservation. 
1. DO NOT RE-GENERATE the character features. Paste the provided asset as-is with zero modification to facial features, outfit, or hair.
2. DO NOT CHANGE colors or artistic style of the character/logo.
3. INTEGRATION: Only modify lighting/shadowing to ground it in the scene, but do not touch the base lines.
`,
};

export const DRAFT_VARIATIONS = [
  { name: "Contrast", suffix: "Focus on maximum color contrast and vibrant tones." },
  { name: "Emotional", suffix: "Focus on deep emotional facial close-up and dramatic lighting." },
  { name: "Premium", suffix: "Minimalist, luxury, clean typography style." }
];
