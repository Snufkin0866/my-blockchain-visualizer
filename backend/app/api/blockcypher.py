from typing import Dict, Any, List, Optional
from datetime import datetime
from dateutil import parser

from .base import BlockchainApiClient


class BlockCypherClient(BlockchainApiClient):
    """
    BlockCypherのAPIクライアント実装
    """
    
    def get_transactions(self, address: str, start_datetime: Optional[datetime] = None, 
                        end_datetime: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        BitcoinのトランザクションをBlockCypher APIから取得
        """
        endpoint = f"addrs/{address}/full"
        data = self._make_request(endpoint)
        
        transactions = []
        for tx in data.get("txs", []):
            # 日付処理
            received_time = tx.get("received")
            tx_time = self._parse_datetime(received_time)
            
            # 日付フィルタリング
            if (start_datetime and tx_time < start_datetime) or (
                end_datetime and tx_time > end_datetime
            ):
                print("skip tx_time: ", tx_time)
                continue
                
            # Bitcoin's UTXOモデルを解析
            inputs = tx.get("inputs", [])
            outputs = tx.get("outputs", [])
            tx_hash = tx.get("hash")
            block_height = tx.get("block_height")
            
            # ウォレットアドレスが関連するトランザクションかを確認
            tx_addresses = tx.get("addresses", [])
            if address not in tx_addresses:
                continue
                
            # アドレスが入金を受けた場合と送金した場合の両方を処理
            self._process_received_transactions(
                transactions, address, inputs, outputs, tx_hash, block_height, tx_time
            )
            self._process_sent_transactions(
                transactions, address, inputs, outputs, tx_hash, block_height, tx_time
            )
            
        return transactions
        
    def _parse_datetime(self, datetime_str: str) -> datetime:
        """
        BlockCypherのタイムスタンプをdatetimeオブジェクトに変換
        """
        try:
            # ミリ秒部分がある場合
            return datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        except ValueError:
            try:
                # ミリ秒部分がない場合
                return datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                # どちらでも解析できない場合はdateutil.parserを使用
                parsed_time = parser.parse(datetime_str)
                # タイムゾーン情報を削除して比較可能にする
                return parsed_time.replace(tzinfo=None)
                
    def _process_received_transactions(self, transactions: List, address: str, 
                                      inputs: List, outputs: List, 
                                      tx_hash: str, block_height: int, 
                                      tx_time: datetime) -> None:
        """
        入金トランザクション（このアドレスがoutputsに含まれている）を処理
        """
        received_outputs = [
            output for output in outputs if address in output.get("addresses", [])
        ]
        
        if received_outputs:
            for output in received_outputs:
                # 送信元アドレスを特定（最初のinputアドレスを使用）
                from_addresses = []
                for input_tx in inputs:
                    input_addresses = input_tx.get("addresses", [])
                    if input_addresses and input_addresses[0] != address:
                        from_addresses.extend(input_addresses)
                
                from_address = from_addresses[0] if from_addresses else "Unknown"
                value = output.get("value", 0)
                
                transactions.append({
                    "blockchain": "bitcoin",
                    "txid": tx_hash,
                    "from_address": from_address,
                    "to_address": address,
                    "value": value / 100000000,  # satoshi to BTC
                    "timestamp": tx_time,
                    "block_number": block_height,
                })
    
    def _process_sent_transactions(self, transactions: List, address: str, 
                                  inputs: List, outputs: List, 
                                  tx_hash: str, block_height: int, 
                                  tx_time: datetime) -> None:
        """
        送金トランザクション（このアドレスがinputsに含まれている）を処理
        """
        sent_inputs = [
            input_tx for input_tx in inputs if address in input_tx.get("addresses", [])
        ]
        
        if sent_inputs:
            # 自分以外のアドレス宛のoutputを見つける
            external_outputs = [
                output for output in outputs if address not in output.get("addresses", [])
            ]
            
            for output in external_outputs:
                to_addresses = output.get("addresses", [])
                if not to_addresses:
                    continue
                    
                value = output.get("value", 0)
                
                transactions.append({
                    "blockchain": "bitcoin",
                    "txid": tx_hash,
                    "from_address": address,
                    "to_address": to_addresses[0],  # 送信先アドレス
                    "value": value / 100000000,  # satoshi to BTC
                    "timestamp": tx_time,
                    "block_number": block_height,
                })