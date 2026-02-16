export const AI_MODELS = {
  ASSET_GENERATOR: 'gemini-2.0-flash-exp', // Using a fast model for generation tasks
  NANO_BANANA_PRO: 'gemini-3-pro-image-preview', // High fidelity for final rendering and text
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
};
