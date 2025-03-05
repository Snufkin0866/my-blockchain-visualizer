from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from ..api.blockcypher import BlockCypherClient
from ..schemas import Transaction as TransactionSchema
from .base import BlockchainService
from ..config import BLOCKCYPHER_BASE_URL, BLOCKCYPHER_API_KEY
from ..database.models import Transaction


class BitcoinService(BlockchainService):
    """
    Bitcoinブロックチェーン用のサービス実装
    """
    def __init__(self):
        super().__init__("bitcoin")
        # 設定ファイルからAPIのURLとAPIキーを取得
        self.client = BlockCypherClient(BLOCKCYPHER_BASE_URL, BLOCKCYPHER_API_KEY)
    
    def get_transactions(self, address: str, start_datetime: Optional[datetime] = None,
                        end_datetime: Optional[datetime] = None, db: Session = None) -> List[TransactionSchema]:
        """
        Bitcoinトランザクションの取得と処理
        """
        # データベースからキャッシュされたトランザクションを取得
        cached_transactions = []
        if db:
            cached_transactions = self.get_cached_transactions(
                address=address,
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                db=db
            )
            
            # キャッシュデータが存在する場合は、それをそのまま返す
            if cached_transactions:
                print(f"Using cached transactions for address: {address}")
                return self.format_transactions(cached_transactions)
        
        # キャッシュがない場合はAPIからトランザクションを取得
        print(f"Fetching transactions from API for address: {address}")
        raw_transactions = self.client.get_transactions(
            address=address,
            start_datetime=start_datetime,
            end_datetime=end_datetime
        )
        
        # データベースに保存
        if db:
            db_transactions = self.save_transactions_to_db(raw_transactions, db)
            # データベースから取得したトランザクションをスキーマに変換して返す
            return self.format_transactions(db_transactions)
        
        # データベースを使用しない場合は直接スキーマに変換
        return [
            TransactionSchema(
                blockchain=tx["blockchain"],
                txid=tx["txid"],
                from_address=tx["from_address"],
                to_address=tx["to_address"],
                value=tx["value"],
                timestamp=tx["timestamp"],
                block_number=tx["block_number"]
            )
            for tx in raw_transactions
        ]