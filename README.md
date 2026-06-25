# 🥦 Fresh Keeper

冷蔵庫の食材と賞味期限を管理するWebアプリです。
食材を買ったまま忘れて腐らせてしまうことを防ぐために作りました。

## 機能

- **食材の登録・削除** — 食材名・賞味期限・数量・メモを管理
- **期限警告の色分け表示** — 期限切れ（赤）・3日以内（黄）・余裕あり（緑）
- **マスターDB** — 生鮮食品のデフォルト保存期間を登録し、食材追加時に自動入力
- **ユーザー認証** — アカウントごとに独立したデータを管理
- **スマホ対応** — レスポンシブデザインでスマホからも使いやすい

## 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js 16 (App Router) + TypeScript |
| スタイル | Tailwind CSS v4 |
| 認証 + DB | Supabase |
| デプロイ | Vercel |

## ローカル環境でのセットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/syamiko-lab/fresh-keeper.git
cd fresh-keeper
npm install
```

### 2. 環境変数を設定

`.env.local` ファイルをプロジェクトルートに作成し、以下を記入：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabaseのプロジェクトは [supabase.com](https://supabase.com) で作成できます。

### 3. データベースのセットアップ

Supabase の SQL Editor で [こちらのSQL](docs/schema.sql) を実行してテーブルを作成してください。

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと確認できます。

## 画面構成

| パス | 内容 |
|------|------|
| `/login` | ログイン |
| `/signup` | 新規登録 |
| `/` | ダッシュボード（冷蔵庫一覧） |
| `/add` | 食材追加 |
| `/master` | マスターDB編集 |

## 今後追加予定の機能

- レシート写真から食材名を自動読み取り（Claude API）

## ライセンス

MIT
