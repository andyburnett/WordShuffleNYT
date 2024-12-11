from flask import render_template, jsonify, request
from main import app, db
from models import WordGroup, GameState
import random

INITIAL_GROUPS = [
    {
        "words": ["FISH", "INLAND", "TOUCHDOWN", "NAME"],
        "description": "Movement related words",
        "color": "#85C0F9"
    },
    {
        "words": ["CALL", "CRUISE", "DUB", "RUMMAGE"],
        "description": "Search or explore",
        "color": "#A6CF98"
    },
    {
        "words": ["WANDA", "FUMBLE", "OLIVIA", "TAKEOFF"],
        "description": "Names and actions",
        "color": "#F9DF6D"
    },
    {
        "words": ["RAN", "TAXI", "ROOT", "LABEL"],
        "description": "Words with multiple meanings",
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
    # Flatten the words from all groups
    all_words = []
    for group in INITIAL_GROUPS:
        all_words.extend(group['words'])
    
    # Shuffle the words
    random.shuffle(all_words)
    
    # Create a new game state
    return jsonify({
        'words': all_words,
        'groups': INITIAL_GROUPS
    })
