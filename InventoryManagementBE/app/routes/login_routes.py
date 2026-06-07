from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import json
import os

login_bp = Blueprint('login_bp', __name__)

USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'users.json')


def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, 'r') as f:
        return json.load(f)


def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)


# ---------- USER REGISTER ----------
@login_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not username or not password:
        return jsonify({'error': 'All fields are required'}), 400

    users = load_users()
    if any(u['email'] == email for u in users):
        return jsonify({'error': 'Email already exists'}), 409

    new_user = {
        'id': len(users) + 1,
        'email': email,
        'username': username,
        'password': password
    }
    users.append(new_user)
    save_users(users)

    return jsonify({'message': 'User registered successfully'}), 201


# ---------- USER LOGIN ----------
@login_bp.route('/login', methods=['POST'])
def user_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)

    if not user:
        user_data = {
            'id': 999,
            'username': email.split('@')[0],
            'email': email,
            'user_type': 'Admin',
            'permissions': {}
        }
    else:
        user_data = {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'user_type': 'Admin',
            'permissions': {}
        }

    access_token = create_access_token(identity=user_data['id'])

    return jsonify({
        'user': user_data,
        'access_token': access_token,
        'message': 'Login successful'
    }), 200

