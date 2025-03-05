from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from dateutil import parser
import logging

from app.database import models, database
from app import schemas
from app.blockchain import BitcoinService, EthereumService
from app.config import CORS_ORIGINS, DEBUG

# データベース初期化
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Blockchain Transaction Visualizer API")

# CORS設定（フロントエンドとの通信用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,  # 設定ファイルからの読み込み
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 依存関係: データベースセッション
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ブロックチェーンサービスのファクトリー関数
def get_blockchain_service(blockchain: str):
    """指定されたブロックチェーンのサービスインスタンスを返す"""
    if blockchain == "bitcoin":
        return BitcoinService()
    elif blockchain == "ethereum":
        return EthereumService()
    else:
        raise HTTPException(
            status_code=400, detail=f"Unsupported blockchain: {blockchain}"
        )


@app.get("/")
def read_root():
    return {"message": "Blockchain Transaction Visualizer API"}


@app.get(
    "/transactions/{blockchain}/{address}", response_model=List[schemas.Transaction]
)
def get_transactions(
    blockchain: str,
    address: str,
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    指定されたブロックチェーンとアドレスの取引履歴を取得
    - blockchain: "bitcoin" または "ethereum"
    - address: ウォレットアドレス
    - start_date: 開始日 (ISO形式: YYYY-MM-DD)
    - end_date: 終了日 (ISO形式: YYYY-MM-DD)
    """
    logger.info(f"Fetching transactions for blockchain: {blockchain}, address: {address}, start_date: {start_date}, end_date: {end_date}")
    # パラメータの検証
    if blockchain not in ["bitcoin", "ethereum"]:
        raise HTTPException(
            status_code=400, detail="Supported blockchains are 'bitcoin' and 'ethereum'"
        )

    # 日付パラメータの処理
    start_datetime = None
    end_datetime = None

    if start_date:
        try:
            parsed_date = parser.parse(start_date)
            # タイムゾーン情報を削除して比較可能にする
            start_datetime = parsed_date.replace(tzinfo=None)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")

    if end_date:
        try:
            parsed_date = parser.parse(end_date)
            # タイムゾーン情報を削除して比較可能にする
            end_datetime = parsed_date.replace(tzinfo=None)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")

    # 適切なブロックチェーンサービスを取得
    blockchain_service = get_blockchain_service(blockchain)
    
    # サービスを使用してトランザクションを取得
    transactions = blockchain_service.get_transactions(
        address=address,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        db=db
    )
    logger.info(f"Fetched {len(transactions)} transactions for address: {address}")
    return transactions


@app.get("/network/{blockchain}/{address}", response_model=schemas.TransactionNetwork)
def get_transaction_network(
    blockchain: str,
    address: str,
    depth: int = Query(1, ge=1, le=3),
    start_date: str = Query(None),
    end_date: str = Query(None),
    min_amount: float = Query(None),
    db: Session = Depends(get_db),
):
    """
    指定されたアドレスを中心としたトランザクションネットワークを取得
    - blockchain: "bitcoin" または "ethereum"
    - address: 中心となるウォレットアドレス
    - depth: 探索する深さ（1〜3）
    - start_date: 開始日 (ISO形式)
    - end_date: 終了日 (ISO形式)
    - min_amount: 最小取引金額（この金額以上のトランザクションのみを表示）
    """
    logger.info(f"Fetching transaction network for blockchain: {blockchain}, address: {address}, depth: {depth}, start_date: {start_date}, end_date: {end_date}, min_amount: {min_amount}")
    if blockchain not in ["bitcoin", "ethereum"]:
        raise HTTPException(
            status_code=400, detail="Supported blockchains are 'bitcoin' and 'ethereum'"
        )

    # 日付パラメータの処理
    start_datetime = None
    end_datetime = None

    if start_date:
        try:
            parsed_date = parser.parse(start_date)
            start_datetime = parsed_date.replace(tzinfo=None)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")

    if end_date:
        try:
            parsed_date = parser.parse(end_date)
            end_datetime = parsed_date.replace(tzinfo=None)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")

    # 初期ネットワーク構造
    network = schemas.TransactionNetwork(
        nodes=[schemas.NetworkNode(id=address, label=address, type="source")], links=[]
    )

    # 探索済みアドレス
    explored_addresses = set([address])
    # 探索予定アドレス（深さごと）
    to_explore = {0: [address]}
    
    # 適切なブロックチェーンサービスを取得
    blockchain_service = get_blockchain_service(blockchain)

    for current_depth in range(depth):
        if current_depth not in to_explore or not to_explore[current_depth]:
            break

        next_depth = current_depth + 1
        if next_depth not in to_explore:
            to_explore[next_depth] = []

        for current_address in to_explore[current_depth]:
            # このアドレスの取引を取得
            transactions = blockchain_service.get_transactions(
                address=current_address,
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                db=db,
            )

            for tx in transactions:
                # 最小金額でフィルタリング
                if min_amount is not None and tx.value < min_amount:
                    continue

                # 送信元
                if tx.from_address not in explored_addresses:
                    network.nodes.append(
                        schemas.NetworkNode(
                            id=tx.from_address, label=tx.from_address, type="address"
                        )
                    )
                    explored_addresses.add(tx.from_address)
                    if next_depth < depth:
                        to_explore[next_depth].append(tx.from_address)

                # 送信先
                if tx.to_address not in explored_addresses:
                    network.nodes.append(
                        schemas.NetworkNode(
                            id=tx.to_address, label=tx.to_address, type="address"
                        )
                    )
                    explored_addresses.add(tx.to_address)
                    if next_depth < depth:
                        to_explore[next_depth].append(tx.to_address)

                # リンク（各トランザクションごとに独自のリンク）
                link_id = f"{tx.from_address}_{tx.to_address}_{tx.txid}"
                network.links.append(
                    schemas.NetworkLink(
                        id=link_id,
                        source=tx.from_address,
                        target=tx.to_address,
                        value=tx.value,
                        timestamp=tx.timestamp,
                    )
                )
    logger.info(f"Fetched network with {len(network.nodes)} nodes and {len(network.links)} links for address: {address}")
    return network
