# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import importlib
if not importlib.util.find_spec('common'):
    import sys
    sys.path.append('../../common')

from stream import Stream
import time

from common.voe_ipc import StreamingModuleSetting

class StreamingModule:

    def __init__(self):
        self.streams = []

    def start(self, setting: StreamingModuleSetting):
        
        for cascade_config in setting.cascade_configs:
            s = Stream.from_cascade_config(cascade_config)
            s.start()
            self.streams.append(s)

    def join(self):
        for s in self.streams:
            s.join()
        

streaming_module = StreamingModule()
