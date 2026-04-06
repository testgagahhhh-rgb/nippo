# ブランチ分析結果

## 1. 各Issueの変更ファイル一覧

| Issue | タイトル | 状態 | 主な変更ファイル |
|-------|---------|------|-----------------|
| **#1** | Prismaスキーマ再設計 | merged | `prisma/schema.prisma`, `prisma.config.ts`, migration |
| **#1-prisma** | (同上・別ブランチ) | merged | `prisma/schema.prisma`, `prisma.config.ts`, `package.json`, migration |
| **#2-seed** | シードデータ・フィクスチャ | merged | `prisma/seed.ts`, `src/test/fixtures/index.ts`, prisma関連 |
| **#3-jwt** | JWT認証基盤 | **未マージ** | `src/lib/auth/jwt.ts`, `src/lib/auth/password.ts`, `src/lib/auth/token-blacklist.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts` |
| **#4-auth-mw** | 認証ミドルウェア | **未マージ** | `middleware.ts`, `src/lib/middleware/auth.ts`, `src/lib/auth/jwt.ts` |
| **#5-create** | 日報作成API | **未マージ** | `src/app/api/reports/route.ts`, `src/lib/schemas/report.ts`, + #4の全ファイル |
| **#6** | 日報一覧API | merged | `src/app/api/reports/route.ts`, `src/lib/schemas/report.ts`, `src/lib/middleware/auth.ts` |
| **#7** | 日報詳細・更新・提出API | **未マージ** | `src/app/api/reports/[id]/route.ts`, `src/app/api/reports/[id]/submit/route.ts`, + #5の全ファイル |
| **#7-report-crud** | (同上・別ブランチ) | **未マージ** | 同上 |
| **#8** | コメントAPI | merged | `src/app/api/reports/[id]/comments/route.ts`, テスト含む |
| **#9** | 顧客マスタAPI | merged | `src/app/api/customers/route.ts`, `src/app/api/customers/[id]/route.ts`, `src/lib/schemas/customer.ts` |
| **#10** | ユーザーマスタAPI | merged | `src/app/api/users/route.ts`, `src/app/api/users/[id]/route.ts`, `src/lib/schemas/user.ts` |
| **#11** | ログイン画面 | merged | `src/app/(auth)/login/page.tsx`, shadcn/ui components, `src/lib/api/client.ts` |
| **#12** | ダッシュボード画面 | merged | `src/app/(app)/dashboard/page.tsx`, `src/components/dashboard/*`, `src/components/layout/Header.tsx` |
| **#13** | 日報作成・編集画面 | merged | `src/app/(app)/reports/*/page.tsx`, `src/components/report/ReportForm.tsx` |
| **#14** | 日報詳細画面 | merged | `src/app/(app)/reports/[id]/page.tsx`, `src/components/report/CommentSection.tsx` |
| **#15** | 顧客マスタ画面 | merged | `src/app/(app)/customers/*`, `src/components/customer/CustomerForm.tsx` |
| **#16** | ユーザーマスタ画面 | merged | `src/app/(app)/users/*`, `src/components/user/UserForm.tsx` (Issue#15の上に積まれている) |
| **#17** | 単体テスト | merged | `src/test/unit/*.test.ts` 8件, `src/lib/{date-utils,jwt,password,permissions,report-status,validators}.ts` |
| **#18** | 結合テスト | merged | `src/test/integration/integration.test.ts`, `src/services/*.ts`, `src/lib/{auth-middleware,db}.ts` |
| **#19** | XSS/SQLi対策 | merged | `src/lib/sanitize.ts`, `src/lib/api-client.ts`, `src/test/security/*.test.ts` 3件 |
| **#45** | フロントエンド↔API接続 | merged | 全Issue統合 + `src/lib/auth/session.ts`, `src/test/mocks/handlers.ts`, `vitest.config.ts` |
| **#46** | テスト書き直し | **未マージ** | (issue-45と同じベース、追加変更未確認) |

---

## 2. ファイル重複状況（競合リスク）

**高頻度で重複するファイル（6ブランチ以上）:**

| ファイル | 触っているブランチ |
|---------|-------------------|
| `src/lib/auth/jwt.ts` | #3, #4, #5, #6, #7, #8, #9, #10 |
| `src/lib/middleware/auth.ts` | #4, #5, #6, #7, #8, #9, #10 |
| `src/lib/prisma.ts` | #3, #4, #5, #6, #7, #8, #9, #10 |
| `src/lib/auth.ts` | #12, #13, #14, #15, #16, #17, #18, #19 |
| `src/components/layout/Header.tsx` | #12, #13, #15, #16, #17, #18, #19 |
| `src/app/globals.css` | #11, #12, #13, #15, #16, #17, #18, #19 |
| `src/app/layout.tsx` | #11, #12, #13, #15, #16, #17, #18, #19 |
| `src/lib/mockData.ts` | #12, #13, #15, #16, #17, #18, #19 |
| `src/types/index.ts` | #12, #13, #15, #16, #17, #18, #19 |
| `prisma/schema.prisma` | #1, #1-prisma, #2-seed, #5, #7, #8 |
| `package.json` | #1-prisma, #2-seed, #3, #4, #5, #7, #8, #9, #11, #18, #19 |

---

## 3. 実装されている機能一覧

| レイヤー | 機能 | Issue |
|---------|------|-------|
| **DB** | Prismaスキーマ定義 | #1 |
| **DB** | シードデータ・テストフィクスチャ | #2 |
| **認証** | JWT認証（login/logout API） | #3 |
| **認証** | 認証・認可ミドルウェア | #4 |
| **API** | 日報 CRUD (POST/GET/PUT) | #5, #6, #7 |
| **API** | 日報提出 (POST /reports/:id/submit) | #7 |
| **API** | コメント投稿 | #8 |
| **API** | 顧客マスタ CRUD | #9 |
| **API** | ユーザーマスタ CRUD | #10 |
| **画面** | ログイン画面 | #11 |
| **画面** | ダッシュボード（日報一覧） | #12 |
| **画面** | 日報作成・編集 | #13 |
| **画面** | 日報詳細+コメント | #14 |
| **画面** | 顧客マスタ画面 | #15 |
| **画面** | ユーザーマスタ画面 | #16 |
| **テスト** | 単体テスト 8件 | #17 |
| **テスト** | 結合テスト 9件 | #18 |
| **セキュリティ** | XSS/SQLi対策 | #19 |
| **統合** | フロントエンド↔API接続 | #45 |
| **テスト** | 結合テスト書き直し（API経由） | #46 (未マージ) |

---

## 4. 依存関係グラフ

```
#1 Prismaスキーマ
 └── #2 シードデータ
      └── #3 JWT認証
           └── #4 認証ミドルウェア
                ├── #5 日報作成API
                │    └── #7 日報詳細・更新・提出API
                ├── #6 日報一覧API (独立実装・masterにマージ済)
                ├── #8 コメントAPI (独立実装・masterにマージ済)
                ├── #9 顧客マスタAPI (独立実装)
                └── #10 ユーザーマスタAPI (独立実装)

#11 ログイン画面 (独立)
#12 ダッシュボード画面 (独立)
#13 日報作成・編集画面 (独立)
#14 日報詳細画面 (独立)
#15 顧客マスタ画面 (独立)
 └── #16 ユーザーマスタ画面 (#15の上に積まれている)
      └── #17 単体テスト (#15の上に積まれている)
           └── #18 結合テスト (#17の上に積まれている)
                └── #19 XSS/SQLi対策 (#18の上に積まれている)

#45 統合ブランチ (全ブランチをマージ)
 └── #46 テスト書き直し (#45ベース・未マージ)
```

### 要点

- **API系 (#3→#4→#5→#7)** は直列の依存チェーン。#6, #8, #9, #10 は独立に実装されてmaster直マージ
- **画面系 (#11〜#14)** は独立実装だが、`src/lib/auth.ts`, `Header.tsx`, `mockData.ts` で暗黙的に重複
- **#15→#16→#17→#18→#19** はgitの親子関係で直列チェーンになっている（各ブランチが前のブランチの上に積まれている）
- **未マージブランチ**: #3, #4, #5, #7(2本), #16, #46 — ただし内容はすべて #45 統合ブランチ経由でmasterに入っている

---

## 5. 再実装の実行計画

### 5.1 フェーズ定義（直列で実装すべき順序）

再実装は7フェーズに分割する。各フェーズは前のフェーズの完了を前提とする。

```
Phase 1: DB基盤        → Phase 2: 認証基盤    → Phase 3: API実装
                                                → Phase 4: 画面実装（Phase 2完了後に開始可能）
Phase 3+4 完了後        → Phase 5: 統合接続    → Phase 6: テスト・セキュリティ
Phase 6 完了後          → Phase 7: インフラ
```

| Phase | 名称 | 含まれるIssue | 前提Phase |
|-------|------|-------------|-----------|
| **1** | DB基盤 | #1, #2 | なし |
| **2** | 認証基盤 | #3, #4 | Phase 1 |
| **3** | API実装 | #5, #6, #7, #8, #9, #10 | Phase 2 |
| **4** | 画面実装 | #11, #12, #13, #14, #15, #16 | Phase 2（mockDataで動作するためAPIは不要） |
| **5** | フロントエンド↔API統合 | #45 | Phase 3 + Phase 4 |
| **6** | テスト・セキュリティ | #17, #18, #19, #46 | Phase 5 |
| **7** | インフラ | #20, #21 | Phase 6 |

### 5.2 並列実行可能なグループ

#### Phase 1: DB基盤（直列）

```
#1 Prismaスキーマ → #2 シードデータ
```

- #2 は #1 のスキーマに依存するため直列必須

#### Phase 2: 認証基盤（直列）

```
#3 JWT認証 → #4 認証ミドルウェア
```

- #4 は #3 の `jwt.ts` を利用するため直列必須

#### Phase 3: API実装（一部並列可）

```
               ┌── #6 日報一覧API ──────────┐
#5 日報作成API ─┤                            ├── (完了)
               └── #7 日報詳細・更新・提出API ┘
                        ※#5の route.ts を拡張

#8 コメントAPI ─── (独立実行可)
#9 顧客マスタAPI ── (独立実行可)
#10 ユーザーマスタAPI ── (独立実行可)
```

| グループ | Issue | 並列可否 | 理由 |
|---------|-------|---------|------|
| API-A | #5 → #7 | 直列 | #7は#5の`reports/route.ts`を前提とする |
| API-A | #5 → #6 | 直列 | #6も`reports/route.ts`を共有（GET/POSTが同一ファイル） |
| API-B | #8 | **並列可** | `reports/[id]/comments/` は独立パス |
| API-C | #9 | **並列可** | `customers/` は独立パス |
| API-D | #10 | **並列可** | `users/` は独立パス |

**推奨実行順:**
1. **並列グループ1**: #8, #9, #10 を同時実行
2. **直列グループ**: #5 → #6 → #7 を順次実行
3. ただし共通ファイル（`jwt.ts`, `middleware/auth.ts`, `prisma.ts`）は Phase 2 で確定済みのため、並列グループ1と直列グループも同時実行可能

#### Phase 4: 画面実装（大部分が並列可）

```
#11 ログイン画面 ────── (独立: (auth)レイアウト)
#12 ダッシュボード画面 ─┐
#13 日報作成・編集画面 ─┤─ 共有ファイル: Header.tsx, auth.ts, mockData.ts, types/index.ts
#14 日報詳細画面 ───────┤  → 共有ファイルを先に確定してから並列実行
#15 顧客マスタ画面 ─────┘
     └── #16 ユーザーマスタ画面 (独立だが#15の後が安全)
```

| グループ | Issue | 並列可否 | 理由 |
|---------|-------|---------|------|
| UI-共通 | 共有ファイル群の確定 | 最初に実施 | `Header.tsx`, `auth.ts`, `mockData.ts`, `types/index.ts`, `globals.css`, `layout.tsx` |
| UI-A | #11 | **並列可** | `(auth)/` レイアウトで完全独立 |
| UI-B | #12, #13, #14 | **並列可** | 共有ファイル確定後はページ・コンポーネントが独立 |
| UI-C | #15 → #16 | 直列 | #16は#15のパターン（フォーム構成、レイアウト）を踏襲 |

**推奨実行順:**
1. 共有ファイル（`Header.tsx`, `auth.ts`, `mockData.ts`, `types/index.ts`）を #12 の実装時に確定
2. **並列実行**: #11, #13, #14, #15
3. #15 完了後に #16

#### Phase 5: 統合（直列）

```
#45 フロントエンド ↔ API接続
```

- mockDataからAPI呼び出しへの切り替え。全API・全画面の完了が前提

#### Phase 6: テスト・セキュリティ（直列）

```
#17 単体テスト → #18 結合テスト → #19 XSS/SQLi対策 → #46 テスト書き直し
```

- 各テストは前段のテスト基盤に依存するため直列推奨

#### Phase 7: インフラ（並列可）

```
#20 CI/CDパイプライン ── (並列可)
#21 本番環境対応 ─────── (並列可)
```

### 5.3 各Issueの参照ブランチ

再実装時に既存の実装を参照するためのブランチ一覧。**複数ブランチがある場合は推奨ブランチを太字で示す。**

| Issue | 参照ブランチ | 備考 |
|-------|------------|------|
| #1 | **`feature/issue-1-prisma-schema`** / `feature/issue-1` | prisma-schema版がレビュー修正済みで最終形 |
| #2 | **`feature/issue-2-seed-fixtures`** | seed.ts とフィクスチャを含む |
| #3 | **`feature/issue-3-jwt-auth`** | login/logout API + JWT/パスワードユーティリティ |
| #4 | **`feature/issue-4-auth-middleware`** | middleware.ts + auth.ts |
| #5 | **`feature/issue-5-create-report`** | #4の上に積まれた差分を参照 |
| #6 | **`feature/issue-6`** | 独立実装版（masterにマージ済） |
| #7 | **`feature/issue-7-report-crud`** / `feature/issue-7` | report-crud版が命名規則に準拠。内容はほぼ同一 |
| #8 | **`feature/issue-8`** | コメントAPI（masterにマージ済） |
| #9 | **`feature/issue-9`** | 顧客API（masterにマージ済） |
| #10 | **`feature/issue-10`** | ユーザーAPI（masterにマージ済） |
| #11 | **`feature/issue-11`** | ログイン画面 + shadcn/ui初期セットアップ |
| #12 | **`feature/issue-12`** | ダッシュボード + 共有コンポーネント初出 |
| #13 | **`feature/issue-13`** | 日報フォーム + 訪問記録行コンポーネント |
| #14 | **`feature/issue-14`** | 日報詳細 + コメントセクション |
| #15 | **`feature/issue-15`** | 顧客マスタ画面 |
| #16 | **`feature/issue-16`** | #15の差分のみ参照（#15の上に積まれている） |
| #17 | **`feature/issue-17`** | #15の差分のみ参照。テスト対象のユーティリティ関数も含む |
| #18 | **`feature/issue-18`** | #17の差分のみ参照。`src/services/*.ts` が初出 |
| #19 | **`feature/issue-19`** | #18の差分のみ参照。`sanitize.ts`, セキュリティテストが初出 |
| #45 | **`feature/issue-45`** / `master` | 全統合。masterと同一内容 |
| #46 | **`feature/issue-46`** | #45ベース。未マージのため最新の実装意図を確認 |
| #20 | なし（未実装） | GitHub Actions + Cloud Run の新規構築 |
| #21 | なし（未実装） | Dockerfile + 環境変数の新規構築 |

### 5.4 最速実行パス（タイムライン）

並列実行を最大化した場合の実行順序：

```
時間軸 →

[Phase 1]  #1 → #2
                  │
[Phase 2]         #3 → #4
                         │
                         ├─────────────────────────────────────────┐
[Phase 3]                │  #5 → #6 → #7                         │
                         │  #8  (並列)                             │
                         │  #9  (並列)                             │
                         │  #10 (並列)                             │
[Phase 4]                │  共有ファイル確定 → #11 #13 #14 #15 (並列)│
                         │                    #12 (共有確定の起点)   │
                         │                         #16 (#15完了後)  │
                         ├─────────────────────────────────────────┘
[Phase 5]                                    #45 フロントエンド↔API統合
                                              │
[Phase 6]                                     #17 → #18 → #19 → #46
                                                                  │
[Phase 7]                                                    #20 + #21 (並列)
```

**Phase 3 と Phase 4 は同時並行で進行可能** — これが最大の時間短縮ポイント。
