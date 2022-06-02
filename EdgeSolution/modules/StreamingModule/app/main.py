from enum import Enum
from stream import Stream
from cascade import CascadeConfig



if __name__ == '__main__':
    import json
    import cascade
    j = json.load(open('../sample.json'))
    c = cascade.CascadeConfig(**j)
    s = Stream.from_cascade_config(c)
    s.start()
    import time
    time.sleep(1)
    s.stop()
    s.join()
    

    #from IPython import embed; embed()


