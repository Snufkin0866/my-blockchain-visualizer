import requests
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from fastapi import HTTPException


class BlockchainApiClient(ABC):
    """
    ブロックチェーンAPIクライアントの基底クラス
    """
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
    
    @abstractmethod
    def get_transactions(self, address: str, **kwargs) -> List[Dict[str, Any]]:
        """指定されたアドレスのトランザクションを取得"""
        pass
    
    def _make_request(self, endpoint: str = "", params: Optional[Dict[str, Any]] = None, 
                     headers: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        APIリクエストを実行し、レスポンスを返す共通メソッド
        """
        try:
            url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
            print(f"Requesting: {url}, params: {params}")
            
            response = requests.get(url, params=params, headers=headers)
            print(f"Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Error response: {response.text}")
                
            response.raise_for_status()
            return response.json()
        
        except requests.RequestException as e:
            error_msg = f"API request error: {str(e)}"
            print(f"API ERROR: {error_msg}")
            print(f"Exception details: {type(e).__name__}")
            
            if hasattr(e, "response") and e.response:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")
            
            raise HTTPException(status_code=503, detail=error_msg)