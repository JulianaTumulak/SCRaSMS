import psycopg2
from psycopg2.extras import RealDictCursor

def get_student_connection():
    return psycopg2.connect(
        host="localhost",
        database="SCRaSMS",
        user="student_user",
        password="studentGroup5"
    )

def get_admin_connection():
    return psycopg2.connect(
        host="localhost",
        database="SCRaSMS",
        user="admin_user",
        password="adminJuls"
    )