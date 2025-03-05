# Etherscan API の制約と注意点

## API キーに関する制約

1. **APIキーの有効性**
   - 無効なAPIキー（期限切れ、取り消し、または間違ったキー）を使用すると「NOTOK」エラーが発生します
   - APIキーは [Etherscanのウェブサイト](https://etherscan.io/myapikey) で取得・管理できます

2. **リクエスト制限**
   - 無料のEtherscan APIキーには1日あたり100,000リクエストの制限があります
   - この制限を超えると「NOTOK」エラーが返されます
   - 頻繁にAPIを呼び出す場合は、この制限に注意が必要です

3. **アクセス権限**
   - 特定のAPIエンドポイントにアクセスする権限がキーにない場合も「NOTOK」エラーが発生します
   - 無料APIキーでは一部の高度な機能にアクセスできない場合があります

## エラー対処方法

「NOTOK」エラーが発生した場合の対処法：

1. [Etherscanのウェブサイト](https://etherscan.io/myapikey)で新しいAPIキーを取得する
2. .envファイルの`ETHERSCAN_API_KEY`の値を新しいキーに更新する
3. アプリケーションを再起動する（`docker-compose down`と`docker-compose up`を実行）

## 現在のプロジェクト設定

- APIキーは`.env`ファイルで設定されています
- docker-compose.ymlファイルを通じてバックエンドコンテナに環境変数として渡されます
- `backend/app/config.py`でAPIキーを読み込み、`backend/app/blockchain/ethereum.py`でEtherscanClientの初期化に使用されます
