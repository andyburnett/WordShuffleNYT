from flask import render_template, jsonify, request
from main import app, db
from models import WordGroup, GameState
import random

INITIAL_GROUPS = [
    {
        "name": "TEST GROUP 1",
        "words": ["FISH", "INLAND", "TOUCHDOWN", "NAME"],
        "color": "#85C0F9"
    },
    {
        "name": "TEST GROUP 2",
        "words": ["CALL", "CRUISE", "DUB", "RUMMAGE"],
        "color": "#A6CF98"
    },
    {
        "name": "TEST GROUP 3",
        "words": ["WANDA", "FUMBLE", "OLIVIA", "TAKEOFF"],
        "color": "#F9DF6D"
    },
    {
        "name": "TEST GROUP 4",
        "words": ["RAN", "TAXI", "ROOT", "LABEL"],
        "color": "#FF8B94"
    }
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/validate', methods=['POST'])
def validate_guess():
    data = request.get_json()
    selected_words = set(data['words'])
    
    for group in INITIAL_GROUPS:
        if set(group['words']) == selected_words:
            return jsonify({
                'correct': True,
                'group_name': group['name'],
                'color': group['color']
            })
    
    return jsonify({'correct': False})

@app.route('/api/new-game')
def new_game():
    all_words = [word for group in INITIAL_GROUPS for word in group['words']]
    random.shuffle(all_words)
    return jsonify({'words': all_words})
