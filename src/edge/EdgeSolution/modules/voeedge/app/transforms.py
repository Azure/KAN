# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from node import Transform

class FilterTransform(Transform):
    def __init__(self, labels=None, confidence_threshold=None):
        super().__init__()

        if confidence_threshold is not None: 
            confidence_threshold = float(confidence_threshold)

        if labels is None:
            self.labels = []
        else:
            try:
                self.labels = eval(labels)
            except:
                print(f'Unknown labels {labels}', labels)
                self.labels = []

        self.confidence_threshold = confidence_threshold


    def process(self, frame):

        new_objects_meta = []

        #print(self.labels, self.confidence_threshold)

        print(frame.insights_meta.objects_meta)

        for object_meta in frame.insights_meta.objects_meta:
            if self.labels:
                if object_meta.label not in self.labels:
                    continue
            if self.confidence_threshold:
                if object_meta.confidence < self.confidence_threshold / 100:
                    continue

            new_objects_meta.append(object_meta)

        frame.insights_meta.objects_meta = new_objects_meta
