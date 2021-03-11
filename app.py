from flask import  Flask,jsonify,request
import database_helper
import secrets
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketError
import os
import json
from flask_bcrypt import Bcrypt

app = Flask(__name__)
bcrypt = Bcrypt(app)


clientSockets = {}
loggedInUsers = {}


@app.route('/api')
def api():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while not ws.closed :
            message = ws.receive()
            try:
                msg = json.loads(message)
                if msg["type"] == "login":
                    print(msg['type'])
                    email = msg['email']
                    if email in clientSockets.keys():
                        sendMsg = {}
                        sendMsg["type"] = "logout"
                        clientSockets[email].send(json.dumps(sendMsg))
                        clientSockets[email] = ws
                    else:
                        clientSockets[email] = ws
                else:
                    print("Unknown message received")
            except:
                print(message)
        if ws == clientSockets[email]:
            del clientSockets[email]
    return 'all good'


## Client route

@app.route("/" , methods = ['GET' , 'POST'])
def start():
    return app.send_static_file("client.html")


## Sign up


@app.route('/sign_up' , methods= ['GET' ,'POST'])
def sign_up():

    email       =  request.json.get('email'     , None)
    first_name  =  request.json.get('firstname', None)
    last_name   =  request.json.get('familyname' , None)
    password    =  request.json.get('password'  , None)
    gender      =  request.json.get('gender'    , None)
    city        =  request.json.get('city'      , None)
    country     =  request.json.get('country'   , None)

    if not email:
        return jsonify({"success": False,"msg": "Missing email parameter"}), 400
    if not first_name:
        return jsonify({"success": False,"msg": "Missing first name parameter"}), 400
    if not last_name:
        return jsonify({"success": False,"msg": "Missing last name parameter"}), 400
    if not password:
        return jsonify({"success": False,"msg": "Missing password parameter"}), 400
    if len(password) < 10:
        return jsonify({"success": False,"msg": "Password length not sufficient"}), 400
    if not gender:
        return jsonify({"success": False,"msg": "Missing gender parameter"}), 400
    if not city:
        return jsonify({"success": False,"msg": "Missing city parameter"}), 400
    if not country:
        return jsonify({"success": False,"msg": "Missing country parameter"}), 400

    salt = os.urandom(10)
    password_hash = bcrypt.generate_password_hash(password + salt)
    result = database_helper.save_user(email,first_name,last_name,password_hash,gender , city , country, salt)
    print (email)
    print (password_hash)
    print (salt)

    if (result == True):
        return jsonify({"success": True,"msg": "User saved."}), 200
    else:
        return jsonify({"success": False,"msg": "Something went wrong."}), 500



## Get all users

@app.route('/users', methods=["GET"])
def get_games():
    users = database_helper.get_users()
    return jsonify(users)



## Sign in


@app.route('/sign_in',methods = ['GET' , 'POST'])
def sign_in():


    email = request.json.get('email', None)
    password = request.json.get('password', None)
    if not email:
        return jsonify({"success": False,"msg": "Missing email parameter"}), 400
    if len(password) < 10:
        return jsonify({"success": False,"msg": "Password length not sufficient"}), 400

    user = database_helper.sign_in(email)
    stored_pw = user[1]
    salt = user[2]
    result = bcrypt.check_password_hash(stored_pw, password + salt)

    if (result == True):
        token = secrets.token_hex(16)
        loggedInUsers[token] = email
        return jsonify({"success": True,"msg": "User authenticated","token":token}), 200
    else:
        return jsonify({"success": False,"msg": "Password did no match"}), 400


## Sign out


@app.route('/sign_out', methods = ['POST'])
def sign_out():
    token = request.json['token']
    email = loggedInUsers.get(token)
    #print(email)
    if token in loggedInUsers:
        del loggedInUsers[token]
        return jsonify({"success":True,"msg": "Signed out"}), 200
    else:
        return jsonify({"success": False,"msg": "Token not valid"}), 400



## Get user data by token

@app.route('/data_by_token', methods = ['GET' , 'POST'])
def get_by_token():
    token = request.json['token']
    email = loggedInUsers.get(token)
    if email is None:
        return jsonify({"success":False,"message":"No such token."})
    else:
        resp_data = get_user_data_by_email(email)
        return resp_data

## Get data by email

@app.route('/data_email/<email>', methods = ['GET','POST'])
def get_user_data_by_email(email):
    if email is not None:
        user = database_helper.finduser(email)
        if user:
            data = {
                "email" : user[0],
                "familyname":user[1],
                "firstname" : user[2],
                "password_hash" : user[3],
                "gender" : user[4],
                "city" : user[5],
                "country" : user[6]
            }
            return jsonify({"success": True, "message": "Retrieved email successfully.", "data": data}),200
        else:
            return jsonify({"success": False, "message": "Un-successful"}),400


## Change password

@app.route('/change_password', methods=['POST','GET'])
def change_password():
    token = request.json['token']
    email = loggedInUsers.get(token)
    if email is None:
        return jsonify({"success": False, "message": "No such token."}) ,400

    new_password = request.json.get('newpassword', None)
    old_password = request.json.get('oldpassword', None)
    old_result = database_helper.sign_in(email,old_password)
    if (old_result == False):
        return jsonify({"success": False, "message": "Old password not right"}) ,400
    else:
        new_password_hash = bcrypt.generate_password_hash(new_password)
        new_result = database_helper.change_password(new_password ,email)
    if (new_result == True):
        return jsonify({"success": True, "message": "Password successfully changed", "data": ""}),200
    else:
        return jsonify({"success": False, "message": "Could not change password", "data": ""}) ,400



## Get messages by token


@app.route('/messages_token', methods = ['GET' , 'POST'])
def get_user_messages_by_token():
    token = request.json['token']
    email = loggedInUsers.get(token)
    if email is None:
        return jsonify({"success": False, "message": "No such token."}),400
    else:
        return messages_email(email)



## Get messages by email

@app.route('/messages_email/<email>', methods = ['GET' , 'POST'])
def messages_email(email):
    messages = database_helper.findposts_email(email)

    if messages is None:
        return jsonify({"success":False , "msg":"no messages"}),400
    else:
        return jsonify(messages)


## Post message

@app.route('/post_message', methods = ['POST' ])
def post_message():
    token = request.json['token']
    message = request.json['message']
    reciever = request.json['email']
    location = request.json['location']
    sender = loggedInUsers.get(token)
    res = database_helper.addpost(sender, reciever, message, location)
    if (res == False):
        return jsonify({"success": False, "message": "Messa"}),400
    return jsonify({"success": True, "message": "Message has been sent"})

port = int(os.environ.get('PORT', 8000))

if "__name__" == "__main__":
    http_server = WSGIServer(('0.0.0.0', port), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
    #app.run(debug = True)
