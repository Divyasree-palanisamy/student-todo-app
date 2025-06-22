import os
import mysql.connector
from mysql.connector import Error
from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
import click
from flask.cli import with_appcontext
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv() # Load environment variables from .env file

# --- App Configuration ---
app = Flask(__name__)
# It's recommended to load these from a .env file for security
app.config['SECRET_KEY'] = 'your_secret_key_super_secure'
app.config['JWT_SECRET_KEY'] = 'another_super_secret_key_for_jwt'

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

# Initialize Twilio client only if credentials are provided
twilio_client = None
if all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
else:
    print("Warning: Twilio credentials not found. WhatsApp notifications will be disabled.")

CORS(app, origins="http://localhost:3000", supports_credentials=True)
bcrypt = Bcrypt(app)


# --- Database Connection ---
def get_db_connection():
    """Establishes a connection to the MySQL database."""
    # These should ideally be loaded from environment variables
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': 'Divya@2004',
        'database': 'student_todo_b' # Using a new DB name
    }
    try:
        conn = mysql.connector.connect(**db_config)
        print("MySQL Database connection successful")
        return conn
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

# --- Database Initialization ---
def init_db():
    """Creates the database and tables if they don't exist."""
    try:
        # Connect without specifying a database to create it
        conn = mysql.connector.connect(host='localhost', user='root', password='Divya@2004')
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS student_todo_b")
        cursor.execute("USE student_todo_b")
        print("Database 'student_todo_b' is ready.")

        # Table creation queries
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20)
        );
        """
        tasks_table = """
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            due_date DATE,
            completed BOOLEAN DEFAULT FALSE,
            missed BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
        subjects_table = """
        CREATE TABLE IF NOT EXISTS subjects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
        files_table = """
        CREATE TABLE IF NOT EXISTS files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            subject_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            path VARCHAR(255) NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        );
        """

        cursor.execute(users_table)
        print("Table 'users' is ready.")
        cursor.execute(tasks_table)
        print("Table 'tasks' is ready.")
        cursor.execute(subjects_table)
        print("Table 'subjects' is ready.")
        cursor.execute(files_table)
        print("Table 'files' is ready.")
        conn.commit()
        cursor.close()
        conn.close()
    except Error as e:
        print(f"Error during database initialization: {e}")


@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

app.cli.add_command(init_db_command)


# --- Token Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            
            conn = get_db_connection()
            if not conn:
                 return jsonify({"error": "Database connection failed"}), 500
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE id = %s", (data.get('user_id'),))
            current_user = cursor.fetchone()
            cursor.close()
            conn.close()

            if not current_user:
                return jsonify({'message': 'Token is invalid!'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
        return f(current_user, *args, **kwargs)
    return decorated


# --- API Routes ---
@app.route('/api/test', methods=['GET'])
@token_required
def test_route(current_user):
    """A simple test route to confirm the server is running."""
    return jsonify({"message": "Flask server is running!"})

# --- Authentication Routes ---
@app.route('/api/signup', methods=['POST'])
def signup():
    """Handles new user registration."""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not all([username, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "User with this email already exists"}), 409
        
        # Hash password and insert new user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        cursor.execute(
            "INSERT INTO users (username, email, password, phone) VALUES (%s, %s, %s, %s)",
            (username, email, hashed_password, phone)
        )
        conn.commit()
        return jsonify({"message": "Signup successful!"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Handles user login and JWT generation."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and isinstance(user, dict) and bcrypt.check_password_hash(user.get('password'), password):
            # Generate JWT token
            token = jwt.encode({
                'user_id': user.get('id'),
                'exp': datetime.utcnow() + timedelta(days=7)
            }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                "message": "Login successful",
                "token": token,
                "username": user.get('username'),
                "email": user.get('email'),
                "phone": user.get('phone') # Return phone number
            }), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# --- Task Management Routes ---
@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    """Fetches all tasks for the logged-in user."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        user_id = current_user.get('id') if isinstance(current_user, dict) else None
        if not user_id:
            return jsonify({"error": "Invalid user data"}), 401
        cursor.execute("SELECT * FROM tasks WHERE user_id = %s", (user_id,))
        tasks = cursor.fetchall()
        return jsonify(tasks)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/tasks', methods=['POST'])
@token_required
def add_task(current_user):
    """Adds a new task for the logged-in user."""
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    due_date_str = data.get('dueDate') # Matches frontend key

    if not title:
        return jsonify({"error": "Title is required"}), 400

    # Determine if the task is missed
    is_missed = False
    due_date = None
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
            if due_date < datetime.now().date():
                is_missed = True
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        query = "INSERT INTO tasks (user_id, title, description, due_date, missed) VALUES (%s, %s, %s, %s, %s)"
        user_id = current_user.get('id') if isinstance(current_user, dict) else None
        if not user_id:
            return jsonify({"error": "Invalid user data"}), 401
        cursor.execute(query, (user_id, title, description, due_date, is_missed))
        conn.commit()
        return jsonify({"message": "Task added successfully"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    """Updates a task's status (e.g., marks as complete or not missed)."""
    data = request.get_json()
    
    # Build the query dynamically based on the fields provided
    update_fields = []
    update_values = []

    if 'completed' in data:
        update_fields.append("completed = %s")
        update_values.append(data['completed'])
    
    if 'missed' in data:
        update_fields.append("missed = %s")
        update_values.append(data['missed'])

    if not update_fields:
        return jsonify({"error": "No update fields provided"}), 400

    update_values.extend([task_id, current_user['id']])
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = %s AND user_id = %s"
        cursor.execute(query, tuple(update_values))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Task not found or you don't have permission to update it"}), 404
            
        return jsonify({"message": "Task updated successfully"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    """Deletes a task for the logged-in user."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        user_id = current_user['id']

        # Ensure the task belongs to the user
        cursor.execute("SELECT * FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
        task = cursor.fetchone()
        if not task:
            return jsonify({"error": "Task not found or permission denied"}), 404

        cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
        conn.commit()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# --- Study Material Routes ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER)):
    os.makedirs(os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER))

@app.route('/api/subjects', methods=['POST'])
@token_required
def add_subject(current_user):
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"error": "Subject name is required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        query = "INSERT INTO subjects (user_id, name) VALUES (%s, %s)"
        cursor.execute(query, (current_user['id'], name))
        conn.commit()
        return jsonify({"message": "Subject added successfully", "subject_id": cursor.lastrowid}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/subjects', methods=['GET'])
@token_required
def get_subjects(current_user):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT s.id, s.name, COUNT(f.id) as file_count
            FROM subjects s
            LEFT JOIN files f ON s.id = f.subject_id
            WHERE s.user_id = %s
            GROUP BY s.id, s.name
        """
        cursor.execute(query, (current_user['id'],))
        subjects = cursor.fetchall()
        return jsonify(subjects), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/subjects/<int:subject_id>/files', methods=['POST'])
@token_required
def upload_file(current_user, subject_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename:
        filename = file.filename
        # Save to a dedicated uploads folder inside the backend directory
        upload_path = os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER, filename)
        file.save(upload_path)

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        try:
            cursor = conn.cursor()
            # We store the relative path for serving later
            db_path = f"{UPLOAD_FOLDER}/{filename}"
            query = "INSERT INTO files (subject_id, name, path) VALUES (%s, %s, %s)"
            cursor.execute(query, (subject_id, filename, db_path))
            conn.commit()
            return jsonify({"message": "File uploaded successfully"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()
    return jsonify({"error": "Invalid file"}), 400

@app.route('/api/subjects/<int:subject_id>/files', methods=['GET'])
@token_required
def get_files(current_user, subject_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM subjects WHERE id = %s AND user_id = %s", (subject_id, current_user['id']))
        if not cursor.fetchone():
            return jsonify({"error": "Subject not found or permission denied"}), 404
        
        cursor.execute("SELECT id, name, path FROM files WHERE subject_id = %s", (subject_id,))
        files = cursor.fetchall()
        return jsonify(files), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER), filename)

@app.route('/')
def index():
    """A simple route to confirm the server is running."""
    return jsonify({"message": "Flask backend is running correctly!"})

# --- Notification Route ---
@app.route('/api/send-notification', methods=['POST'])
@token_required
def send_notification(current_user):
    if not twilio_client:
        return jsonify({"error": "Twilio is not configured on the server."}), 500

    data = request.get_json()
    message_body = data.get('body')
    
    # Send all notifications to your verified WhatsApp number
    verified_whatsapp_number = "whatsapp:+917010669571" 
    twilio_whatsapp_number = f"whatsapp:{TWILIO_PHONE_NUMBER}"

    if not message_body:
        return jsonify({"error": "Message body is missing"}), 400

    try:
        message = twilio_client.messages.create(
            body=message_body,
            from_=twilio_whatsapp_number,
            to=verified_whatsapp_number
        )
        return jsonify({"message": f"WhatsApp message sent to {verified_whatsapp_number}", "sid": message.sid}), 200
    except Exception as e:
        print(f"--- TWILIO ERROR ---: {e}") # Keep this for real errors
        return jsonify({"error": "Failed to send WhatsApp notification."}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000) 