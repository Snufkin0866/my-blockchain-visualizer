from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import HTTPException
import logging

from .base import BlockchainApiClient

logger = logging.getLogger(__name__)

class EtherscanClient(BlockchainApiClient):
    """
    Etherscan APIクライアントの実装
    """
    
    def get_transactions(self, address: str, start_datetime: Optional[datetime] = None,
                        end_datetime: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        EthereumのトランザクションをEtherscan APIから取得
        """
        # APIキーが必要
        if not self.api_key:
            raise HTTPException(status_code=400, detail="Etherscan API key is required")
            
        # 通常のトランザクションパラメータ設定
        params = {
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "sort": "asc",
            "apikey": self.api_key,
        }
        
        # APIリクエスト実行
        logger.info(f"Requesting Etherscan API for address: {address} with params: {params}")
        data = self._make_request("", params)
        logger.info(f"Etherscan API response: {data}")
        
        # APIのレスポンスを検証
        if data.get("status") != "1":
            raise HTTPException(
                status_code=400, 
                detail=f"Etherscan API error: {data.get('message')}"
            )
            
        # トランザクション処理
        transactions = []
        for tx in data.get("result", []):
            # 日付フィルタリング
            tx_time = datetime.fromtimestamp(int(tx.get("timeStamp", 0)))
            if (start_datetime and tx_time < start_datetime) or (
                end_datetime and tx_time > end_datetime
            ):
                continue
                
            # 自分宛か送信かを判断
            is_incoming = address.lower() == tx.get("to", "").lower()
            is_outgoing = address.lower() == tx.get("from", "").lower()
            
            if is_incoming or is_outgoing:
                transactions.append({
                    "blockchain": "ethereum",
                    "txid": tx.get("hash"),
                    "from_address": tx.get("from"),
                    "to_address": tx.get("to"),
                    "value": float(tx.get("value", 0)) / 1e18,  # wei to ETH
                    "timestamp": tx_time,
                    "block_number": int(tx.get("blockNumber", 0)),
                })
        
        logger.info(f"Processed {len(transactions)} transactions for address: {address}")
        return transactions