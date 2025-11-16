from flask import Blueprint, request, jsonify
from database import get_admin_connection

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/submit', methods=['POST'])
def submit_account_data():
    conn = get_admin_connection()
    cur = conn.cursor()

    data = request.json 
    # Account details
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    # Admin details
    admin_fname = data.get('admin_fname')
    admin_lname = data.get('admin_lname')
    admin_mname = data.get('admin_mname')
    admin_contact = data.get('admin_contact')

    cur.execute("""
        INSERT INTO ACCOUNT (ACC_EMAIL, ACC_PASSWORD_HASH, ACC_ROLE, ACC_isAPPROVED)
                VALUES (%s, %s, %s, %s)
                RETURNING ACC_ID
    """, (email, password, role, True)) 
    # originally False, changed to True for testing
    # should have verification or admin approval to turn it to True
    acc_id = cur.fetchone()[0]

    cur.execute("""
        INSERT INTO ADMIN (
                ADMIN_FNAME, ADMIN_LNAME, ADMIN_MNAME, ADMIN_CONTACT_NUMBER, ADMIN_EMAIL, ACC_ID) VALUES (%s, %s, %s, %s, %s, %s)
    """, (admin_fname, admin_lname, admin_mname, admin_contact, email, acc_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Please wait for admin approval."}), 201

@admin_bp.route('/login', methods=['POST'])
def login():
    print("Login route was called")
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_admin_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT ACC_PASSWORD_HASH, ACC_EMAIL, ACC_ID, ACC_ROLE FROM ACCOUNT
        WHERE ACC_EMAIL = %s AND ACC_ROLE = 'admin' AND ACC_isAPPROVED = TRUE
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
        print("Password mismatch")
        return jsonify({"error": "Invalid email or password"}), 401