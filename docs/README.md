# ブロックチェーン可視化ツール - ドキュメント

このディレクトリには、ブロックチェーン可視化ツールに関するドキュメントが含まれています。

## ドキュメント一覧

- [リポジトリ構造](repository_structure.md) - プロジェクトのディレクトリ構造と主要コンポーネントの説明
- [Etherscan API の制約と注意点](etherscan_api_constraints.md) - Etherscan APIの使用に関する制約と設定方法
- [VS Code Insidersの設定](vscode_insiders_code_command.md) - VS Code Insidersをcodeコマンドで起動するための設定方法
- [日本語レスポンス](japanese_response.md) - 日本語での応答に関する情報

## プロジェクト構成

このプロジェクトは以下の主要コンポーネントで構成されています：

1. **バックエンド** (`/backend`) - Python FastAPIを使用したバックエンドサーバー
   - ブロックチェーンAPI（BlockcypherとEtherscan）との連携
   - ビットコインとイーサリアムのブロックチェーンデータ処理
   - データベース操作とモデル定義

2. **フロントエンド** (`/frontend`) - Reactベースのフロントエンドアプリケーション
   - ネットワークグラフ可視化コンポーネント
   - トランザクション検索と表示機能
   - ダッシュボードとネットワーク可視化ページ

3. **ノートブック** (`/notebooks`) - Jupyter notebookによるAPI検証と実験

4. **ドキュメント** (`/docs`) - プロジェクトに関するドキュメントと参考資料
