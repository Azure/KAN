# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import queue
import threading
import copy

from frame import Frame, Image

class Element:
    def __init__(self):
        self._thread = threading.Thread(target=self.loop)
        self._thread.setDaemon(True)
        self._running = False
        self._children = []

    def loop(self):
        raise NotImplementedError

    def add_child(self, element):
        self._children.append(element)

    def start(self):
        self._running = True
        self._thread.start()

    def stop(self):
        self._running = False
        

    def join(self):
        self._thread.join()


class Source(Element):
    def __init__(self):
        super().__init__()
        
        self._children = []

    def loop(self):
        while True:
            frame = self.next_frame()
            for child in self._children:
                child.send(frame)

    def next_frame(self) -> Frame:
        raise NotImplementedError    


class Export(Element):
    def __init__(self):
        super().__init__()
        self._q = queue.Queue(maxsize=2)

    def loop(self):
        while True:
            frame = self._q.get()
            self.process(frame)

    def process(self, frame):
        raise NotImplementedError



    def send(self, frame):
        #FIXME dont deeply copy image
        frame = copy.deepcopy(frame)
        self._q.put(frame)


class Transform(Element):
    def __init__(self):
        super().__init__()
        self._q = queue.Queue(maxsize=2)

    def loop(self):
        while True:
            frame = self._q.get()
            self.process(frame)
            for child in self._children:
                child.send(frame)

    def process(self, frame):
        raise NotImplementedError

    def send(self, frame):
        #FIXME dont deeply copy image
        frame = copy.deepcopy(frame)
        self._q.put(frame)

class Model(Transform):
    def __init__(self):
        super().__init__()
