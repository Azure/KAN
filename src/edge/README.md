# SYMPHONY AI Container

_(last edit: 4/24/2023)_

SYMPHONY AI container is a Docker container that gets deployed when you deploy your AI solution to a computer device. It runs as an IoT Edge module when deployed to Azure IoT Edge, or as a Kubernetes pod when deployed to Kubernetes. You can use the provided ```devops.py``` Python script to build this container image yourself.

## 0. Prerequisites
* [Docker](https://www.docker.com/products/docker-desktop)
  > **NOTE:** Some tools we use work better with access to docker commands without sudo. Use Docker Desktop version when possible. Otherwise, you need to add your user to docker group (see [instructions](https://www.docker.com/products/docker-desktop)). Please don't use rootless model, which isn't supported by some of the tools.
* Python 

## 1. Define environment variables

Define an environment variable that points to your container registry name:
```bash
export CONTAINER_REGISTRY_NAME=kanprod.azurecr.io # replace with your own container registry name
```
## 2. Install required packages
```bash
pip install -r requirements.txt
```
## 3. Build all the images
```bash    
python devops.py build-all
```
The above command build four SYMPHONY AI container images for different infrastructures:
| Image name| Infrastructure|
|--------|--------|
|```symphonyai:<version>-openvionamd64```|x64 CPU with OpenVino|
|```symphonyai:<version>-gpuamd64```|x64 CPU with Nvidia GPU|
|```symphonyai:<version>-amd64```|x64 CPU only|
|```symphonyai:<version>-jetson```|Nvidia Jetson platform|

## 4. Push images
```bash
python devops.py push-all
```

