from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Transaction(BaseModel):
    blockchain: str
    txid: str
    from_address: str
    to_address: str
    value: float
    timestamp: datetime
    block_number: int
    # スマートコントラクト関連のフィールド
    is_contract_interaction: bool = False
    contract_address: Optional[str] = None
    contract_method: Optional[str] = None
    contract_input_data: Optional[str] = None

    class Config:
        orm_mode = True


class NetworkNode(BaseModel):
    id: str
    label: str
    type: str  # "source", "address"


class NetworkLink(BaseModel):
    id: str
    source: str
    target: str
    value: float
    timestamp: datetime


class TransactionNetwork(BaseModel):
    nodes: List[NetworkNode]
    links: List[NetworkLink]
