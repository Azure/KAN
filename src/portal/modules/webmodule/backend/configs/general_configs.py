# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""Project General Configs
"""
import os

if "PRINT_THREAD" in os.environ and os.environ.get("PRINT_THREAD") in [
    "True",
    "true",
    "1",
]:
    PRINT_THREAD = True
else:
    PRINT_THREAD = False


def get_create_demo():
    if "CREATE_DEMO" in os.environ and os.environ.get("CREATE_DEMO") in [
        "False",
        "false",
        "0",
    ]:
        return False
    # return True
    return False  # not creating demo cameras/projects/locations for now
