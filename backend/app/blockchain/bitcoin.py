from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import re
from fastapi import HTTPException

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
        
    def validate_bitcoin_address(self, address: str) -> bool:
        """
        Bitcoinアドレスの基本的な検証を行う
        """
        # Legacy addressフォーマット (P2PKH): 1で始まる
        p2pkh_pattern = r'^1[a-km-zA-HJ-NP-Z1-9]{25,34}$'
        
        # P2SH addressフォーマット: 3で始まる
        p2sh_pattern = r'^3[a-km-zA-HJ-NP-Z1-9]{25,34}$'
        
        # Bech32 addressフォーマット (SegWit): bc1で始まる
        bech32_pattern = r'^bc1[a-zA-HJ-NP-Z0-9]{25,90}$'
        
        # いずれかのパターンに一致するか確認
        return (re.match(p2pkh_pattern, address) is not None or
                re.match(p2sh_pattern, address) is not None or
                re.match(bech32_pattern, address) is not None)
    
    def get_transactions(self, address: str, start_datetime: Optional[datetime] = None,
                        end_datetime: Optional[datetime] = None, db: Session = None,
                        depth: Optional[int] = None) -> List[TransactionSchema]:
        """
        Bitcoinトランザクションの取得と処理
        """
        # アドレスの検証
        if not self.validate_bitcoin_address(address):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid Bitcoin address format: {address}"
            )
            
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
                print(f"Using cached transactions for address: {address} with depth: {depth}")
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
            db_transactions = self.save_transactions_to_db(raw_transactions, db, depth)
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
