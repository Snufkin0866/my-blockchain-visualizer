# ブロックチェーン取引可視化ツール

ビットコインとイーサリアムの取引を可視化し、アドレス間の送金フローを分析するためのツールです。

## 機能

- **トランザクション検索**: ウォレットアドレスを指定して、取引履歴を取得
- **ネットワーク可視化**: アドレス間の取引関係をグラフとして可視化
- **時系列分析**: 期間を指定して、取引の変化を分析

## 技術スタック

### バックエンド
- Python 3.9+
- FastAPI
- SQLAlchemy
- BlockCypher API
- Etherscan API

### フロントエンド
- React
- Material UI
- D3.js (ネットワーク可視化)

## セットアップ方法

### 前提条件
- Docker と Docker Compose がインストールされていること
- BlockCypher と Etherscan の API キー（無料で取得可能）

### 環境変数の設定

1. プロジェクトのルートに `.env` ファイルを作成:

```bash
cp .env.example .env
```

2. `.env` ファイルを編集して、API キーとデータベース設定を設定:

```
# API Keys
BLOCKCYPHER_API_KEY=your_blockcypher_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Database settings (必要に応じて変更)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=blockchain
```

### アプリケーションの起動

Docker Compose を使用して、バックエンドとフロントエンドを同時に起動:

```bash
docker-compose up -d
```

ブラウザで http://localhost:3000 にアクセスしてアプリケーションを使用できます。

## API エンドポイント

- `GET /transactions/{blockchain}/{address}`: 指定したアドレスの取引履歴を取得
- `GET /network/{blockchain}/{address}`: 指定したアドレスを中心としたネットワークグラフを取得

クエリパラメータ:
- `start_date`: 開始日 (ISO形式: YYYY-MM-DD)
- `end_date`: 終了日 (ISO形式: YYYY-MM-DD)
- `depth`: ネットワーク探索の深さ (1-3)

## 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

MIT License

## 注意事項

- API キーなどの機密情報は `.env` ファイルで管理し、GitHubにコミットしないでください
- `.gitignore` ファイルに `.env` が含まれていることを確認してください
- 実運用環境では、CORS 設定や API レートリミットなどのセキュリティ対策を適切に行ってください