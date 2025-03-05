from sqlalchemy import create_engine
from app.database.database import Base
from app.config import DATABASE_URL


def reset_database():
    """
    データベースをリセットする関数
    - 既存のテーブルを削除
    - 新しいスキーマでテーブルを作成
    """
    print("データベースをリセット中...")

    # データベースエンジンの作成
    engine = create_engine(DATABASE_URL)

    # 既存のテーブルを削除
    Base.metadata.drop_all(engine)
    print("既存のテーブルを削除しました")

    # 新しいスキーマでテーブルを作成
    Base.metadata.create_all(engine)
    print("新しいテーブルを作成しました")

    print("データベースのリセットが完了しました")


if __name__ == "__main__":
    reset_database()
