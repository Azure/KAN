from core import Transform

class FilterTransform(Transform):
    def __init__(self, labels=None, confidence_threshold=None):
        super().__init__()

        self.labels = labels
        self.confidence_threshold = confidence_threshold


    def process(self, frame):

        new_objects_meta = []

        #print(self.labels, self.confidence_threshold)

        for object_meta in frame.insights_meta.objects_meta:
            if self.labels:
                if object_meta.label not in self.labels:
                    continue
            if self.confidence_threshold:
                if object_meta.confidence < self.confidence_threshold:
                    continue

            new_objects_meta.append(object_meta)

        frame.insights_meta.objects_meta = new_objects_meta
