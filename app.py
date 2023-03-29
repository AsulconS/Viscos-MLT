from flask import Flask, request, render_template, url_for, send_file
from flask_cors import CORS, cross_origin


app = Flask(__name__, static_url_path='/static')
CORS(app, support_credentials=True)


@app.route('/', methods=['GET'])
def main():
    three_js_version = '0.150.1'
    dat_gui_version = '0.7.7'
    return render_template('main.html', three_js_version=three_js_version, dat_gui_version=dat_gui_version)


if __name__ == '__main__':
    app.secret_key = 'viscos'
    app.run('0.0.0.0')
