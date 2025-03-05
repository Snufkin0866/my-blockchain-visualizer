from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import HTTPException
import logging
import json

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
                # スマートコントラクトの情報を取得
                contract_info = self._get_contract_info(tx)
                
                transaction = {
                    "blockchain": "ethereum",
                    "txid": tx.get("hash"),
                    "from_address": tx.get("from"),
                    "to_address": tx.get("to"),
                    "value": float(tx.get("value", 0)) / 1e18,  # wei to ETH
                    "timestamp": tx_time,
                    "block_number": int(tx.get("blockNumber", 0)),
                    **contract_info
                }
                
                transactions.append(transaction)
        
        logger.info(f"Processed {len(transactions)} transactions for address: {address}")
        return transactions
        
    def _get_contract_info(self, tx: Dict[str, Any]) -> Dict[str, Any]:
        """
        トランザクションからスマートコントラクトの情報を抽出
        """
        # 入力データが空でない場合、スマートコントラクトとの相互作用とみなす
        input_data = tx.get("input", "")
        if not input_data or input_data == "0x":
            return {
                "is_contract_interaction": False,
                "contract_address": None,
                "contract_method": None,
                "contract_input_data": None
            }
            
        # スマートコントラクトアドレスを取得
        contract_address = tx.get("to")
        if not contract_address:
            return {
                "is_contract_interaction": False,
                "contract_address": None,
                "contract_method": None,
                "contract_input_data": None
            }
            
        # メソッドシグネチャを取得（最初の4バイト）
        method_signature = input_data[:10] if len(input_data) >= 10 else None
        
        return {
            "is_contract_interaction": True,
            "contract_address": contract_address,
            "contract_method": method_signature,
            "contract_input_data": input_data
        }