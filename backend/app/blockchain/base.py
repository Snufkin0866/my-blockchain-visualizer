from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..database.models import Transaction
from ..schemas import Transaction as TransactionSchema


class BlockchainService(ABC):
    """
    ブロックチェーン処理の基底クラス
    """
    def __init__(self, blockchain_name: str):
        self.blockchain_name = blockchain_name
    
    @abstractmethod
    def get_transactions(self, address: str, start_datetime: Optional[datetime] = None,
                         end_datetime: Optional[datetime] = None, db: Session = None) -> List[TransactionSchema]:
        """
        指定されたアドレスのトランザクションを取得
        """
        pass
    
    def get_cached_transactions(self, address: str, start_datetime: Optional[datetime] = None,
                               end_datetime: Optional[datetime] = None, db: Session = None) -> List[Transaction]:
        """
        データベースから既存のトランザクションを取得
        """
        if not db:
            return []
            
        query = db.query(Transaction).filter(
            and_(
                Transaction.blockchain == self.blockchain_name,
                (Transaction.from_address == address) | (Transaction.to_address == address)
            )
        )
        
        if start_datetime:
            query = query.filter(Transaction.timestamp >= start_datetime)
        if end_datetime:
            query = query.filter(Transaction.timestamp <= end_datetime)
            
        return query.all()
    
    def save_transactions_to_db(self, transactions: List[Dict[str, Any]], db: Session) -> List[Transaction]:
        """
        トランザクションをデータベースに保存
        
        注意：
        - Bitcoinなどの場合、同じtxidが複数の送金先（to_address）を持つことがある（UTXOモデル）
        - 同じtxidでも、送金元、送金先、金額が異なる場合は別のトランザクションとして扱う
        - 完全に同一のトランザクション（txid, value, from_address, to_addressが全て同じ）は重複として扱われる
        """
        db_transactions = []
        
        for tx in transactions:
            # 重複チェック：同一のtxid, value, from_address, to_addressの組み合わせが既に存在するか確認
            db_tx = (
                db.query(Transaction)
                .filter(
                    Transaction.txid == tx["txid"],
                    Transaction.value == tx["value"],
                    Transaction.from_address == tx["from_address"],
                    Transaction.to_address == tx["to_address"],
                )
                .first()
            )
            if db_tx:
                print(f"Skip duplicate transaction: {tx['txid']} (from: {tx['from_address']}, to: {tx['to_address']}, value: {tx['value']})")
                continue
            
            # 新しいトランザクションを追加
            print(f"Add new transaction: {tx['txid']} (from: {tx['from_address']}, to: {tx['to_address']}, value: {tx['value']})")
            db_tx = Transaction(
                blockchain=tx["blockchain"],
                txid=tx["txid"],
                from_address=tx["from_address"],
                to_address=tx["to_address"],
                value=tx["value"],
                timestamp=tx["timestamp"],
                block_number=tx["block_number"],
            )
            db.add(db_tx)
            db_transactions.append(db_tx)
        
        if db_transactions:
            db.commit()
            
        return db_transactions
    
    def format_transactions(self, transactions: List[Transaction]) -> List[TransactionSchema]:
        """
        データベースモデルからスキーマへ変換
        """
        return [
            TransactionSchema(
                blockchain=tx.blockchain,
                txid=tx.txid,
                from_address=tx.from_address,
                to_address=tx.to_address,
                value=tx.value,
                timestamp=tx.timestamp,
                block_number=tx.block_number,
            )
            for tx in transactions
        ]