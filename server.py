import sqlite3
import os
import html
from flask import Flask, request, jsonify, render_template

app = Flask(__name__, static_folder='static', template_folder='templates')
DB = 'news.db'
UPLOAD_FOLDER = 'static/images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def init_db():
    with app.app_context():
        db = sqlite3.connect(DB)
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                image TEXT NOT NULL,
                date TEXT NOT NULL
            )
        ''')
        cursor.execute("SELECT COUNT(*) FROM news")
        if cursor.fetchone()[0] == 0:
            sample_news = [
                ("В учебном классе ПАТП-1 в Вологде прошла встреча специалистов центра занятости с представителями компании",
                 "Обсуждались вопросы трудоустройства и обучения новых сотрудников.",
                 "/static/images/news-item-1.png", "17/01/2025"),
                ("ПАТП №1 ждёт женщин-водителей на работу!",
                 "Это отличная возможность начать карьеру.", "/static/images/news-item-3.png", "22/01/2025"),
                ("Для более комфортной и быстрой оплаты во всех трёхдверных автобусах ПАТП № 1 будут работать четыре терминала",
                 "Это делает оплату проезда быстрее и удобнее для пассажиров.", "/static/images/news-item-2.jpeg", "07/02/2025"),
            ]
            cursor.executemany('INSERT INTO news (title, description, image, date) VALUES (?, ?, ?, ?)', sample_news)
        db.commit()


# Вспомогательная функция для получения новости по ID
def get_news_by_id(news_id):
    db = sqlite3.connect(DB)
    cursor = db.cursor()
    cursor.execute("SELECT * FROM news WHERE id = ?", (news_id,))
    row = cursor.fetchone()
    if not row:
        return None
    return {
        'id': row[0],
        'title': row[1],
        'description': row[2],
        'image': row[3],
        'date': row[4]
    }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/news')
def news_page():
    return render_template('news.html')


@app.route('/single-news/<int:news_id>')
def single_news_page(news_id):
    news = get_news_by_id(news_id)
    if news:
        return render_template('single-news.html', news=news)
    else:
        return render_template('error.html', message="Новость не найдена"), 404


@app.route('/admin')
def admin_index():
    return render_template('admin.html')


@app.route('/admin/news')
def admin_news():
    return render_template('admin_news.html')


@app.route('/info-for-police-vologda')
def police():
    return render_template('info-for-police-vologda.html')


@app.route('/contact')
def contact():
    return render_template('contact.html')


@app.route('/about-us')
def about_us():
    return render_template('about-us.html')


@app.route('/documents')
def documents():
    return render_template('documents.html')


@app.route('/service')
def service():
    return render_template('service.html')


@app.route('/charter')
def charter():
    return render_template('charter.html')


@app.route('/passenger')
def passenger():
    return render_template('passenger.html')


@app.route('/children')
def children():
    return render_template('children.html')


@app.route('/payment')
def payment():
    return render_template('payment.html')


@app.route('/price')
def price():
    return render_template('price.html')


@app.route('/schedule')
def schedule():
    return render_template('schedule.html')


@app.route('/your-ticket')
def your_ticket():
    return render_template('your-ticket.html')


@app.route('/official-information')
def official_information():
    return render_template('official-information.html')


@app.route('/anti-corruption')
def anti_corruption():
    return render_template('anti-corruption.html')


@app.route('/autopark')
def autopark():
    return render_template('autopark.html')


@app.route('/work')
def work():
    return render_template('work.html')


@app.route('/support')
def support():
    return render_template('support.html')


@app.route('/api/news', methods=['GET'])
def get_news():
    page = int(request.args.get('page', 1))
    limit = 4
    offset = (page - 1) * limit

    db = sqlite3.connect(DB)
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM news")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT * FROM news ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset))
    rows = cursor.fetchall()

    news_list = [{'id': r[0], 'title': r[1], 'description': r[2], 'image': r[3], 'date': r[4]} for r in rows]

    return jsonify({
        'news': news_list,
        'total': total,
        'per_page': limit,
        'current_page': page
    })


@app.route('/api/news/all', methods=['GET'])  # полный список новостей
def get_all_news():
    db = sqlite3.connect(DB)
    cursor = db.cursor()
    cursor.execute("SELECT * FROM news ORDER BY id DESC")
    rows = cursor.fetchall()

    news_list = [{'id': r[0], 'title': r[1], 'description': r[2], 'image': r[3], 'date': r[4]} for r in rows]

    return jsonify({
        'news': news_list
    })


@app.route('/api/news/<int:news_id>', methods=['GET'])  # получение конкретной новости
def get_single_news(news_id):
    news = get_news_by_id(news_id)
    if news:
        return jsonify(news)
    else:
        return jsonify({'error': 'Новость не найдена'}), 404


@app.route('/api/news', methods=['POST'])
def add_news():
    title = html.escape(request.form.get('title'))
    description = html.escape(request.form.get('description'))
    date = html.escape(request.form.get('date'))

    import re
    if not re.match(r'^\d{2}/\d{2}/\d{4}$', date):
        return jsonify({'error': 'Дата должна быть в формате дд/мм/гггг'}), 400

    file = request.files.get('image')
    if file and file.filename != '':
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        image_path = f'/static/images/{filename}'
    else:
        image_path = html.escape(request.form.get('image_path', ''))
        if not image_path:
            return jsonify({'error': 'Изображение обязательно'}), 400

    db = sqlite3.connect(DB)
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO news (title, description, image, date) VALUES (?, ?, ?, ?)
    ''', (title, description, image_path, date))
    db.commit()

    return jsonify({'success': True, 'id': cursor.lastrowid}), 201


@app.route('/api/news/<int:news_id>', methods=['PUT'])
def update_news(news_id):
    title = html.escape(request.form.get('title'))
    description = html.escape(request.form.get('description'))
    date = html.escape(request.form.get('date'))

    import re
    if not re.match(r'^\d{2}/\d{2}/\d{4}$', date):
        return jsonify({'error': 'Дата должна быть в формате дд/мм/гггг'}), 400

    file = request.files.get('image')
    if file and file.filename != '':
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        image_path = f'/static/images/{filename}'
    else:
        image_path = html.escape(request.form.get('image_path', ''))
        if not image_path:
            return jsonify({'error': 'Изображение обязательно'}), 400

    db = sqlite3.connect(DB)
    cursor = db.cursor()
    cursor.execute('''
        UPDATE news SET title=?, description=?, image=?, date=? WHERE id=?
    ''', (title, description, image_path, date, news_id))
    db.commit()

    return jsonify({'success': True})


@app.route('/api/news/<int:news_id>', methods=['DELETE'])
def delete_news(news_id):
    db = sqlite3.connect(DB)
    cursor = db.cursor()
    cursor.execute("DELETE FROM news WHERE id=?", (news_id,))
    db.commit()
    return jsonify({'success': True})


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
    init_db()
    app.run(debug=True)