#!/home/yumon/PTCam/PTCam-virtualenv/bin/python3
from flask_socketio import SocketIO
from flask import Flask, render_template, request, Response, send_from_directory
import os
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin
import api_config
import json
#eventlet.monkey_patch()

app = Flask(__name__)
cors = CORS(app, support_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

socketio = SocketIO(app)#, async_mode='threading')

socketio.init_app(app, cors_allowed_origins="*")

app.config["MONGO_URI"] = api_config.MONGO_URI
mongo = PyMongo(app)


#get all data in the bubbles collection
@app.route("/api/getData", methods=['POST'])
def getData():
    res = []
    for entry in mongo.db.bubbles.find():
        b = {}
        b['id']= entry['id']
        b['coord']= entry['coord']
        b['title']= entry['title']
        b['date']= entry['date']
        b['situation']=entry['situation']
        b['thoughts']= entry['thoughts']
        b['feelings']=entry['feelings']
        b['tags']=entry['tags']
        res.append(b)
    message = {'success': True}
    message['data'] = res
    return message

# this is our create method
# this method adds new data in our database
@app.route("/api/putData", methods=['POST'])
def putData():
    message = request.get_json()
    if(not ('id' in message) or not ('coord' in message) or len(message['coord'])!=2):
        message['sussess'] = False
        message['error'] = 'INVALID INPUTS'
        return message, 400

    bubble = {}
    bubble['id'] = message['id']
    bubble['coord'] = message['coord']
    bubble['title'] = message['title']
    bubble['date'] = message['date']
    bubble['situation'] = message['situation']
    bubble['thoughts'] = message['thoughts']
    bubble['feelings'] = message['feelings']
    bubble['tags']  = message['tags']
    if('active' in message):
        bubble['active'] = message['active']

    bubbles = mongo.db.bubbles
    #try??
    bubbles.update_one({'id': message['id']}, {'$set':bubble}, upsert=True)

    message['success']=True
    return message

# this is our update method
# this method overwrites existing data in our database
@app.route('/api/updateData', methods=['POST'])
def updateData():
    message = request.get_json()
    if(not ('id' in message) or not ('coord' in message) or len(message['coord'])!=2):
        message['sussess'] = False
        message['error'] = 'INVALID QUERY'
        return message, 400
    bubble = {}
    bubble['id'] = message['id']
    bubble['coord'] = message['coord']
    bubble['title'] = message['title']
    bubble['date'] = message['date']
    bubble['situation'] = message['situation']
    bubble['thoughts'] = message['thoughts']
    bubble['feelings'] = message['feelings']
    bubble['tags']  = message['tags']
    if('active' in message):
        bubble['active'] = message['active']

    bubbles = mongo.db.bubbles
    #try??
    bubbles.find_one_and_update({'id': message['id']}, {'$set': bubble})

    message['success']=True
    return message

# this is our delete method
# this method removes existing data in our database
@app.route('/api/deleteData', methods=["DELETE"])
def deleteData():
    message = request.get_json()
    if(not ('id' in message)):
        message['sussess'] = False
        message['error'] = 'INVALID DELETE'
        return message, 400

    bubbles = mongo.db.bubbles
    old = bubbles.find_one_and_delete({'id': message['id']})
    if (old is None):
        message['success']=False
        message['error']="Bubble Not Found"
    else:
        message['success']=True
    return message

@socketio.on('connect', namespace='/web')
def connect_web():
    print('[INFO] Web client connected: {}'.format(request.sid))

@socketio.on('disconnect', namespace='/web')
def disconnect_web():
    print('[INFO] Web client disconnected: {}'.format(request.sid))

@socketio.on('addedToDB')
def added_to_db(bubble):
    print("[socket.on] addedToDB", bubble)
    socketio.emit('addToClients', bubble)

@socketio.on('updatedDB')
def updated_db(bubble):
    print("updatedDB", bubble)
    socketio.emit('updateClients', bubble)

@socketio.on('deletedInDB')
def deleted_in_db(bid):
    print('deletedInDB', bid)
    socketio.emit('deleteInClients', bid)

if __name__ == "__main__":
    print('[INFO] Starting server at http://localhost:5001')
    socketio.run(app=app, host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 5001)))
    #thread_flask = threading.Thread(target=socketio.run, args=(app,),
    #    kwargs=dict(host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 5001))))  # eventlet server
    #thread_flask.daemon = True
    #thread_flask.start()
    #eventlet.spawn_n(socketio.run, app, host=os.getenv('IP', '0.0.0.0'), port=int(os.getenv('PORT', 5001)))

