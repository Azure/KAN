# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import importlib
if not importlib.util.find_spec('common'):
    import sys
    sys.path.append('../../common')

from fastapi import FastAPI
from pydantic import BaseModel

from stream import Stream

from common.voe_status import ModuleStatus, StatusEnum
from common.voe_ipc import StreamingModule


app = FastAPI()



status = ModuleStatus()
status.set_waiting()


@app.get('/status')
async def get_status():
    return StreamingModule.Status(status=status.get()) 

streams = []


@app.post('/set')
def set_streams(setting: StreamingModule.Setting):


    #while len(streams) > 0:
    #    s = streams.pop()
    #    s.stop()
    #    s.join()

    status.set_creating()

    for cascade_config in setting.cascade_configs:
        s = Stream.from_cascade_config(cascade_config)
        s.start()
        streams.append(s)
        
    status.set_running()

    return StreamingModule.Status(status=status.get())
