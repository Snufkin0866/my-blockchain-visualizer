import logging
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from ..api.etherscan import EtherscanClient
from ..schemas import Transaction as TransactionSchema
from .base import BlockchainService
from ..config import ETHERSCAN_BASE_URL, ETHERSCAN_API_KEY
from ..database.models import Transaction

logger = logging.getLogger(__name__)

class EthereumService(BlockchainService):
    """
    Ethereumブロックチェーン用のサービス実装
    """
    def __init__(self):
        super().__init__("ethereum")
        # 設定ファイルからAPIのURLとAPIキーを取得
        self.client = EtherscanClient(ETHERSCAN_BASE_URL, ETHERSCAN_API_KEY)
    
    def get_transactions(self, address: str, start_datetime: Optional[datetime] = None,
                        end_datetime: Optional[datetime] = None, db: Session = None,
                        depth: Optional[int] = None) -> List[TransactionSchema]:
        """
        Ethereumトランザクションの取得と処理
        """
        logger.info(f"Fetching transactions for address: {address}, start_datetime: {start_datetime}, end_datetime: {end_datetime}, depth: {depth}")
        # データベースからキャッシュされたトランザクションを取得
        cached_transactions = []
        if db:
            cached_transactions = self.get_cached_transactions(
                address=address,
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                db=db,
                depth=depth
            )
            
            # キャッシュデータが存在する場合は、それをそのまま返す
            if cached_transactions:
                logger.info(f"Using cached transactions for address: {address} with depth: {depth}")
                return self.format_transactions(cached_transactions)
                
        # キャッシュがない場合はAPIからトランザクションを取得
        raw_transactions = self.client.get_transactions(
            address=address,
            start_datetime=start_datetime,
            end_datetime=end_datetime
        )
        logger.info(f"Fetched {len(raw_transactions)} raw transactions from API for address: {address}")
        
        # データベースに保存
        if db:
            db_transactions = self.save_transactions_to_db(raw_transactions, db, depth)
            logger.info(f"Saved {len(db_transactions)} transactions to database for address: {address} with depth: {depth}")
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
