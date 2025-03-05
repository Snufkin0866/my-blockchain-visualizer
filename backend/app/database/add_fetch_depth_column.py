from sqlalchemy import create_engine, Column, Integer, MetaData, Table
from sqlalchemy.ext.declarative import declarative_base
import sys
import os

# 親ディレクトリをパスに追加して、appモジュールをインポートできるようにする
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.database import SQLALCHEMY_DATABASE_URL

def add_fetch_depth_column():
    """
    既存のtransactionsテーブルにfetch_depth列を追加するマイグレーションスクリプト
    """
    print("データベースに接続中...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # メタデータを取得
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    # transactionsテーブルを取得
    transactions = metadata.tables['transactions']
    
    # fetch_depth列が存在するか確認
    if 'fetch_depth' not in transactions.columns:
        print("fetch_depth列を追加中...")
        # 列を追加するSQL文を実行
        engine.execute('ALTER TABLE transactions ADD COLUMN fetch_depth INTEGER')
        print("fetch_depth列が正常に追加されました")
    else:
        print("fetch_depth列は既に存在します")
    
    print("マイグレーション完了")

if __name__ == "__main__":
    add_fetch_depth_column()
