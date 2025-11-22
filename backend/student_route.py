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
    
@student_bp.route('/get_profile', methods=["GET"])
def get_profile():
    acc_id = request.args.get('acc_id')
    # email = request.args.get('email')

    conn = get_student_connection()
    cur = conn.cursor()

    # Now fetch profile using acc_id
    cur.execute("""
        SELECT 
            STUD_ID_NUMBER, 
            STUD_FNAME,
            STUD_LNAME,
            STUD_MNAME,
            STUD_PROGRAM,
            STUD_COLLEGE,
            STUD_YEAR,
            STUD_isIRREGULAR,
            STUD_EMAIL
        FROM STUDENT
        WHERE ACC_ID = %s
    """, (acc_id,))

    result = cur.fetchone()

    cur.close()
    conn.close()

    if not result:
        return jsonify({"error": "Profile not found"}), 404
    
    profile = {
        "stud_idnum": result[0],
        "stud_fname": result[1],
        "stud_lname": result[2],
        "stud_mname": result[3],
        "stud_program": result[4],
        "stud_college": result[5],
        "stud_yearlevel": result[6],
        "stud_status": result[7],
        "stud_email": result[8]
    }

    return jsonify({"profile": profile})


@student_bp.route('/update_profile', methods=["POST"])
def update_profile():
    # Expect JSON payload with acc_id and fields to update
    data = request.json or {}
    acc_id = data.get('acc_id') or request.args.get('acc_id')
    if not acc_id:
        return jsonify({"error": "acc_id is required"}), 400

    # Map incoming field names to DB columns
    contact = data.get('contactNumber')
    barangay = data.get('barangay')
    address = data.get('address')
    em_name = data.get('emName')
    em_num = data.get('emNumber')

    conn = get_student_connection()
    cur = conn.cursor()

    # Update only the provided fields
    update_parts = []
    params = []
    if contact is not None:
        update_parts.append('STUD_CONTACT_NUMBER = %s')
        params.append(contact)
    if barangay is not None:
        update_parts.append('STUD_BARANGAY = %s')
        params.append(barangay)
    if address is not None:
        update_parts.append('STUD_ADDRESS = %s')
        params.append(address)
    if em_name is not None:
        update_parts.append('STUD_EMERG_CONTACT_NAME = %s')
        params.append(em_name)
    if em_num is not None:
        update_parts.append('STUD_EMERG_CONTACT_NUM = %s')
        params.append(em_num)

    if update_parts:
        sql = f"UPDATE STUDENT SET {', '.join(update_parts)} WHERE ACC_ID = %s"
        params.append(acc_id)
        cur.execute(sql, tuple(params))
        conn.commit()

    # Return the updated profile (same shape as get_profile)
    cur.execute("""
        SELECT 
            STUD_ID_NUMBER, 
            STUD_FNAME,
            STUD_LNAME,
            STUD_MNAME,
            STUD_PROGRAM,
            STUD_COLLEGE,
            STUD_YEAR,
            STUD_isIRREGULAR,
            STUD_EMAIL,
            STUD_CONTACT_NUMBER,
            STUD_BARANGAY,
            STUD_ADDRESS,
            STUD_EMERG_CONTACT_NAME,
            STUD_EMERG_CONTACT_NUM
        FROM STUDENT
        WHERE ACC_ID = %s
    """, (acc_id,))

    result = cur.fetchone()
    cur.close()
    conn.close()

    if not result:
        return jsonify({"error": "Profile not found"}), 404

    profile = {
        "stud_idnum": result[0],
        "stud_fname": result[1],
        "stud_lname": result[2],
        "stud_mname": result[3],
        "stud_program": result[4],
        "stud_college": result[5],
        "stud_yearlevel": result[6],
        "stud_status": result[7],
        "stud_email": result[8],
        "stud_contact": result[9],
        "stud_barangay": result[10],
        "stud_address": result[11],
        "em_name": result[12],
        "em_phone": result[13]
    }

    return jsonify({"message": "Profile updated", "profile": profile})



