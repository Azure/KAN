import requests
import cv2

#cap = cv2.VideoCapture(0)
#_, img = cap.read()
img = cv2.imread('peyman.png')
h, w, _ = img.shape

print(img)

r = requests.post(f'http://localhost:5004/predict/cv-model-od', files={'file': img}, params={'width': w, 'height': h})
print(r.json())
