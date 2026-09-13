import sqlite3
import os
from typing import Dict, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reputation.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_reputation_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reputation (
            queen_name TEXT PRIMARY KEY,
            score REAL DEFAULT 1.0,
            last_claimed REAL,
            last_actual REAL,
            update_count INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def get_reputation(queen_name: str) -> float:
    """
    Returns the current reputation score for a Queen. Defaults to 1.0 if not found.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT score FROM reputation WHERE queen_name = ?", (queen_name,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return float(row["score"])
    return 1.0


def update_reputation(
    queen_name: str,
    claimed_value: float,
    actual_value: float,
    alpha: float = 0.9
) -> float:
    """
    Updates the reputation of a Queen based on realized outcome vs claim:
    accuracy = min(claimed, actual) / max(claimed, actual)
    new_score = alpha * old_score + (1 - alpha) * accuracy
    """
    claimed = max(0.001, float(claimed_value))
    actual = max(0.001, float(actual_value))
    accuracy = min(claimed, actual) / max(claimed, actual)

    old_score = get_reputation(queen_name)
    new_score = (alpha * old_score) + ((1.0 - alpha) * accuracy)
    # Bound score between 0.05 (floor) and 1.0 (ceiling)
    new_score = round(max(0.05, min(1.0, new_score)), 4)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reputation (queen_name, score, last_claimed, last_actual, update_count, updated_at)
        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(queen_name) DO UPDATE SET
            score = excluded.score,
            last_claimed = excluded.last_claimed,
            last_actual = excluded.last_actual,
            update_count = reputation.update_count + 1,
            updated_at = CURRENT_TIMESTAMP
    """, (queen_name, new_score, claimed_value, actual_value))
    conn.commit()
    conn.close()
    return new_score


def list_reputations() -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reputation ORDER BY queen_name ASC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "queen_name": r["queen_name"],
            "score": float(r["score"]),
            "last_claimed": r["last_claimed"],
            "last_actual": r["last_actual"],
            "update_count": r["update_count"],
            "updated_at": r["updated_at"],
        }
        for r in rows
    ]


def reset_all_reputations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reputation")
    conn.commit()
    conn.close()


# Ensure table exists on import
init_reputation_db()
