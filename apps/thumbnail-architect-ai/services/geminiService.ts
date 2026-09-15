import { GoogleGenAI } from "@google/genai";
import { ThumbnailInputs, LayeredAssets } from "../types";
import { AI_MODELS, SYSTEM_PROMPTS, DRAFT_VARIATIONS } from "../config";

const cleanBase64 = (data: string) => data.split(',')[1];

const getModelName = (inputs: ThumbnailInputs, type: 'STRATEGY_PLANER' | 'DRAFT_GENERATOR' | 'FINAL_RENDERER' | 'CRITIQUE_MODEL') => {
  const modeKey = inputs.generationMode === 'quality' ? 'QUALITY' : 'SPEED';
  return AI_MODELS[modeKey][type] || AI_MODELS.DEFAULT_PLANNER;
};

export const generateDesignPlan = async (inputs: ThumbnailInputs): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contentParts: any[] = [];

    if (inputs.uploadedImage) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedImage) } });
    if (inputs.referenceImages && inputs.referenceImages.length > 0) {
      inputs.referenceImages.forEach((ref) => {
        contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(ref) } });
      });
    }

    let promptText = `
    YouTube Thumbnail Strategy Plan (Gemini 3.6 Engine).
    Topic: ${inputs.videoDescription}
    Competitor Analysis Target: ${inputs.competitorKeyword || inputs.videoDescription}
    Target Emotion: ${inputs.emotionalTrigger}
    Main Copy: ${inputs.copyText}
    Sub Copy 1: ${inputs.subCopy}
    Sub Copy 2: ${inputs.subCopy2}
    
    被写体の扱い: ${inputs.subjectType === 'full' ? '全身' : inputs.subjectType === 'bust' ? 'バストアップ' : 'ドアップ（顔）'}
    被写体位置オフセット: X=${inputs.subjectX}%, Y=${inputs.subjectY}% (0,0が中央、Yがマイナスで上方向)
    ${inputs.preserveRawSubjectLayer ? "【重要】被写体人物画像はAIによる直接加工・描き直しを行わず、そのままのレイヤーとして背景・テキストと重ね合わせます。" : inputs.strictIdentity ? SYSTEM_PROMPTS.ABSOLUTE_IDENTITY_PRESERVATION_RULE : "被写体の特徴を活かした再構成を許可します。"}
    ${['雑談', '歌枠'].includes(inputs.emotionalTrigger) ? SYSTEM_PROMPTS.TYPOGRAPHY_HEAVY_RULE : ""}

    Google Search を活用してトレンドおよび競合サムネイルパターンを即時解析し、以下のプランを日本語で提示してください：
    1. 【競合差別化】競合が多用している色や構図を避け、YouTubeフィードで一目で目立つ「逆張り」提案。
    2. 【レイアウト＆レイヤー構成】被写体を直接加工せず背景・テキスト・エフェクトと別レイヤーとして重ねる具体的な配置指定（サイズ感: ${inputs.subjectScale}x）。
    3. 【空間設計 & セーフゾーン】画面右下（再生時間タグ 1:23）を絶対保護した文字・ロゴ配置。
    4. 【カラーパレット】CTRを最大化する洗練された配色（HEXコード付き）。
    `;

    contentParts.push({ text: promptText });

    const modelName = getModelName(inputs, 'STRATEGY_PLANER');
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: contentParts },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || "プラン生成に失敗しました";
  } catch (error) { throw error; }
};

export const critiqueDraft = async (plan: string, draftImage: string, inputs?: ThumbnailInputs): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = inputs ? getModelName(inputs, 'CRITIQUE_MODEL') : AI_MODELS.DEFAULT_CRITIQUE;
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: cleanBase64(draftImage) } },
          { text: "このサムネイル案をプロの視点で添削し、視認性、インパクト、右下セーフゾーンの観点から3つの具体的な改善案を日本語で提示してください。" }
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
    const modelName = getModelName(inputs, 'DRAFT_GENERATOR');

    const generateSingle = async (v: typeof DRAFT_VARIATIONS[0]) => {
      const parts: any[] = [];
      let p = `YouTube Thumbnail Mockup. AspectRatio: ${inputs.aspectRatio}. Style: ${v.suffix}\nPlan: ${designPlan}\n${SYSTEM_PROMPTS.STRICT_IDENTITY_RULE}\n${SYSTEM_PROMPTS.VISUAL_HIERARCHY_RULES}\nTEXT: "${inputs.copyText}" / "${inputs.subCopy}"`;

      if (inputs.preserveRawSubjectLayer) {
        p += `\n!!! RAW UNTOUCHED SUBJECT LAYER INSTRUCTION !!!\nTreat the uploaded subject image as an untouched, pixel-identical foreground layer overlaid on the background. Do NOT modify or repaint the face/body.`;
      } else if (inputs.strictIdentity) {
        p += `\n${SYSTEM_PROMPTS.ABSOLUTE_IDENTITY_PRESERVATION_RULE}\n${SYSTEM_PROMPTS.ABSOLUTE_SOURCE_OF_TRUTH_RULE}`;
      }

      if (['雑談', '歌枠'].includes(inputs.emotionalTrigger)) p += `\n${SYSTEM_PROMPTS.TYPOGRAPHY_HEAVY_RULE}`;
      p += `\nSHOT TYPE: ${inputs.subjectType}. SCALE: ${inputs.subjectScale}x. POSITION OFFSET: X=${inputs.subjectX}%, Y=${inputs.subjectY}%.`;

      if (inputs.uploadedBackgroundImage) {
        parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedBackgroundImage) } });
        p += "\nBACKGROUND: Use the provided background image as the base.";
      }
      if (inputs.uploadedImage) parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedImage) } });
      if (inputs.uploadedLogo) parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedLogo) } });

      if (inputs.referenceImages && inputs.referenceImages.length > 0) {
        inputs.referenceImages.forEach((ref, idx) => {
          parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(ref) } });
          p += `\nREFERENCE ${idx + 1}: Follow the composition and layout energy of this image.`;
        });
      }

      parts.push({ text: p });

      const res = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: { imageConfig: { aspectRatio: inputs.aspectRatio } }
      });
      const data = res.candidates?.[0]?.content?.parts.find(pt => pt.inlineData)?.inlineData?.data;
      return data ? `data:image/png;base64,${data}` : null;
    };

    // Parallel calls for fast draft generation
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
  specificSubCopy2: string = "",
  previousFinalImage: string | null = null
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = getModelName(inputs, 'FINAL_RENDERER');
    const contentParts: any[] = [];

    // Image 1: MASTER SUBJECT (The Source of Truth)
    if (inputs.uploadedImage) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedImage) } });

    // Image 2: COMPOSITION REFERENCE (Selected Draft or Previous Polish)
    const compositionBase = previousFinalImage || selectedDraftImage;
    contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(compositionBase) } });

    // Other optional assets
    if (inputs.uploadedBackgroundImage) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedBackgroundImage) } });
    if (inputs.uploadedLogo) contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(inputs.uploadedLogo) } });

    let prompt = `!!! ULTIMATE FINAL RENDER - HIGH-FIDELITY LAYERED SYNTHESIS (GEMINI 3.6 ENGINE) !!!
    AspectRatio: ${inputs.aspectRatio}.
    ${previousFinalImage ? "REFINEMENT ROUND: Image 2 is the previous output. Refine according to instructions while preserving high-quality elements." : ""}
    
    ${modificationInstruction ? `\n!!! USER MODIFICATION REQUEST !!!\n${modificationInstruction}\n` : ""}
    
    ${inputs.preserveRawSubjectLayer ? "!!! RAW UNTOUCHED SUBJECT LAYER MODE !!!\nKeep Image 1 (Subject) completely untouched in original pixel form. Overlay it seamlessly as a front layer over Image 2 (Background & Composition)." : SYSTEM_PROMPTS.ABSOLUTE_SOURCE_OF_TRUTH_RULE}
    ${inputs.strictIdentity ? SYSTEM_PROMPTS.ABSOLUTE_IDENTITY_PRESERVATION_RULE : ""}
    ${['雑談', '歌枠'].includes(inputs.emotionalTrigger) ? SYSTEM_PROMPTS.TYPOGRAPHY_HEAVY_RULE : ""}
    ${SYSTEM_PROMPTS.STRICT_IDENTITY_RULE}
    ${SYSTEM_PROMPTS.VISUAL_HIERARCHY_RULES}
    ${SYSTEM_PROMPTS.JAPANESE_FIDELITY_RULE}
    
    !!! MANDATORY TEXT QUALITY & JAPANESE FIDELITY !!!
    1. MAIN COPY: "${specificMainCopy}"
    2. SUB COPY 1: "${specificSubCopy}"
    3. SUB COPY 2: "${specificSubCopy2}"
    CRITICAL: Render exact Japanese characters with zero Chinese font substitutions or distortion. Text must pop with maximum contrast and high CTR readability.`;

    if (inputs.referenceImages && inputs.referenceImages.length > 0) {
      inputs.referenceImages.forEach((ref, idx) => {
        contentParts.push({ inlineData: { mimeType: "image/png", data: cleanBase64(ref) } });
        prompt += `\nREFERENCE ${idx + 1}: Adapt layout balance and high-impact visual style.`;
      });
    }

    contentParts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: contentParts },
      config: { imageConfig: { aspectRatio: inputs.aspectRatio } }
    });

    const imageData = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
    if (!imageData) throw new Error("画像データの生成に失敗しました");
    return `data:image/png;base64,${imageData}`;
  } catch (error) { throw error; }
};

export const generateLayeredAssets = async (
  designPlan: string,
  finalImageBase64: string,
  inputs: ThumbnailInputs
): Promise<LayeredAssets> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = getModelName(inputs, 'FINAL_RENDERER');

    const callAI = async (component: string, instruction: string) => {
      const parts = [
        { inlineData: { mimeType: "image/png", data: cleanBase64(finalImageBase64) } },
        {
          text: `LAYER EXTRACTION: Based on the provided final thumbnail, generate ONLY the ${component}.
        Instruction: ${instruction}
        Aspect Ratio: ${inputs.aspectRatio}. High quality resolution.`
        }
      ];
      const res = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: { imageConfig: { aspectRatio: inputs.aspectRatio } }
      });
      const data = res.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
      return data ? `data:image/png;base64,${data}` : "";
    };

    // Parallel extraction for speed
    const [bg, sub, txt, eff] = await Promise.all([
      callAI("Background Layer", "Clean background environment. REMOVE the character, text, and logos. Extend background seamlessly."),
      callAI("Subject Layer", "Standalone subject/person. REMOVE background, text, and effects."),
      callAI("Text Layer", "Standalone typography & copy text with all outlines and glows. REMOVE background and person."),
      callAI("Effects Layer", "Standalone overlay visual effects (glows, particles, framing). REMOVE subject, text, background.")
    ]);

    return { background: bg, subject: sub, text: txt, effects: eff };
  } catch (error) { throw error; }
};