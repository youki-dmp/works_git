import { GoogleGenAI } from "@google/genai";
import { ThumbnailInputs } from "../types";
import { AI_MODELS, SYSTEM_PROMPTS, DRAFT_VARIATIONS } from "../config";

const cleanBase64 = (data: string) => data.split(',')[1];

export const generateDesignPlan = async (inputs: ThumbnailInputs): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contentParts: any[] = [];

    if (inputs.uploadedImage) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedImage) } });

    let promptText = `
    YouTube Thumbnail Strategy Plan.
    Topic: ${inputs.videoDescription}
    Competitor Analysis Target: ${inputs.competitorKeyword || inputs.videoDescription}
    Target Emotion: ${inputs.emotionalTrigger}
    Main Copy: ${inputs.copyText}
    Sub Copy: ${inputs.subCopy}
    
    被写体の扱い: ${inputs.subjectType === 'full' ? '全身' : inputs.subjectType === 'bust' ? 'バストアップ' : 'ドアップ（顔）'}
    被写体位置オフセット: X=${inputs.subjectX}%, Y=${inputs.subjectY}% (0,0が中央、Yがマイナスで上方向へ移動)
    ${inputs.strictIdentity ? SYSTEM_PROMPTS.ABSOLUTE_IDENTITY_PRESERVATION_RULE : "被写体の特徴を活かした再構成を許可します。"}

    Gemini 3 Proの検索ツールを使い、競合のサムネイルパターンを分析した上で、以下のプランを日本語で作成してください：
    1. 【競合差別化】競合が多用している色や構図を避け、目立つための「逆張り」提案。
    2. 【レイアウト指示】${inputs.uploadedImage ? `被写体の配置（サイズ感: ${inputs.subjectScale}x）` : "被写体の生成指示"}と文字の強弱。
    3. 【空間設計】${inputs.uploadedLogo ? "チャンネルロゴの最適な配置場所。" : ""}
    4. 【カラーパレット】CTRを最大化する配色（HEXコード付き）。
    `;

    contentParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: AI_MODELS.STRATEGY_PLANER,
      contents: { parts: contentParts },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || "生成失敗";
  } catch (error) { throw error; }
};

export const critiqueDraft = async (plan: string, draftImage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: AI_MODELS.CRITIQUE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: cleanBase64(draftImage) } },
          { text: "このサムネイル案をプロの視点で添削し、視認性、インパクト、セーフゾーンの観点から3つの具体的案を日本語で提示してください。" }
        ]
      }
    });
    return response.text || "添削に失敗しました";
  } catch (error) { throw error; }
};

export const generateVisualMockups = async (
  designPlan: string, inputs: ThumbnailInputs, instruction: string = ""
): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const generateSingle = async (v: typeof DRAFT_VARIATIONS[0]) => {
      const parts: any[] = [];
      let p = `Thumbnail Mockup. ${inputs.aspectRatio}. ${v.suffix}\nPlan: ${designPlan}\n${SYSTEM_PROMPTS.STRICT_IDENTITY_RULE}\n${SYSTEM_PROMPTS.VISUAL_HIERARCHY_RULES}\nTEXT: "${inputs.copyText}" / "${inputs.subCopy}"`;

      if (inputs.strictIdentity) p += `\n${SYSTEM_PROMPTS.ABSOLUTE_IDENTITY_PRESERVATION_RULE}`;
      p += `\nSHOT TYPE: ${inputs.subjectType}. SCALE: ${inputs.subjectScale}x. POSITION OFFSET: X=${inputs.subjectX}%, Y=${inputs.subjectY}% (Y-negative is UP).`;

      if (inputs.uploadedBackgroundImage) {
        parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedBackgroundImage) } });
        p += "\nBACKGROUND: Use the provided background image as the base.";
      }
      if (inputs.uploadedImage) parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedImage) } });
      if (inputs.uploadedLogo) parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedLogo) } });

      // Add reference images to the prompt
      if (inputs.referenceImages) { // Ensure referenceImages exists before iterating
        inputs.referenceImages.forEach((ref, idx) => {
          parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(ref) } });
          p += `\nREFERENCE ${idx + 1}: Follow the style/composition from this image.`;
        });
      }

      parts.push({ text: p });

      const res = await ai.models.generateContent({
        model: AI_MODELS.DRAFT_GENERATOR,
        contents: { parts },
        config: { imageConfig: { aspectRatio: inputs.aspectRatio } }
      });
      const data = res.candidates?.[0]?.content?.parts.find(pt => pt.inlineData)?.inlineData?.data;
      return data ? `data:image/png;base64,${data}` : null;
    };

    const results = await Promise.all(DRAFT_VARIATIONS.map(generateSingle));
    return results.filter((r): r is string => r !== null);
  } catch (error) { throw error; }
};

export const generateFinalImage = async (
  designPlan: string,
  selectedDraftImage: string,
  inputs: ThumbnailInputs,
  modificationInstruction: string = "",
  specificMainCopy: string = "",
  specificSubCopy: string = "",
  previousFinalImage: string | null = null
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contentParts: any[] = [];

    contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(selectedDraftImage) } });
    if (inputs.uploadedBackgroundImage) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedBackgroundImage) } });
    if (inputs.uploadedImage) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedImage) } });
    if (inputs.uploadedLogo) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedLogo) } });
    if (previousFinalImage) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(previousFinalImage) } });

    let prompt = `ULTIMATE FINAL RENDER (NANO BANANA PRO). AspectRatio: ${inputs.aspectRatio}.
    Strategy: ${designPlan}
    ${inputs.strictIdentity ? SYSTEM_PROMPTS.ABSOLUTE_IDENTITY_PRESERVATION_RULE : ""}
    ${SYSTEM_PROMPTS.STRICT_IDENTITY_RULE}
    ${SYSTEM_PROMPTS.VISUAL_HIERARCHY_RULES}
    ${SYSTEM_PROMPTS.JAPANESE_FIDELITY_RULE}
    
    !!! SUBJECT ADJUSTMENT !!!
    Target Shot: ${inputs.subjectType === 'full' ? 'Full Body (全身)' : inputs.subjectType === 'bust' ? 'Bust-up (バストアップ)' : 'Face Close-up (ドアップ)'}
    Scale Factor: ${inputs.subjectScale}x relative to standard.
    Position Offset: X=${inputs.subjectX}%, Y=${inputs.subjectY}% (Negative Y means move the subject UP to focus on the top/bust).
    
    !!! MANDATORY TEXT EXECUTION !!!
    1. MAIN COPY: "${specificMainCopy}" - MUST be the most prominent visual element.
    2. SUB COPY: "${specificSubCopy}" - MUST be included as supporting text.
    DO NOT OMIT, DO NOT ALTER, DO NOT ADD EXTRA TEXT.
    
    ${inputs.uploadedBackgroundImage ? "Use the provided Background Image as the environment base." : ""}
    Instruction: ${modificationInstruction}
    Ensure the text is NOT garbled and is rendered in high-quality Japanese fonts.
    High-end production quality, perfect lighting.`;

    contentParts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: AI_MODELS.FINAL_RENDERER,
      contents: { parts: contentParts },
      config: { imageConfig: { aspectRatio: inputs.aspectRatio } }
    });

    const imageData = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
    if (!imageData) throw new Error("生成失敗");
    return `data:image/png;base64,${imageData}`;
  } catch (error) { throw error; }
};