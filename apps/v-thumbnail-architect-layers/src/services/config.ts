export const AI_MODELS = {
  ASSET_GENERATOR: 'gemini-2.0-flash', // Stable fast model
  NANO_BANANA_PRO: 'gemini-1.5-pro',  // High fidelity model for text/logic
};

export const PROMPT_TEMPLATES = {
  BACKGROUND: (theme: string) => `Generate a high-quality thumbnail background. Theme: ${theme}. Dynamic lighting, vibrant colors, suitable for VTuber thumbnails.`,
  EFFECT: (style: string) => `Generate a transparent overlay effect or particle effect. Style: ${style}. Neon, sparkles, or energy blasts.`,
  TEXT_LOGO: (copy: string) => `!!! NANO BANANA PRO: JAPANESE RENDERING ENGINE !!!
Render the following Japanese text as a high-impact, professional logo: "${copy}". 
Bold Gothic, high contrast, outline, vibrant colors. ZERO GLITCHES.`,
};

export const SYSTEM_RULES = {
  NON_DESTRUCTIVE: "!!! NEVER MODIFY THE CHARACTER LAYER !!! All generated assets must be separate from the character.",
  JAPANESE_ACCURACY: "Japanese text must be 100% accurate. Use Nano Banana Pro's advanced rendering.",
  IDENTITY_LOCK: "Maintain absolute consistency of character features if provided. Do not invent new character traits.",
  VISUAL_HIERARCHY: "Place important text following the rule of thirds. Avoid the bottom-right 'deadzone' where YouTube time badges appear.",
  COLOR_HARMONY_RULE: "Analyze the character's primary colors and ensure background/effects use complementary or analogous palettes for professional coordination.",
};
