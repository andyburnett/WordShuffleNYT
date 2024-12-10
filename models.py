from main import db

class WordGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    words = db.Column(db.JSON, nullable=False)
    color = db.Column(db.String(7), nullable=False)

class GameState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mistakes = db.Column(db.Integer, default=0)
    matched_groups = db.Column(db.JSON, default=list)
    remaining_words = db.Column(db.JSON, nullable=False)
