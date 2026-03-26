import json
import sqlite3
from datetime import date
from typing import List, Optional

from models import Article, ArticleCreate, ArticleUpdate

DB_PATH = "blog.db"

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
conn.row_factory = sqlite3.Row
conn.execute(
    """
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titre TEXT NOT NULL,
        contenu TEXT NOT NULL,
        auteur TEXT NOT NULL,
        date TEXT NOT NULL,
        categorie TEXT NOT NULL,
        tags TEXT NOT NULL
    )
    """
)
conn.commit()


def _row_to_article(row: sqlite3.Row) -> Article:
    return Article(
        id=row["id"],
        titre=row["titre"],
        contenu=row["contenu"],
        auteur=row["auteur"],
        date=date.fromisoformat(row["date"]),
        categorie=row["categorie"],
        tags=json.loads(row["tags"]) if row["tags"] else [],
    )


class ArticleController:
    @staticmethod
    def create(article: ArticleCreate) -> int:
        payload = article.dict()
        tags_json = json.dumps(payload["tags"])
        cur = conn.execute(
            """
            INSERT INTO articles (titre, contenu, auteur, date, categorie, tags)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload["titre"],
                payload["contenu"],
                payload["auteur"],
                payload["date"].isoformat(),
                payload["categorie"],
                tags_json,
            ),
        )
        conn.commit()
        return int(cur.lastrowid)

    @staticmethod
    def get_all(
        categorie: Optional[str] = None,
        auteur: Optional[str] = None,
        date_filter: Optional[date] = None,
    ) -> List[Article]:
        query = "SELECT * FROM articles"
        clauses = []
        params: List[str] = []

        if categorie:
            clauses.append("LOWER(categorie) = LOWER(?)")
            params.append(categorie)
        if auteur:
            clauses.append("LOWER(auteur) = LOWER(?)")
            params.append(auteur)
        if date_filter:
            clauses.append("date = ?")
            params.append(date_filter.isoformat())

        if clauses:
            query += " WHERE " + " AND ".join(clauses)

        cur = conn.execute(query, params)
        rows = cur.fetchall()
        return [_row_to_article(r) for r in rows]

    @staticmethod
    def get_by_id(article_id: int) -> Optional[Article]:
        cur = conn.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
        row = cur.fetchone()
        return _row_to_article(row) if row else None

    @staticmethod
    def update(article_id: int, updated_data: ArticleUpdate) -> Optional[bool]:
        updates = updated_data.dict(exclude_unset=True)
        if not updates:
            return None

        fields = []
        params: List[str] = []

        for key, value in updates.items():
            if key == "tags":
                value = json.dumps(value or [])
            fields.append(f"{key} = ?")
            params.append(value)

        params.append(article_id)
        cur = conn.execute(
            f"UPDATE articles SET {', '.join(fields)} WHERE id = ?", params
        )
        conn.commit()
        return cur.rowcount > 0

    @staticmethod
    def delete(article_id: int) -> bool:
        cur = conn.execute("DELETE FROM articles WHERE id = ?", (article_id,))
        conn.commit()
        return cur.rowcount > 0

    @staticmethod
    def search(query: str) -> List[Article]:
        q = f"%{query.lower()}%"
        cur = conn.execute(
            """
            SELECT * FROM articles
            WHERE LOWER(titre) LIKE ? OR LOWER(contenu) LIKE ?
            """,
            (q, q),
        )
        rows = cur.fetchall()
        return [_row_to_article(r) for r in rows]
