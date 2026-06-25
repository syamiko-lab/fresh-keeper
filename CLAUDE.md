# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Fresh Keeper** — 冷蔵庫の食材と賞味期限を管理するWebアプリ。食材を買ったまま忘れて腐らせることを防ぐ。

課題提出用のため Vercel で公開。ユーザーごとに独立したデータを持つ認証あり構成。

## コマンド

```bash
npm run dev      # ローカル開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run lint     # ESLint 実行
```

## 技術スタック

- **Next.js 16 (App Router)** + TypeScript
- **Tailwind CSS v4** — スマホ対応レスポンシブUI
- **Supabase** — 認証 + PostgreSQL データベース
- **Vercel** — デプロイ先

## アーキテクチャ

### 認証フロー
Supabase Auth を使用。`@supabase/ssr` でサーバーサイドのセッション管理を行う。
- `src/lib/supabase/client.ts` — ブラウザ用クライアント
- `src/lib/supabase/server.ts` — サーバーコンポーネント用クライアント
- `src/middleware.ts` — 未ログイン時に `/login` へリダイレクト

### データベース構造

**`food_items`** — ユーザーの冷蔵庫の中身
- `user_id` (FK) / `name` / `expiry_date` / `quantity` / `memo`

**`master_foods`** — 食材ごとのデフォルト賞味期限
- `user_id = null` → 全ユーザー共通のプリセットデータ
- `user_id = 値あり` → そのユーザーの独自カスタマイズ
- `default_days` — 購入日からの日数

両テーブルに Row Level Security (RLS) を設定済み。ユーザーは自分のデータのみ操作可能。`master_foods` の共通データ（`user_id = null`）は全員が読み取り可能。

### 画面構成

| パス | 内容 |
|------|------|
| `/` | ダッシュボード（冷蔵庫一覧・期限警告） |
| `/add` | 食材追加（手動入力） |
| `/master` | マスターDB編集 |
| `/login` | ログイン |
| `/signup` | 新規登録 |

### 期限警告の色分け

- 赤：期限切れ（当日含む）
- 黄：3日以内
- 緑：4日以上

## 環境変数

`.env.local`（Git管理外）に以下が必要：

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Git 運用ルール

コードを変更するたびに以下の手順を必ず実行する：

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

- コミットメッセージは日本語でも英語でも可
- 機能単位でコミットする（まとめてドカッと1回ではなく）
- プッシュまで完了して初めて「作業完了」とする

## 将来追加予定の機能（現在未実装）

- レシート写真からの食材自動読み取り（Claude API による OCR）
