# 再実装 進捗管理

## Phase 1: DB基盤

| Issue | タイトル | 状態 | 完了日 |
|-------|---------|------|-------|
| #1 | Prismaスキーマ再設計 | done | 2026-04-06 |
| #2 | シードデータ・フィクスチャ | done | 2026-04-06 |

## Phase 2: 認証基盤

| Issue | タイトル | 状態 | 完了日 |
|-------|---------|------|-------|
| #3 | JWT認証基盤 | done | 2026-04-06 |
| #4 | 認証ミドルウェア | done | 2026-04-06 |

## Phase 3: API実装

| Issue | タイトル | 状態 | 完了日 |
|-------|---------|------|-------|
| #5 | 日報作成API | done | 2026-04-06 |
| #6 | 日報一覧API | done | 2026-04-06 |
| #7 | 日報詳細・更新・提出API | done | 2026-04-06 |
| #8 | コメントAPI | done | 2026-04-06 |
| #9 | 顧客マスタAPI | done | 2026-04-06 |
| #10 | ユーザーマスタAPI | done | 2026-04-06 |

## Phase 4: 画面実装

| Issue | タイトル | 状態 | 完了日 |
|-------|---------|------|-------|
| #11 | ログイン画面 | done | 2026-04-06 |
| #12 | ダッシュボード画面 | done | 2026-04-06 |
| #13 | 日報作成・編集画面 | done | 2026-04-06 |
| #14 | 日報詳細画面 | done | 2026-04-06 |
| #15 | 顧客マスタ画面 | done | 2026-04-06 |
| #16 | ユーザーマスタ画面 | done | 2026-04-06 |

## Phase 5: 統合

| Issue | タイトル | 状態 | 完了日 |
|-------|---------|------|-------|
| #45 | フロントエンド↔API接続 | done | 2026-04-06 |

## Phase 6: テスト・セキュリティ

| Issue | タイトル | 状態 | 完了日 |
|-------|---------|------|-------|
| #17 | 単体テスト（UT-001〜UT-008: 45ケース） | done | 2026-04-06 |
| #18 | 結合テスト（IT-001〜IT-009: 14ケース） | done | 2026-04-06 |
| #19 | XSS/SQLi対策（17ケース） | done | 2026-04-06 |

## Phase 7: インフラ

| Issue | タイトル | 状態 | 完了日 |
|-------|---------|------|-------|
| #20 | CI/CDパイプライン | done | 2026-04-06 |
| #21 | 本番環境対応 | done | 2026-04-06 |

## 統合履歴

| 日付 | 対象 | 結果 |
|------|------|------|
| 2026-04-06 | phase4-ui → master | 成功（コンフリクトなし、型チェック・テスト通過） |
| 2026-04-06 | phase3-api → master | 成功（コンフリクトなし、型チェック・テスト59件通過） |
| 2026-04-06 | phase5-api-integration → master | 成功（コンフリクトなし、型チェック・テスト59件通過） |
| 2026-04-06 | feature/issue-17 → master | 成功（型チェック・テスト100件通過） |
| 2026-04-06 | feature/issue-18 → master | 成功（型チェック・テスト114件通過） |
| 2026-04-06 | feature/issue-19 → master | 成功（型チェック・テスト131件通過） |
| 2026-04-06 | phase7-cicd → master | 成功（コンフリクトなし、テスト131件通過） |
| 2026-04-06 | phase7-prod → master | 成功（コンフリクトなし、テスト131件通過） |

## バグ修正履歴

動作確認（ローカルDB + dev server）で発見・修正したバグ一覧。

| # | 修正日 | 画面 | 症状 | 原因 | 対応 |
|---|--------|------|------|------|------|
| 1 | 2026-04-07 | ダッシュボード | `report.comments.length` で TypeError | 一覧API (`GET /reports`) は `comments` 配列を返さず `has_unread_comment` フラグを返す仕様だが、ReportTable が `comments.length` を参照していた | ReportTable を `hasUnreadComment` フラグベースに変更。DashboardPage でAPIレスポンス (snake_case) を camelCase にマッピング |
| 2 | 2026-04-07 | 日報詳細 | `report.visitRecords.map` で TypeError | 詳細API (`GET /reports/:id`) のレスポンスが snake_case (`visit_records`, `report_date`, `target_type`) だが、フロントが camelCase (`visitRecords`, `reportDate`, `targetType`) でアクセスしていた | `mapReportResponse` 変換関数を作成し適用 |
| 3 | 2026-04-07 | 日報編集 | `report.visitRecords.map` で TypeError（バグ#2と同根） | 編集ページでも同じ snake_case レスポンスを camelCase 型として扱っていた | `src/lib/api/mappers.ts` に共有マッパーを切り出し、詳細・編集の両ページで使用 |

### 根本原因

Phase 3 (API実装) と Phase 4 (画面実装) を並列で実装したため、APIレスポンスの命名規則 (snake_case) とフロント型定義 (camelCase) の不一致が Phase 5 (統合) で十分にカバーされていなかった。

### 追加で実施したインフラ修正

| # | 修正日 | 対象 | 内容 |
|---|--------|------|------|
| 4 | 2026-04-07 | Dockerfile | node:20→22、`npm ci --ignore-scripts && npm rebuild`、public/ COPY削除 |
| 5 | 2026-04-07 | globals.css | Turbopack が `"style"` 条件付き export を解決できない問題を回避（CSSをローカルコピー） |
| 6 | 2026-04-07 | src/lib/prisma.ts | Proxy で遅延初期化（ビルド時のDB接続エラー回避）、PrismaPg アダプター対応 |
| 7 | 2026-04-07 | middleware.ts | `/api/health` を認証スキップ対象に追加 |
| 8 | 2026-04-07 | prisma/seed.ts | ダミーハッシュ → bcrypt 実ハッシュ生成に変更、PrismaPg アダプター対応 |
