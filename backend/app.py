from flask import Flask
from flask_cors import CORS

from student_route import student_bp
from admin_route import admin_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(admin_bp, url_prefix='/admin')

if __name__ == '__main__':
    app.run(debug=True)

