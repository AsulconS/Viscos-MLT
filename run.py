from flask import Flask, request, render_template, url_for


app = Flask(__name__)


@app.route('/', methods=['GET'])
def main():
    return render_template('main.html')


if __name__ == '__main__':
    app.secret_key = 'viscos'
    app.run('0.0.0.0')
