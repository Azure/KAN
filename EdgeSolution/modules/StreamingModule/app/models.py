from core import Model

from frame import Frame, Bbox, ObjectMeta

class FakeModel(Model):
    def process(self, frame):

        fake_bbox1 = Bbox(l=0.1, t=0.1, w=0.1, h=0.1)
        object_meta1 = ObjectMeta(label='person', bbox=fake_bbox1, confidence=0.5)

        fake_bbox2 = Bbox(l=0.4, t=0.4, w=0.1, h=0.1)
        object_meta2 = ObjectMeta(label='cat', bbox=fake_bbox2, confidence=0.9)

        frame.insights_meta.objects_meta.append(object_meta1)
        frame.insights_meta.objects_meta.append(object_meta2)
