# 営業日報システム API仕様書

## 基本仕様

| 項目 | 内容 |
|---|---|
| ベースURL | `https://api.example.com/api/v1` |
| データ形式 | JSON |
| 文字コード | UTF-8 |
| 認証方式 | Bearer Token（JWT） |

## 共通仕様

### リクエストヘッダー

```
Content-Type: application/json
Authorization: Bearer {token}  ※ログインエンドポイントを除く
```

### 共通レスポンス形式

**成功**
```json
{
  "data": { ... }
}
```

**一覧取得**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20
  }
}
```

**エラー**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      { "field": "email", "message": "メール形式で入力してください" }
    ]
  }
}
```

### HTTPステータスコード

| コード | 意味 |
|---|---|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | バリデーションエラー |
| 401 | 認証エラー（未ログイン） |
| 403 | 認可エラー（権限なし） |
| 404 | リソース未存在 |
| 422 | ビジネスロジックエラー |
| 500 | サーバーエラー |

### ロール定義

| ロール | 値 |
|---|---|
| 営業 | `sales` |
| 上長 | `manager` |
| 管理者 | `admin` |

---

## エンドポイント一覧

| メソッド | パス | 概要 | 利用可能ロール |
|---|---|---|---|
| POST | /auth/login | ログイン | 全員 |
| POST | /auth/logout | ログアウト | 全員 |
| GET | /reports | 日報一覧取得 | 全員 |
| POST | /reports | 日報作成 | sales |
| GET | /reports/:id | 日報詳細取得 | 全員 |
| PUT | /reports/:id | 日報更新 | sales（本人・下書きのみ） |
| POST | /reports/:id/submit | 日報提出 | sales（本人・下書きのみ） |
| POST | /reports/:id/comments | コメント投稿 | manager, admin |
| GET | /customers | 顧客一覧取得 | 全員 |
| POST | /customers | 顧客作成 | manager, admin |
| GET | /customers/:id | 顧客詳細取得 | 全員 |
| PUT | /customers/:id | 顧客更新 | manager, admin |
| GET | /users | ユーザー一覧取得 | admin |
| POST | /users | ユーザー作成 | admin |
| GET | /users/:id | ユーザー詳細取得 | admin |
| PUT | /users/:id | ユーザー更新 | admin |

---

## 認証

### POST /auth/login

ログインしてアクセストークンを取得する。

**リクエスト**

```json
{
  "email": "yamada@example.com",
  "password": "password123"
}
```

**レスポンス 200**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-04-02T09:00:00+09:00",
    "user": {
      "id": 1,
      "name": "山田太郎",
      "email": "yamada@example.com",
      "role": "sales",
      "department": {
        "id": 1,
        "name": "東京営業部"
      }
    }
  }
}
```

**エラー**

| コード | エラーコード | 説明 |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | メールアドレスまたはパスワードが不正 |

---

### POST /auth/logout

アクセストークンを無効化する。

**レスポンス 200**

```json
{
  "data": {
    "message": "ログアウトしました"
  }
}
```

---

## 日報

### GET /reports

日報一覧を取得する。ロールによって返却範囲が異なる。

- `sales`: 自分の日報のみ
- `manager`: 同一部署の部下全員の日報
- `admin`: 全ユーザーの日報

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| page | integer | — | ページ番号（デフォルト: 1） |
| per_page | integer | — | 1ページの件数（デフォルト: 20, 最大: 100） |
| year_month | string | — | 絞り込み年月（例: `2026-04`） |
| user_id | integer | — | 営業担当者ID（manager/admin のみ有効） |
| status | string | — | `draft` / `submitted` |

**レスポンス 200**

```json
{
  "data": [
    {
      "id": 1,
      "report_date": "2026-04-01",
      "status": "submitted",
      "submitted_at": "2026-04-01T18:30:00+09:00",
      "user": {
        "id": 1,
        "name": "山田太郎"
      },
      "has_unread_comment": false,
      "created_at": "2026-04-01T09:00:00+09:00",
      "updated_at": "2026-04-01T18:30:00+09:00"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "per_page": 20
  }
}
```

---

### POST /reports

日報を新規作成する。

**リクエスト**

```json
{
  "report_date": "2026-04-01",
  "visit_records": [
    {
      "customer_id": 10,
      "content": "新製品の提案を実施。先方の反応は良好。",
      "visited_at": "10:00"
    },
    {
      "customer_id": 15,
      "content": "契約更新の確認。来週再訪の約束。",
      "visited_at": "14:30"
    }
  ],
  "problem": "ABC社担当者が来月異動予定。後任担当者への引き継ぎ方法を要検討。",
  "plan": "・ABC社フォローアップ連絡\n・提案書の修正"
}
```

**バリデーション**

| フィールド | ルール |
|---|---|
| report_date | 必須。同一ユーザーで同日の日報が存在しないこと |
| visit_records | 1件以上。各行の customer_id・content は必須 |
| visit_records[].content | 最大1000文字 |
| problem | 最大2000文字 |
| plan | 最大2000文字 |

**レスポンス 201**

```json
{
  "data": {
    "id": 42,
    "report_date": "2026-04-01",
    "status": "draft",
    "submitted_at": null,
    "user": {
      "id": 1,
      "name": "山田太郎"
    },
    "visit_records": [
      {
        "id": 101,
        "customer": {
          "id": 10,
          "name": "山田 一郎",
          "company_name": "株式会社ABC"
        },
        "content": "新製品の提案を実施。先方の反応は良好。",
        "visited_at": "10:00"
      }
    ],
    "problem": "ABC社担当者が来月異動予定。後任担当者への引き継ぎ方法を要検討。",
    "plan": "・ABC社フォローアップ連絡\n・提案書の修正",
    "comments": [],
    "created_at": "2026-04-01T09:00:00+09:00",
    "updated_at": "2026-04-01T09:00:00+09:00"
  }
}
```

**エラー**

| コード | エラーコード | 説明 |
|---|---|---|
| 422 | `REPORT_ALREADY_EXISTS` | 同日の日報が既に存在する |
| 403 | `FORBIDDEN` | sales 以外がリクエスト |

---

### GET /reports/:id

日報詳細を取得する。

**パスパラメータ**

| パラメータ | 型 | 説明 |
|---|---|---|
| id | integer | 日報ID |

**レスポンス 200**

```json
{
  "data": {
    "id": 42,
    "report_date": "2026-04-01",
    "status": "submitted",
    "submitted_at": "2026-04-01T18:30:00+09:00",
    "user": {
      "id": 1,
      "name": "山田太郎",
      "department": {
        "id": 1,
        "name": "東京営業部"
      }
    },
    "visit_records": [
      {
        "id": 101,
        "customer": {
          "id": 10,
          "name": "山田 一郎",
          "company_name": "株式会社ABC"
        },
        "content": "新製品の提案を実施。先方の反応は良好。",
        "visited_at": "10:00"
      }
    ],
    "problem": "ABC社担当者が来月異動予定。後任担当者への引き継ぎ方法を要検討。",
    "plan": "・ABC社フォローアップ連絡\n・提案書の修正",
    "comments": [
      {
        "id": 5,
        "target_type": "problem",
        "content": "来週の会議で共有してください。",
        "user": {
          "id": 2,
          "name": "田中部長"
        },
        "created_at": "2026-04-01T18:00:00+09:00"
      }
    ],
    "created_at": "2026-04-01T09:00:00+09:00",
    "updated_at": "2026-04-01T18:30:00+09:00"
  }
}
```

**エラー**

| コード | エラーコード | 説明 |
|---|---|---|
| 403 | `FORBIDDEN` | 閲覧権限がない（他営業の日報を salesが参照など） |
| 404 | `NOT_FOUND` | 日報が存在しない |

---

### PUT /reports/:id

日報を更新する。下書き状態のみ更新可能。本人のみ操作可能。

**リクエスト**（変更する項目のみ送信可能）

```json
{
  "visit_records": [
    {
      "id": 101,
      "customer_id": 10,
      "content": "新製品の提案を実施。先方の反応は良好。次回は来月を予定。",
      "visited_at": "10:00"
    },
    {
      "customer_id": 20,
      "content": "飛び込み訪問。担当者不在のため名刺を置いてきた。",
      "visited_at": "16:00"
    }
  ],
  "problem": "更新した課題内容",
  "plan": "更新した計画内容"
}
```

> `visit_records` は差分ではなく全件上書き。`id` を含む行は既存レコードの更新、`id` なしは新規追加。送信されなかった既存行は削除される。

**レスポンス 200**

POST /reports と同一のレスポンス形式。

**エラー**

| コード | エラーコード | 説明 |
|---|---|---|
| 403 | `FORBIDDEN` | 本人以外、または manager/admin のリクエスト |
| 422 | `REPORT_ALREADY_SUBMITTED` | 提出済みの日報は更新不可 |

---

### POST /reports/:id/submit

下書き状態の日報を提出する。本人のみ操作可能。

**リクエストボディ**: なし

**レスポンス 200**

```json
{
  "data": {
    "id": 42,
    "status": "submitted",
    "submitted_at": "2026-04-01T18:30:00+09:00"
  }
}
```

**エラー**

| コード | エラーコード | 説明 |
|---|---|---|
| 403 | `FORBIDDEN` | 本人以外のリクエスト |
| 422 | `REPORT_ALREADY_SUBMITTED` | 既に提出済み |
| 422 | `VISIT_RECORD_REQUIRED` | 訪問記録が0件 |

---

### POST /reports/:id/comments

日報の problem または plan にコメントを投稿する。manager・admin のみ。

**リクエスト**

```json
{
  "target_type": "problem",
  "content": "来週の会議で共有してください。"
}
```

**バリデーション**

| フィールド | ルール |
|---|---|
| target_type | 必須。`problem` または `plan` |
| content | 必須。最大1000文字 |

**レスポンス 201**

```json
{
  "data": {
    "id": 5,
    "report_id": 42,
    "target_type": "problem",
    "content": "来週の会議で共有してください。",
    "user": {
      "id": 2,
      "name": "田中部長"
    },
    "created_at": "2026-04-01T18:00:00+09:00"
  }
}
```

**エラー**

| コード | エラーコード | 説明 |
|---|---|---|
| 403 | `FORBIDDEN` | sales がリクエスト |
| 422 | `REPORT_NOT_SUBMITTED` | 提出前の日報にはコメント不可 |

---

## 顧客マスタ

### GET /customers

顧客一覧を取得する。全ロールが参照可能。

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| q | string | — | 顧客名・会社名の部分一致検索 |
| page | integer | — | ページ番号（デフォルト: 1） |
| per_page | integer | — | 1ページの件数（デフォルト: 50） |

**レスポンス 200**

```json
{
  "data": [
    {
      "id": 10,
      "name": "山田 一郎",
      "company_name": "株式会社ABC",
      "phone": "03-1234-5678",
      "email": "yamada@abc.co.jp",
      "address": "東京都千代田区...",
      "created_at": "2026-01-15T10:00:00+09:00"
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "per_page": 50
  }
}
```

---

### POST /customers

顧客を新規作成する。manager・admin のみ。

**リクエスト**

```json
{
  "name": "佐藤 三郎",
  "company_name": "合同会社DEF",
  "phone": "03-9876-5432",
  "email": "sato@def.co.jp",
  "address": "東京都新宿区..."
}
```

**バリデーション**

| フィールド | ルール |
|---|---|
| name | 必須。最大100文字 |
| company_name | 必須。最大200文字 |
| phone | 数字・ハイフンのみ。最大20文字 |
| email | メール形式。最大255文字 |
| address | 最大500文字 |

**レスポンス 201**

```json
{
  "data": {
    "id": 25,
    "name": "佐藤 三郎",
    "company_name": "合同会社DEF",
    "phone": "03-9876-5432",
    "email": "sato@def.co.jp",
    "address": "東京都新宿区...",
    "created_at": "2026-04-01T10:00:00+09:00"
  }
}
```

---

### GET /customers/:id

顧客詳細を取得する。

**レスポンス 200**

POST レスポンスと同一形式。

---

### PUT /customers/:id

顧客情報を更新する。manager・admin のみ。

**リクエスト**: POST と同一形式（変更する項目のみ送信可能）

**レスポンス 200**

POST レスポンスと同一形式。

---

## ユーザーマスタ

### GET /users

ユーザー一覧を取得する。admin のみ。

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| role | string | — | `sales` / `manager` / `admin` |
| department_id | integer | — | 部署ID |
| page | integer | — | ページ番号（デフォルト: 1） |
| per_page | integer | — | 1ページの件数（デフォルト: 50） |

**レスポンス 200**

```json
{
  "data": [
    {
      "id": 1,
      "name": "山田太郎",
      "email": "yamada@example.com",
      "role": "sales",
      "department": {
        "id": 1,
        "name": "東京営業部"
      },
      "created_at": "2026-01-01T00:00:00+09:00"
    }
  ],
  "meta": {
    "total": 30,
    "page": 1,
    "per_page": 50
  }
}
```

---

### POST /users

ユーザーを新規作成する。admin のみ。

**リクエスト**

```json
{
  "name": "鈴木花子",
  "email": "suzuki@example.com",
  "password": "password123",
  "role": "sales",
  "department_id": 1
}
```

**バリデーション**

| フィールド | ルール |
|---|---|
| name | 必須。最大100文字 |
| email | 必須。メール形式。重複不可 |
| password | 必須。8文字以上 |
| role | 必須。`sales` / `manager` / `admin` |
| department_id | 必須。存在する部署IDであること |

**レスポンス 201**

```json
{
  "data": {
    "id": 31,
    "name": "鈴木花子",
    "email": "suzuki@example.com",
    "role": "sales",
    "department": {
      "id": 1,
      "name": "東京営業部"
    },
    "created_at": "2026-04-01T10:00:00+09:00"
  }
}
```

**エラー**

| コード | エラーコード | 説明 |
|---|---|---|
| 400 | `EMAIL_ALREADY_EXISTS` | メールアドレスが重複 |

---

### GET /users/:id

ユーザー詳細を取得する。admin のみ。

**レスポンス 200**

POST レスポンスと同一形式。

---

### PUT /users/:id

ユーザー情報を更新する。admin のみ。パスワードは省略可能（省略時は変更しない）。

**リクエスト**

```json
{
  "name": "鈴木花子",
  "email": "suzuki-new@example.com",
  "password": "newpassword456",
  "role": "manager",
  "department_id": 2
}
```

**レスポンス 200**

POST レスポンスと同一形式。

---

## エラーコード一覧

| エラーコード | HTTPステータス | 説明 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 入力バリデーションエラー |
| `INVALID_CREDENTIALS` | 401 | 認証情報が不正 |
| `UNAUTHORIZED` | 401 | 未認証（トークンなし・期限切れ） |
| `FORBIDDEN` | 403 | 操作権限なし |
| `NOT_FOUND` | 404 | リソースが存在しない |
| `EMAIL_ALREADY_EXISTS` | 400 | メールアドレスの重複 |
| `REPORT_ALREADY_EXISTS` | 422 | 同日の日報が既に存在する |
| `REPORT_ALREADY_SUBMITTED` | 422 | 提出済みのため操作不可 |
| `REPORT_NOT_SUBMITTED` | 422 | 提出前のためコメント不可 |
| `VISIT_RECORD_REQUIRED` | 422 | 訪問記録が必要 |
| `INTERNAL_SERVER_ERROR` | 500 | サーバー内部エラー |
