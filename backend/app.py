from flask import Flask
from flask_cors import CORS

from student_route import student_bp
from admin_route import admin_bp

app = Flask(__name__)
# Allow the frontend origin and support credentials (cookies/session)
# When supports_credentials=True, Access-Control-Allow-Origin must be the exact origin (not '*')
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}}, supports_credentials=True)

app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(admin_bp, url_prefix='/admin')

if __name__ == '__main__':
    app.run(debug=True)

