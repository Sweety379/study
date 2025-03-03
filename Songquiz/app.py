from flask import Flask, render_template, request, jsonify, session
import random
import json

app = Flask(__name__)
app.secret_key = 'super_secret_key_123'

with open('questions.json') as f:
    questions = json.load(f)

teams = {
    '1': {'round': 1, 'question': 1, 'score': 0},
    '2': {'round': 1, 'question': 1, 'score': 0}
}

@app.route('/')
def index():
    team = request.args.get('team', '1')
    session['team'] = team
    return render_template('index.html')

@app.route('/get_question')
def get_question():
    team = session.get('team', '1')
    q_num = teams[team]['question']
    q_pool = questions.get(str(q_num), [])

    if not q_pool:
        return jsonify({'error': '题目不存在'})

    selected = random.choice(q_pool)
    session['correct_answer'] = selected['answer']
    return jsonify({
        'type': selected['type'],
        'content': selected['content'],
        'options': selected['options'],
        'q_num': q_num,
        'round': teams[team]['round']
    })

@app.route('/check', methods=['POST'])
def check_answer():
    team = session.get('team', '1')
    data = request.json
    is_correct = data['answer'] == session.get('correct_answer', '')

    if is_correct:
        teams[team]['question'] += 1
        if teams[team]['question'] in [6, 12, 18]:
            teams[team]['round'] += 1
        teams[team]['score'] += 10

    return jsonify({
        'correct': is_correct,
        'new_question': teams[team]['question'],
        'new_round': teams[team]['round']
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)