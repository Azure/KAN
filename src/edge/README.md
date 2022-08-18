# Vision on Edge

# devops.py

A tool for building containers

create a .env file under EdgeSolution and contains Container registry name here

    CONTAINER_REGISTRY_NAME=testvoe.azurecr.io

Install requirements
 
    pip install -r requirements.txt

Build all the images
    
    python devops.py build-all
    
Push images

    python devops.py push-all

