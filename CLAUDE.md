# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

WSL2 Ubuntu on Windows. To open files from WSL:

```bash
# ブラウザで開く
powershell.exe -Command "Start-Process '\\\\\\\\wsl.localhost\\\\Ubuntu\\\\home\\\\masato\\\\projects\\\\claude-practice\\\\cloudecode-ai-book\\\\nippo\\\\<file>'"

# VS Code で開く
code <file>
```

## Project Overview

営業担当者が日々の訪問記録・課題・計画を報告し、上長がコメントできる **営業日報システム**。

### ロール定義

|ロール|値|主な権限|
|-|-|-|
|営業|`sales`|自分の日報の作成・提出|
|上長|`manager`|部下の日報閲覧・コメント投稿・顧客マスタ管理|
|管理者|`admin`|全操作・ユーザーマスタ管理|

## Tech Stack

* **Framework**: Next.js 16 (App Router)
* **Language**: TypeScript 5（strict mode）
* **Styling**: Tailwind CSS 4
* **Linter**: ESLint 9（flat config）

## Commands

```bash
# 開発サーバー起動
npm run dev

# Lint チェック
npm run lint

# Lint 自動修正
npm run lint:fix

# 型チェック
npm run type-check
```

## Specifications

### ER図・要件定義

以下の仕様書を参照すること。

* 画面定義書: @screen-definition.md
* API仕様書: @api-specification.md
* テスト仕様書: @test-specification.md



\#使用技術

\*\*言語\*\* TypeScript

\*\*フレームワーク\*\* Next.js(APP Router)

\*\*UIコンポーネント\*\* shadcn/ui + Tailwind CSS

\*\*APIスキーマ定義\*\* OpenAPI(Zodによる検証)

\*\*DBスキーマ定義\*\* Prisma.js

\*\*テスト\*\* Vitest

\*\*デプロイ\*\* Google Cloud Run

