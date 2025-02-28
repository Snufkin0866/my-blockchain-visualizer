from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    blockchain = Column(String, index=True)
    # txidは被る可能性あり。なぜかと言うと、UTXOだと同じtxで、transaction inputとoutputがあるため。
    txid = Column(String, index=True)
    from_address = Column(String, index=True)
    to_address = Column(String, index=True)
    value = Column(Float)
    timestamp = Column(DateTime, index=True)
    block_number = Column(Integer)
