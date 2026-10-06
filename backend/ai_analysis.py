"""
AI Analysis Module
===================
Provides AI-powered cognitive performance analysis
based on game data for dementia risk assessment.
"""


def analyze_performance(game_data):
    """
    Analyze a single game's performance and return
    AI-generated feedback.

    Args:
        game_data (dict): Game performance data with keys:
            - score, total_questions, correct_answers
            - mistakes, accuracy, time_taken

    Returns:
        dict: AI feedback with score assessment,
              cognitive insights, and suggestions.
    """

    score = game_data.get("score", 0)
    mistakes = game_data.get("mistakes", 0)
    accuracy = game_data.get("accuracy", 0)
    time_taken = game_data.get("time_taken", 0)
    total_questions = game_data.get("total_questions", 0)

    # -----------------------------------------
    #  Score Assessment
    # -----------------------------------------

    if accuracy >= 90:
        performance_level = "excellent"
        message = "Outstanding performance! Your memory is sharp and responding well."

    elif accuracy >= 70:
        performance_level = "good"
        message = "Good job! Your memory is functioning well with minor lapses."

    elif accuracy >= 50:
        performance_level = "average"
        message = "Average performance. Regular practice can help improve your memory."

    elif accuracy >= 30:
        performance_level = "below_average"
        message = "Below average. Consider increasing practice frequency and consulting a professional."

    else:
        performance_level = "needs_attention"
        message = "Performance needs attention. Please consult a healthcare professional for assessment."

    # -----------------------------------------
    #  Speed Assessment
    # -----------------------------------------

    if total_questions > 0:
        avg_time_per_question = time_taken / total_questions
    else:
        avg_time_per_question = 0

    if avg_time_per_question <= 5:
        speed_assessment = "fast"
        speed_note = "Quick responses indicate good cognitive processing speed."

    elif avg_time_per_question <= 10:
        speed_assessment = "normal"
        speed_note = "Normal response time."

    elif avg_time_per_question <= 15:
        speed_assessment = "slow"
        speed_note = "Slightly slow responses. Take your time but try to stay focused."

    else:
        speed_assessment = "very_slow"
        speed_note = "Slower than expected response time. This may indicate processing difficulties."

    # -----------------------------------------
    #  Mistake Analysis
    # -----------------------------------------

    if total_questions > 0:
        mistake_ratio = mistakes / total_questions
    else:
        mistake_ratio = 0

    if mistake_ratio <= 0.1:
        mistake_analysis = "Very few mistakes - excellent recall ability."

    elif mistake_ratio <= 0.3:
        mistake_analysis = "Some mistakes - normal range for memory exercises."

    elif mistake_ratio <= 0.5:
        mistake_analysis = "Moderate mistakes - more practice recommended."

    else:
        mistake_analysis = "High mistake rate - may indicate memory difficulties."

    # -----------------------------------------
    #  Suggestions
    # -----------------------------------------

    suggestions = []

    if accuracy < 70:
        suggestions.append(
            "Practice memory games daily for 10-15 minutes."
        )

    if avg_time_per_question > 10:
        suggestions.append(
            "Try to improve response speed with regular practice."
        )

    if mistakes > 3:
        suggestions.append(
            "Focus on fewer cards at a time to reduce mistakes."
        )

    if accuracy < 50:
        suggestions.append(
            "Consider consulting a healthcare professional for a cognitive assessment."
        )

    if not suggestions:
        suggestions.append(
            "Keep up the great work! Continue playing regularly."
        )

    # -----------------------------------------
    #  Build Response
    # -----------------------------------------

    return {
        "performance_level": performance_level,
        "message": message,
        "details": {
            "accuracy_assessment": f"{accuracy}% accuracy",
            "speed_assessment": speed_assessment,
            "speed_note": speed_note,
            "mistake_analysis": mistake_analysis,
            "avg_time_per_question": round(avg_time_per_question, 1)
        },
        "suggestions": suggestions,
        "cognitive_score": calculate_cognitive_score(
            accuracy, avg_time_per_question, mistake_ratio
        )
    }


def calculate_cognitive_score(accuracy, avg_time, mistake_ratio):
    """
    Calculate a composite cognitive score (0-100)
    based on multiple performance factors.

    Weights:
        - Accuracy: 50%
        - Speed: 30%
        - Mistakes: 20%
    """

    # Accuracy score (0-100)
    accuracy_score = accuracy

    # Speed score (faster = better, max 15s per question)
    if avg_time <= 3:
        speed_score = 100
    elif avg_time <= 15:
        speed_score = max(0, 100 - ((avg_time - 3) / 12) * 100)
    else:
        speed_score = 0

    # Mistake score (fewer = better)
    mistake_score = max(0, (1 - mistake_ratio) * 100)

    # Weighted composite
    cognitive_score = (
        (accuracy_score * 0.50) +
        (speed_score * 0.30) +
        (mistake_score * 0.20)
    )

    return round(cognitive_score, 1)
