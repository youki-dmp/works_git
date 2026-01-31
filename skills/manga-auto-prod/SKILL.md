---
name: manga-auto-prod
description: 4-panel manga production system using Nano Banana Pro. Use when asked to create a 4-panel manga with character consistency and specific layout patterns (Vertical or 2x2 Grid). Supports sequential generation and "Master Reference" management.
---

# Manga Auto Production

This skill enables the autonomous production of high-quality 4-panel manga strips using **Nano Banana Pro (Gemini 3 Pro Image)**. It prioritizes character consistency and layout flexibility.

## Core Workflow (The Manager Loop)

To produce a premium manga, act as a **Manga Manager** and follow these steps:

### 1. Conceptualization & Selection
- Define the characters and the 4-panel plot.
- **Select Layout Pattern**:
  - **Pattern A (Vertical)**: Standard webtoon style (Top to Bottom).
  - **Pattern B (2x2 Grid)**: Reading order: Top-Right (1) -> Bottom-Right (2) -> Top-Left (3) -> Bottom-Left (4).

### 2. Character Definition (Master Reference)
- Generate the **Panel 1** first. This becomes your **Master Reference**.
- Be extremely specific in the prompt about colors, hairstyle, clothes, and robot features (e.g., "White round robot with gold ball antenna and pink headphones").

### 3. Sequential Generation (Consistency Loop)
- Generate panels 2, 3, and 4 one by one.
- **CRITICAL**: Use the **previous panel** as the `input-image` for the next one.
- Explicitly instruct the AI to "keep the characters identical to the input image" while describing the new action or angle.

### 4. Final Composition
- Use the bundled script to merge the 4 panels into the selected layout.

```bash
# Pattern A (Vertical)
python3 scripts/manga_engine.py A output.png p1.png p2.png p3.png p4.png

# Pattern B (2x2 Grid)
python3 scripts/manga_engine.py B output.png p1.png p2.png p3.png p4.png
```

## Prompt Engineering for Consistency

When generating panels via Nano Banana Pro, always include these anchors:
- "MASTER REFERENCE: [Character Details]"
- "High-quality anime illustration, Sanrio-inspired soft pastel colors."
- "Include Japanese text in bubble: '[Text]'"

## Quality Checklist
- [ ] Characters look identical in all 4 panels?
- [ ] Reading order matches the selected pattern?
- [ ] Japanese text is correctly rendered?
- [ ] No unwanted margins or aspect ratio mismatches?
