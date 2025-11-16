from flask import Blueprint, request, jsonify
from database import get_student_connection

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/submit', methods=['POST'])
def submit_account_data():
    conn = get_student_connection()
    cur = conn.cursor()

    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    # Student Fields

    stud_idnum = data.get('stud_idnum')
    stud_fname = data.get('stud_fname')
    stud_lname = data.get('stud_lname')
    stud_mname = data.get('stud_mname')
    stud_program = data.get('stud_program')
    stud_college = data.get('stud_college')
    stud_yearlevel = data.get('stud_yearlevel')
    stud_status = data.get('stud_status')

    cur.execute("""
        INSERT INTO ACCOUNT (ACC_EMAIL, ACC_PASSWORD_HASH, ACC_ROLE, ACC_isAPPROVED)
                VALUES (%s, %s, %s, %s)
                RETURNING ACC_ID
    """, (email, password, role, True))

    acc_id = cur.fetchone()[0]

    cur.execute("""
        INSERT INTO STUDENT (
                STUD_ID_NUMBER, 
                STUD_FNAME,
                STUD_LNAME,
                STUD_MNAME,
                STUD_PROGRAM,
                STUD_COLLEGE,
                STUD_YEAR,
                STUD_isIRREGULAR,
                STUD_EMAIL,
                ACC_ID
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (stud_idnum, stud_fname, stud_lname, stud_mname, stud_program, stud_college, stud_yearlevel, stud_status, email, acc_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Student Account is created successfully"}), 201


@student_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_student_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT ACC_PASSWORD_HASH, ACC_EMAIL, ACC_ID, ACC_ROLE FROM ACCOUNT
        WHERE ACC_EMAIL = %s AND ACC_ROLE = 'student' AND ACC_isAPPROVED = TRUE
    """, (email,))

    result = cur.fetchone()

    cur.close()
    conn.close()

    if not result:
        return jsonify({"error": "Invalid email or password"}), 401
    
    stored_password, acc_email, acc_id, acc_role = result

    if stored_password == password:  # Replace with hashed password check later!
        user = {
            "id": acc_id,
            "email": acc_email,
            "role": acc_role
        }
        return jsonify({"message": "Login successful", "user": user})
    else:
        return jsonify({"error": "Invalid email or password"}), 401