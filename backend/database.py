"""
Database Module
================
SQLite database setup with players and game_results tables.
Handles all CRUD operations for the MindCare backend.
"""

import sqlite3
from datetime import datetime


class Database:
    """SQLite database handler for MindCare game data."""

    def __init__(self, db_name="mindcare.db"):
        """Initialize database and create tables."""

        self.db_name = db_name
        self.create_tables()

    # -----------------------------------------
    #  Connection Helper
    # -----------------------------------------

    def get_connection(self):
        """Get a new database connection with row_factory."""

        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row  # Dict-like access
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    # -----------------------------------------
    #  Create Tables
    # -----------------------------------------

    def create_tables(self):
        """
        Create the database tables if they don't exist.

        Tables:
            - players: Store player profiles
            - game_results: Store game performance data
        """

        conn = self.get_connection()
        cursor = conn.cursor()

        # ===== PLAYERS TABLE =====
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS players (

                id              INTEGER PRIMARY KEY AUTOINCREMENT,

                name            TEXT        NOT NULL,
                age             INTEGER     DEFAULT 0,
                gender          TEXT        DEFAULT 'Unknown',

                created_at      DATETIME    DEFAULT CURRENT_TIMESTAMP,
                updated_at      DATETIME    DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ===== GAME RESULTS TABLE =====
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS game_results (

                id              INTEGER PRIMARY KEY AUTOINCREMENT,

                player_id       INTEGER     NOT NULL,
                game_name       TEXT        NOT NULL,

                score           INTEGER     DEFAULT 0,
                total_questions INTEGER     DEFAULT 0,
                correct_answers INTEGER     DEFAULT 0,
                mistakes        INTEGER     DEFAULT 0,

                accuracy        REAL        DEFAULT 0.0,
                time_taken      INTEGER     DEFAULT 0,

                difficulty      TEXT        DEFAULT 'normal',

                played_at       DATETIME    DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (player_id)
                    REFERENCES players(id)
                    ON DELETE CASCADE
            )
        """)

        # ===== INDEXES for faster queries =====
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_results_player
            ON game_results(player_id)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_results_game
            ON game_results(game_name)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_results_played_at
            ON game_results(played_at)
        """)

        conn.commit()
        conn.close()

        print("[OK] Database tables created successfully")

    # =========================================
    #  PLAYER OPERATIONS
    # =========================================

    def add_player(self, name, age=0, gender="Unknown"):
        """Add a new player to the database. Returns player ID."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO players (name, age, gender)
            VALUES (?, ?, ?)
            """,
            (name, age, gender)
        )

        player_id = cursor.lastrowid

        conn.commit()
        conn.close()

        print(f"[OK] Player added: {name} (ID: {player_id})")

        return player_id

    def get_all_players(self):
        """Get all players as a list of dicts."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM players ORDER BY created_at DESC")

        players = [dict(row) for row in cursor.fetchall()]

        conn.close()

        return players

    def get_player(self, player_id):
        """Get a single player by ID. Returns dict or None."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM players WHERE id = ?",
            (player_id,)
        )

        row = cursor.fetchone()
        conn.close()

        return dict(row) if row else None

    def update_player(self, player_id, name=None, age=None, gender=None):
        """Update player details. Returns True if updated."""

        player = self.get_player(player_id)

        if not player:
            return False

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE players SET
                name = ?,
                age = ?,
                gender = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                name or player["name"],
                age if age is not None else player["age"],
                gender or player["gender"],
                datetime.now().isoformat(),
                player_id
            )
        )

        conn.commit()
        conn.close()

        return True

    def delete_player(self, player_id):
        """Delete a player and cascade delete their results."""

        player = self.get_player(player_id)

        if not player:
            return False

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM players WHERE id = ?",
            (player_id,)
        )

        conn.commit()
        conn.close()

        print(f"[DELETED] Player deleted: ID {player_id}")

        return True

    # =========================================
    #  GAME RESULTS OPERATIONS
    # =========================================

    def save_game_result(self, player_id, game_name, score=0,
                         total_questions=0, correct_answers=0,
                         mistakes=0, accuracy=0.0, time_taken=0,
                         difficulty="normal"):
        """Save a game result. Returns result ID."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO game_results
                (player_id, game_name, score, total_questions,
                 correct_answers, mistakes, accuracy, time_taken,
                 difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                player_id, game_name, score,
                total_questions, correct_answers,
                mistakes, accuracy, time_taken,
                difficulty
            )
        )

        result_id = cursor.lastrowid

        conn.commit()
        conn.close()

        print(f"[OK] Game result saved: ID {result_id}")

        return result_id

    def get_all_results(self):
        """Get all game results with player names."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                gr.*,
                p.name as player_name
            FROM game_results gr
            JOIN players p ON gr.player_id = p.id
            ORDER BY gr.played_at DESC
        """)

        results = [dict(row) for row in cursor.fetchall()]

        conn.close()

        return results

    def get_result(self, result_id):
        """Get a single game result by ID."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                gr.*,
                p.name as player_name
            FROM game_results gr
            JOIN players p ON gr.player_id = p.id
            WHERE gr.id = ?
        """, (result_id,))

        row = cursor.fetchone()
        conn.close()

        return dict(row) if row else None

    def get_results_by_player(self, player_id):
        """Get all results for a specific player."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM game_results
            WHERE player_id = ?
            ORDER BY played_at ASC
        """, (player_id,))

        results = [dict(row) for row in cursor.fetchall()]

        conn.close()

        return results

    def delete_result(self, result_id):
        """Delete a game result. Returns True if deleted."""

        result = self.get_result(result_id)

        if not result:
            return False

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM game_results WHERE id = ?",
            (result_id,)
        )

        conn.commit()
        conn.close()

        return True

    # =========================================
    #  STATS & ANALYTICS
    # =========================================

    def get_player_stats(self, player_id):
        """Get aggregated performance stats for a player."""

        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*)            as total_games,
                COALESCE(AVG(score), 0)           as avg_score,
                COALESCE(MAX(score), 0)           as best_score,
                COALESCE(MIN(score), 0)           as worst_score,
                COALESCE(AVG(accuracy), 0)        as avg_accuracy,
                COALESCE(MAX(accuracy), 0)        as best_accuracy,
                COALESCE(SUM(mistakes), 0)        as total_mistakes,
                COALESCE(AVG(time_taken), 0)      as avg_time,
                COALESCE(MIN(time_taken), 0)      as fastest_time,
                COALESCE(SUM(correct_answers), 0) as total_correct,
                COALESCE(SUM(total_questions), 0) as total_questions
            FROM game_results
            WHERE player_id = ?
        """, (player_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            stats = dict(row)

            # Round float values
            stats["avg_score"] = round(stats["avg_score"], 1)
            stats["avg_accuracy"] = round(stats["avg_accuracy"], 1)
            stats["avg_time"] = round(stats["avg_time"], 1)

            return stats

        return {
            "total_games": 0,
            "avg_score": 0,
            "best_score": 0,
            "worst_score": 0,
            "avg_accuracy": 0,
            "best_accuracy": 0,
            "total_mistakes": 0,
            "avg_time": 0,
            "fastest_time": 0,
            "total_correct": 0,
            "total_questions": 0
        }
