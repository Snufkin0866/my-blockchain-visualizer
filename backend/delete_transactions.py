from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.blockchain.ethereum import EthereumService
from app.config import DATABASE_URL

# データベース接続の設定
db_engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)

def main():
    # データベースセッションの作成
    db = SessionLocal()
    ethereum_service = EthereumService()
    # トランザクションの削除
    ethereum_service.delete_all_transactions(db)
    db.close()

if __name__ == "__main__":
    main()