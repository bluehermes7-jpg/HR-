from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='dist')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # 로컬 테스트용 (서버 배포 시에는 gunicorn 등을 사용)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
