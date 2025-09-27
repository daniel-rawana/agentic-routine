# Encapsulate XP/Money rules for easy tuning.
def award_for_action(action: str) -> tuple[int, int]:
    # (xp, money)
    table = {
        "wake_early": (10, 2),
        "gym_session": (25, 5),
        "task_complete": (15, 3),
        "self_care": (10, 2),
    }
    return table.get(action, (5, 1))
