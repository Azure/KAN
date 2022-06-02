from core import Transform

class FilterTransform(Transform):
    def process(self, frame):

        new_objects_meta = []
        label_filter = ['cat']

        for object_meta in frame.insights_meta.objects_meta:
            if object_meta.label in label_filter:
                print('ok')
                new_objects_meta.append(object_meta)
            else:
                print(object_meta.label)

        frame.insights_meta.objects_meta = new_objects_meta
