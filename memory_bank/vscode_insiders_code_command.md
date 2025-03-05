# ターミナルの`code`コマンドをVS Code Insidersの起動に変更する方法

## 概要
ターミナルで`code`コマンドを実行した際に、通常のVS Codeではなく、VS Code Insidersが起動するように設定を変更する方法です。

## 前提条件
- macOS
- VS Code Insidersがインストール済み（`/Applications/Visual Studio Code - Insiders.app`）
- zshシェルを使用

## 実施した手順

### 1. 現在の設定を確認
```bash
# codeコマンドの場所を確認
which code
# 出力: /usr/local/bin/code

# VS Code Insidersのバイナリを確認
ls -la "/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/"
# 出力に「code」ファイルがあることを確認
```

### 2. .zshrcファイルにエイリアスを追加
```bash
# .zshrcファイルを編集
echo '# VS Code Insidersをcodeコマンドで起動するためのエイリアス
alias code='"'"'/Applications/Visual\ Studio\ Code\ -\ Insiders.app/Contents/Resources/app/bin/code'"'" >> ~/.zshrc
```

または、テキストエディタで`~/.zshrc`ファイルを開き、以下の行を追加：
```bash
# VS Code Insidersをcodeコマンドで起動するためのエイリアス
alias code='/Applications/Visual\ Studio\ Code\ -\ Insiders.app/Contents/Resources/app/bin/code'
```

### 3. 設定を反映
```bash
# .zshrcファイルを再読み込み
source ~/.zshrc
```

### 4. 設定の確認
```bash
# codeコマンドのバージョンを確認
code --version
# 出力例: 1.98.0-insider（VS Code Insidersのバージョン）
```

## 元に戻す方法
`.zshrc`ファイルから追加したエイリアス行を削除し、ターミナルを再起動するか、`source ~/.zshrc`コマンドを実行してください。

## 代替方法

### 方法1: シンボリックリンクを変更する
現在の`code`コマンドがシンボリックリンクとして設定されている場合、そのリンクをVS Code Insidersに向け直す方法もあります。

```bash
# バックアップを作成
sudo mv /usr/local/bin/code /usr/local/bin/code.bak

# 新しいシンボリックリンクを作成
sudo ln -s "/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code" /usr/local/bin/code
```

### 方法2: VS Code Insidersから新しいコマンドをインストールする
VS Code Insidersのコマンドパレットから「Shell Command: Install 'code' command in PATH」を実行して、既存の`code`コマンドを上書きする方法もあります。
