import sqlite3
from flask import g

DATABASE_URI = "users.db"

def get_db():
    conn = sqlite3.connect(DATABASE_URI)
    return conn




def disconnect_db():
    db = getattr(g,'db',None)
    if db is not None:
        g.db.close()
        g.db = None


def save_user(email,first_name,last_name,password_hash, gender , city , country, salt):
    db = get_db()
    cursor = db.cursor()
    statement = "INSERT INTO users(email,first_name,last_name,password_hash,gender , city , country, salt) VALUES (?,?,?,?,?,?,?,?)"
    cursor.execute(statement, [email,first_name, last_name, password_hash, gender , city , country, salt])
    db.commit()
    return True


def sign_in(email):
    cursor = get_db().execute("select email,password_hash, salt from users where email like ?", [email])
    user = cursor.fetchone()
    ##if not user:
        ##return False
    return user


def get_users():
    db = get_db()
    cursor = db.cursor()
    query = "SELECT * FROM users"
    cursor.execute(query)
    data = cursor.fetchall()
    return data

def finduser(email):
    email = email
    cursor = get_db().execute("select * from users where email like ?", [email])
    user = cursor.fetchone()
    return user

def change_password(new_password, email): #password = newpassword
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", [new_password, email])
        db.commit()
        return True
    except:
        return False


def addpost(sender, receiver, message, location):
    try:
        db = get_db()
        cursor = db.cursor()
        statement = "INSERT INTO messages VALUES (?, ?, ?, ?)"
        cursor.execute(statement ,[receiver,sender, message, location])
        db.commit()
        return True
    except:
        return False

def findposts_email(email):
    result = []
    db = get_db()
    cursor = db.cursor()
    query = "SELECT  * FROM messages WHERE recepient = ?"
    cursor.execute(query,[email])
    rows = cursor.fetchall()
    for i in range(len(rows)):
        result.append({'writer':rows[i][1], 'content':rows[i][2], 'location':rows[i][3]})
    return result
