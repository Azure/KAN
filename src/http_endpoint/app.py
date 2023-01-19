#from fastapi import FastAPI, Request

#app = FastAPI()

#@app.post("/")
#def result(r: Request):
#    j = await r.json()
#    print(j)
#    return 'ok'

from flask import request
from flask import Flask
import json

app = Flask(__name__)

last_result = {'_default_': {}}



@app.route("/", methods=["GET", "POST"])
def hello_world():
    if request.method == 'POST':
        #print(request.form)
        last_result['_default_'] = request.json
        print(last_result['_default_'])
        return 'ok'
    else:
        q = json.dumps(last_result['_default_'], indent=4, sort_keys=True)
        return q
        #return json.loads(last_result['r'])

@app.route("/<name>", methods=["GET", "POST"])
def hello_world2(name):
    if request.method == 'POST':
        #print(request.form)
        last_result[name] = request.json
        print(last_result[name])
        return 'ok'
    else:
        if name not in last_result: last_result[name] = {}
        q = json.dumps(last_result[name], indent=4, sort_keys=True)
        return q
        #return json.loads(last_result[name])
