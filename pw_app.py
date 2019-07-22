from flask import current_app, Flask, render_template, url_for
app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/help')
def h_index():
    return render_template('h_index.html')


@app.route('/sw.js', methods=['GET'])
def sw():
    return current_app.send_static_file('sw.js')


@app.route('/offline')
def offline():
    return render_template('offline.html')


if __name__=='__main__':
    app.run(debug=True)
