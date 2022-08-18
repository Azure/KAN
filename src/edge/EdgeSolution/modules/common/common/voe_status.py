# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from enum import Enum
from pydantic import BaseModel

class StatusEnum(Enum):
    INIT = 'init'
    WAITING = 'waiting'
    CREATING = 'creating'
    RUNNING = 'running'


class ModuleStatus:
    def __init__(self):
        self.status = StatusEnum.INIT

    def get(self):
        return self.status

    def set_waiting(self):
        self.status = StatusEnum.WAITING

    def set_creating(self):
        self.status = StatusEnum.CREATING

    def set_running(self):
        self.status = StatusEnum.RUNNING

    @property
    def is_init(self):
        self.status == StatusEnum.INIT

    @property 
    def is_waiting(self):
        self.status == StatusEnum.WAITING

    @property
    def is_creating(self):
        self.status == StatusEnum.CREATING

    @property
    def is_running(self):
        self.running = StatusEnum.RUNNING
