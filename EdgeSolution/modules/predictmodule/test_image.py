import requests
import cv2

cap = cv2.VideoCapture(0)
_, img = cap.read()
h, w, _ = img.shape

print(img)

requests.post('http://localhost:8000/predict', files={'file': img}, params={'width': w, 'height': h})
