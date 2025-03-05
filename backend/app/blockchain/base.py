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
                         end_datetime: Optional[datetime] = None, db: Session = None, 
                         depth: Optional[int] = None) -> List[TransactionSchema]:
        """
        指定されたアドレスのトランザクションを取得
        
        Parameters:
        - address: 取得対象のアドレス
        - start_datetime: 開始日時
        - end_datetime: 終了日時
        - db: データベースセッション
        - depth: ネットワーク探索の深さ（キャッシュ判断に使用）
        """
        pass
    
    def get_cached_transactions(self, address: str, start_datetime: Optional[datetime] = None,
                               end_datetime: Optional[datetime] = None, db: Session = None,
                               depth: Optional[int] = None) -> List[Transaction]:
        """
        データベースから既存のトランザクションを取得
        
        Parameters:
        - address: 取得対象のアドレス
        - start_datetime: 開始日時
        - end_datetime: 終了日時
        - db: データベースセッション
        - depth: ネットワーク探索の深さ（キャッシュ判断に使用）
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
            
        # 探索深度が指定されている場合、その深度以上のトランザクションのみを返す
        if depth is not None:
            query = query.filter(
                (Transaction.fetch_depth >= depth) | (Transaction.fetch_depth.is_(None))
            )
            
        return query.all()
    
    def save_transactions_to_db(self, transactions: List[Dict[str, Any]], db: Session, depth: Optional[int] = None) -> List[Transaction]:
        """
        トランザクションをデータベースに保存
        
        注意：
        - Bitcoinなどの場合、同じtxidが複数の送金先（to_address）を持つことがある（UTXOモデル）
        - 同じtxidでも、送金元、送金先、金額が異なる場合は別のトランザクションとして扱う
        - 完全に同一のトランザクション（txid, value, from_address, to_addressが全て同じ）は重複として扱われる
        - 探索深度（depth）が異なる場合は、既存のトランザクションを更新する
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
            
            # 既存のトランザクションが見つかった場合
            if db_tx:
                # 探索深度が指定されており、既存のトランザクションの深度と異なる場合は更新
                if depth is not None and (db_tx.fetch_depth is None or db_tx.fetch_depth < depth):
                    print(f"Updating transaction depth: {tx['txid']} (from: {tx['from_address']}, to: {tx['to_address']}, value: {tx['value']}) - depth: {db_tx.fetch_depth} -> {depth}")
                    db_tx.fetch_depth = depth
                    db_transactions.append(db_tx)
                else:
                    print(f"Skip duplicate transaction: {tx['txid']} (from: {tx['from_address']}, to: {tx['to_address']}, value: {tx['value']})")
                continue
            
            # 新しいトランザクションを追加
            print(f"Add new transaction: {tx['txid']} (from: {tx['from_address']}, to: {tx['to_address']}, value: {tx['value']}, depth: {depth})")
            db_tx = Transaction(
                blockchain=tx["blockchain"],
                txid=tx["txid"],
                from_address=tx["from_address"],
                to_address=tx["to_address"],
                value=tx["value"],
                timestamp=tx["timestamp"],
                block_number=tx["block_number"],
                fetch_depth=depth,
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
                fetch_depth=tx.fetch_depth,
            )
            for tx in transactions
        ]
