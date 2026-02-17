# AI Interaction Rules / AIとの対話ルール

## Language Policy / 言語ポリシー

- **Bilingual Documentation / ドキュメントの二ヶ国語併記**:
  - All implementation plans, task lists (`task.md`), workflows, and walkthroughs must include both Japanese and English.
  - 計画表（implementation plans）、タスクリスト（`task.md`）、ワークフロー（workflows）、および報告書（walkthroughs）には、必ず日本語と英語を併記してください。
- **Format / 形式**:
  - Use "English / 日本語" or a split-section format to ensure clarity for both languages.
  - "英語 / 日本語" の形式、またはセクションを分けて、両方の言語で内容が明確に伝わるようにしてください。

## Secret Management & Leak Prevention / 機密情報の管理と漏洩防止

- **Prevention of Secret Leaks / 機密情報の漏洩防止**:
  - NEVER commit or push files containing API keys or secrets (e.g., `.env`, `.env.local`, `.env.*.local`).
  - Always verify that a `.gitignore` exists in any new project sub-directory and that it includes environment files.
  - Before pushing to GitHub, audit the repository for any accidentally tracked secrets using `git ls-files`.
  - APIキーや機密情報を含むファイル（`.env`, `.env.local`, `.env.*.local` など）を決してコミットやプッシュしないでください。
  - 新しいプロジェクトのサブディレクトリには必ず `.gitignore` が存在し、環境変数が除外設定に含まれていることを確認してください。
  - GitHubにプッシュする前に、`git ls-files` を使用して、機密情報が誤って追跡されていないかリポジトリを監査（Audit）してください。
