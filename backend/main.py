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
    second_address: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    指定されたブロックチェーンとアドレスの取引履歴を取得
    - blockchain: "bitcoin" または "ethereum"
    - address: ウォレットアドレス
    - start_date: 開始日 (ISO形式: YYYY-MM-DD)
    - end_date: 終了日 (ISO形式: YYYY-MM-DD)
    - second_address: 特定のアドレスとの間のトランザクションのみを取得する場合に指定
    """
    logger.info(f"Fetching transactions for blockchain: {blockchain}, address: {address}, start_date: {start_date}, end_date: {end_date}, second_address: {second_address}")
    # パラメータの検証
    if blockchain not in ["bitcoin", "ethereum"]:
        raise HTTPException(
            status_code=400, detail="Supported blockchains are 'bitcoin' and 'ethereum'"
        )
        
    # 第二アドレスの検証（指定されている場合）
    if second_address and blockchain == "bitcoin":
        # 適切なブロックチェーンサービスを取得して検証
        blockchain_service = get_blockchain_service(blockchain)
        if hasattr(blockchain_service, 'validate_bitcoin_address') and not blockchain_service.validate_bitcoin_address(second_address):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid Bitcoin address format for second_address: {second_address}"
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
        db=db,
        depth=1  # 通常のトランザクション取得では深度1として扱う
    )
    
    # 特定のアドレスとの間のトランザクションのみをフィルタリング
    if second_address:
        second_address_lower = second_address.lower()
        filtered_transactions = [
            tx for tx in transactions 
            if (tx.from_address.lower() == second_address_lower and tx.to_address.lower() == address.lower()) or
               (tx.from_address.lower() == address.lower() and tx.to_address.lower() == second_address_lower)
        ]
        logger.info(f"Filtered to {len(filtered_transactions)} transactions between {address} and {second_address}")
        return filtered_transactions
    
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
    second_address: str = Query(None),
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
    logger.info(f"Fetching transaction network for blockchain: {blockchain}, address: {address}, depth: {depth}, start_date: {start_date}, end_date: {end_date}, min_amount: {min_amount}, second_address: {second_address}")
    if blockchain not in ["bitcoin", "ethereum"]:
        raise HTTPException(
            status_code=400, detail="Supported blockchains are 'bitcoin' and 'ethereum'"
        )
        
    # 第二アドレスの検証（指定されている場合）
    if second_address and blockchain == "bitcoin":
        # 適切なブロックチェーンサービスを取得して検証
        blockchain_service = get_blockchain_service(blockchain)
        if hasattr(blockchain_service, 'validate_bitcoin_address') and not blockchain_service.validate_bitcoin_address(second_address):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid Bitcoin address format for second_address: {second_address}"
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

    # アドレスを小文字に正規化
    normalized_address = address.lower()
    
    # 初期ネットワーク構造
    network = schemas.TransactionNetwork(
        nodes=[schemas.NetworkNode(id=normalized_address, label=address, type="source")], links=[]
    )

    # 探索済みアドレス（小文字に正規化）
    explored_addresses = set([normalized_address])
    # 探索予定アドレス（深さごと）
    to_explore = {0: [normalized_address]}
    
    # 適切なブロックチェーンサービスを取得
    blockchain_service = get_blockchain_service(blockchain)

    for current_depth in range(depth):
        if current_depth not in to_explore or not to_explore[current_depth]:
            break

        next_depth = current_depth + 1
        if next_depth not in to_explore:
            to_explore[next_depth] = []

        for current_address in to_explore[current_depth]:
            try:
                # このアドレスの取引を取得
                transactions = blockchain_service.get_transactions(
                    address=current_address,
                    start_datetime=start_datetime,
                    end_datetime=end_datetime,
                    db=db,
                    depth=depth,  # 探索深度を渡す
                )
            except HTTPException as e:
                # アドレス検証エラーなどの場合はスキップして次のアドレスへ
                logger.warning(f"Error fetching transactions for address {current_address}: {e.detail}")
                continue

            for tx in transactions:
                # 最小金額でフィルタリング
                if min_amount is not None and tx.value < min_amount:
                    continue

                # アドレスを小文字に正規化
                from_address_normalized = tx.from_address.lower()
                to_address_normalized = tx.to_address.lower()
                
                # 送信元
                if from_address_normalized not in explored_addresses:
                    network.nodes.append(
                        schemas.NetworkNode(
                            id=from_address_normalized, label=tx.from_address, type="address"
                        )
                    )
                    explored_addresses.add(from_address_normalized)
                    if next_depth < depth:
                        to_explore[next_depth].append(from_address_normalized)

                # 送信先
                if to_address_normalized not in explored_addresses:
                    network.nodes.append(
                        schemas.NetworkNode(
                            id=to_address_normalized, label=tx.to_address, type="address"
                        )
                    )
                    explored_addresses.add(to_address_normalized)
                    if next_depth < depth:
                        to_explore[next_depth].append(to_address_normalized)

                # リンク（各トランザクションごとに独自のリンク）
                link_id = f"{from_address_normalized}_{to_address_normalized}_{tx.txid}"
                network.links.append(
                    schemas.NetworkLink(
                        id=link_id,
                        source=from_address_normalized,
                        target=to_address_normalized,
                        value=tx.value,
                        timestamp=tx.timestamp,
                    )
                )
    # 特定のアドレスとの間のトランザクションのみをフィルタリング
    if second_address:
        second_address_normalized = second_address.lower()
        
        # second_addressがノードに含まれていない場合は追加
        if second_address_normalized not in explored_addresses:
            network.nodes.append(
                schemas.NetworkNode(
                    id=second_address_normalized, label=second_address, type="focus"
                )
            )
            explored_addresses.add(second_address_normalized)
        else:
            # 既存のノードのタイプを変更
            for node in network.nodes:
                if node.id == second_address_normalized:
                    node.type = "focus"
                    break
        
        # 中心アドレスと指定アドレス間のリンクのみをフィルタリング
        filtered_links = [
            link for link in network.links
            if (link.source == normalized_address and link.target == second_address_normalized) or
               (link.source == second_address_normalized and link.target == normalized_address)
        ]
        
        # 関連するノードのみを保持
        relevant_nodes = {normalized_address, second_address_normalized}
        
        # フィルタリングされたネットワークを作成
        filtered_network = schemas.TransactionNetwork(
            nodes=[node for node in network.nodes if node.id in relevant_nodes],
            links=filtered_links
        )
        
        logger.info(f"Filtered network to {len(filtered_network.nodes)} nodes and {len(filtered_network.links)} links between {address} and {second_address}")
        return filtered_network
    
    logger.info(f"Fetched network with {len(network.nodes)} nodes and {len(network.links)} links for address: {address}")
    return network
