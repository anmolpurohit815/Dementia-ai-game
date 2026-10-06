"""
MindCare - AI Dementia Game Backend
====================================
Flask + SQLite backend for storing player profiles
and game performance data with AI analysis endpoints.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database
from ai_analysis import analyze_performance
from datetime import datetime

# -------------------------------------------------
#  Flask App Setup
# -------------------------------------------------

app = Flask(__name__)
CORS(app)  # Allow frontend requests (cross-origin)

db = Database()


# =================================================
#  HEALTH CHECK
# =================================================

@app.route("/", methods=["GET"])
def home():
    """Health check endpoint."""

    return jsonify({
        "status": "running",
        "app": "MindCare Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })


# =================================================
#  PLAYER APIs
# =================================================

# ----- Register New Player -----

@app.route("/api/players", methods=["POST"])
def register_player():
    """
    Register a new player.

    Request JSON:
        {
            "name": "John",
            "age": 65,
            "gender": "Male"
        }
    """

    data = request.get_json()

    if not data or "name" not in data:
        return jsonify({"error": "Player name is required"}), 400

    name = data["name"]
    age = data.get("age", 0)
    gender = data.get("gender", "Unknown")

    player_id = db.add_player(name, age, gender)

    return jsonify({
        "message": "Player registered successfully",
        "player_id": player_id
    }), 201


# ----- Get All Players -----

@app.route("/api/players", methods=["GET"])
def get_all_players():
    """Get a list of all registered players."""

    players = db.get_all_players()

    return jsonify({
        "count": len(players),
        "players": players
    })


# ----- Get Single Player -----

@app.route("/api/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    """Get details of a specific player by ID."""

    player = db.get_player(player_id)

    if not player:
        return jsonify({"error": "Player not found"}), 404

    return jsonify(player)


# ----- Update Player -----

@app.route("/api/players/<int:player_id>", methods=["PUT"])
def update_player(player_id):
    """
    Update player details.

    Request JSON:
        {
            "name": "Updated Name",
            "age": 70,
            "gender": "Male"
        }
    """

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    success = db.update_player(
        player_id,
        name=data.get("name"),
        age=data.get("age"),
        gender=data.get("gender")
    )

    if not success:
        return jsonify({"error": "Player not found"}), 404

    return jsonify({"message": "Player updated successfully"})


# ----- Delete Player -----

@app.route("/api/players/<int:player_id>", methods=["DELETE"])
def delete_player(player_id):
    """Delete a player and their game history."""

    success = db.delete_player(player_id)

    if not success:
        return jsonify({"error": "Player not found"}), 404

    return jsonify({"message": "Player deleted successfully"})


# =================================================
#  GAME RESULT APIs
# =================================================

# ----- Save Game Result -----

@app.route("/api/game-results", methods=["POST"])
def save_game_result():
    """
    Save game performance data from the frontend.

    Request JSON:
        {
            "player_id": 1,
            "game_name": "memory",
            "score": 4,
            "total_questions": 6,
            "correct_answers": 4,
            "mistakes": 2,
            "accuracy": 67,
            "time_taken": 45
        }
    """

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    required = ["player_id", "game_name", "score"]

    for field in required:
        if field not in data:
            return jsonify({
                "error": f"Missing required field: {field}"
            }), 400

    # Save to database
    result_id = db.save_game_result(
        player_id=data["player_id"],
        game_name=data["game_name"],
        score=data.get("score", 0),
        total_questions=data.get("total_questions", 0),
        correct_answers=data.get("correct_answers", 0),
        mistakes=data.get("mistakes", 0),
        accuracy=data.get("accuracy", 0.0),
        time_taken=data.get("time_taken", 0)
    )

    # AI Analysis
    ai_feedback = analyze_performance(data)

    return jsonify({
        "message": "Game result saved successfully",
        "result_id": result_id,
        "ai_feedback": ai_feedback
    }), 201


# ----- Get All Game Results -----

@app.route("/api/game-results", methods=["GET"])
def get_all_results():
    """Get all game results. Optional query: ?player_id=1"""

    player_id = request.args.get("player_id", type=int)

    if player_id:
        results = db.get_results_by_player(player_id)
    else:
        results = db.get_all_results()

    return jsonify({
        "count": len(results),
        "results": results
    })


# ----- Get Single Game Result -----

@app.route("/api/game-results/<int:result_id>", methods=["GET"])
def get_result(result_id):
    """Get a specific game result by ID."""

    result = db.get_result(result_id)

    if not result:
        return jsonify({"error": "Result not found"}), 404

    return jsonify(result)


# ----- Delete Game Result -----

@app.route("/api/game-results/<int:result_id>", methods=["DELETE"])
def delete_result(result_id):
    """Delete a specific game result."""

    success = db.delete_result(result_id)

    if not success:
        return jsonify({"error": "Result not found"}), 404

    return jsonify({"message": "Result deleted successfully"})


# =================================================
#  AI ANALYSIS API
# =================================================

@app.route("/api/ai/analyze/<int:player_id>", methods=["GET"])
def ai_analyze_player(player_id):
    """
    Get AI-powered analysis of a player's overall
    cognitive performance across all their games.
    """

    player = db.get_player(player_id)

    if not player:
        return jsonify({"error": "Player not found"}), 404

    results = db.get_results_by_player(player_id)

    if not results:
        return jsonify({
            "error": "No game data found for this player"
        }), 404

    # Build comprehensive analysis
    analysis = build_player_analysis(player, results)

    return jsonify(analysis)


# =================================================
#  DASHBOARD / STATS API
# =================================================

@app.route("/api/stats/<int:player_id>", methods=["GET"])
def get_player_stats(player_id):
    """Get aggregated stats for a player's dashboard."""

    player = db.get_player(player_id)

    if not player:
        return jsonify({"error": "Player not found"}), 404

    stats = db.get_player_stats(player_id)

    return jsonify({
        "player": player,
        "stats": stats
    })


# =================================================
#  HELPER FUNCTIONS
# =================================================

def build_player_analysis(player, results):
    """Build a comprehensive AI analysis from game history."""

    total_games = len(results)

    avg_score = sum(r["score"] for r in results) / total_games
    avg_accuracy = sum(r["accuracy"] for r in results) / total_games
    avg_time = sum(r["time_taken"] for r in results) / total_games
    total_mistakes = sum(r["mistakes"] for r in results)

    # Trend analysis (compare recent vs older games)
    if total_games >= 4:
        mid = total_games // 2
        older_avg = sum(r["accuracy"] for r in results[:mid]) / mid
        recent_avg = sum(r["accuracy"] for r in results[mid:]) / (total_games - mid)

        if recent_avg > older_avg + 5:
            trend = "improving"
        elif recent_avg < older_avg - 5:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "insufficient_data"

    # Risk assessment
    if avg_accuracy >= 80:
        risk_level = "low"
        recommendation = "Excellent cognitive performance. Keep playing regularly to maintain sharpness."
    elif avg_accuracy >= 60:
        risk_level = "moderate"
        recommendation = "Good performance with room for improvement. Consider daily practice sessions."
    elif avg_accuracy >= 40:
        risk_level = "elevated"
        recommendation = "Performance indicates some cognitive challenges. Regular practice and professional consultation recommended."
    else:
        risk_level = "high"
        recommendation = "Performance suggests significant cognitive difficulties. Please consult a healthcare professional."

    return {
        "player": player,
        "summary": {
            "total_games_played": total_games,
            "average_score": round(avg_score, 1),
            "average_accuracy": round(avg_accuracy, 1),
            "average_time_seconds": round(avg_time, 1),
            "total_mistakes": total_mistakes,
            "performance_trend": trend
        },
        "ai_assessment": {
            "risk_level": risk_level,
            "recommendation": recommendation,
            "cognitive_areas": {
                "memory": "Based on memory match game performance",
                "attention": f"Average time per game: {round(avg_time, 1)}s",
                "accuracy": f"{round(avg_accuracy, 1)}% average accuracy"
            }
        },
        "game_history": results
    }


# =================================================
#  RUN SERVER
# =================================================

if __name__ == "__main__":

    print("\n" + "=" * 50)
    print("  MindCare Backend Server")
    print("  Running on: http://127.0.0.1:5000")
    print("=" * 50 + "\n")

    app.run(debug=True, port=5000)
