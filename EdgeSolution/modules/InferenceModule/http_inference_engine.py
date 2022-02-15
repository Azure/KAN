"""HttpInferenceEngine.
"""

import logging
import sys

logger = logging.getLogger(__name__)


class HttpInferenceEngine:
    def __init__(self, stream_manager):
        self.stream_manager = stream_manager

    def predict(self, cam_id, img):
        """predict.
        """
        stream = self.stream_manager.get_stream_by_id(cam_id)
        # logger.info(cam_id)
        predictions = []
        if not stream:
            predictions = []
            logger.info("Stream not ready yet.")
            return []

        try:
            stream.predict(img)
            if stream.last_prediction:
                predictions = stream.last_prediction
            else:
                predictions = []
            #logger.info("Predictions %s", predictions)
        except:
            logger.error("Unexpected error: %s", sys.exc_info())

        results = []
        if 'ovmsserver' in stream.model.endpoint:
            for prediction in predictions:
                results.append(prediction)
        else:
            for prediction in predictions:
                tag_name = prediction["tagName"]
                confidence = prediction["probability"]
                box = {
                    "l": prediction["boundingBox"]["left"],
                    "t": prediction["boundingBox"]["top"],
                    "w": prediction["boundingBox"]["width"],
                    "h": prediction["boundingBox"]["height"],
                }
                results.append(
                    {
                        "type": "entity",
                        "entity": {
                            "tag": {"value": tag_name, "confidence": confidence},
                            "box": box,
                        },
                    }
                )
        return results
