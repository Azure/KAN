# KAN Portal

_(last edit: 4/24/2023)_

KAN Portal is packaged as a Docker container. We provide a ```Makefile``` for building the container and pushing the container to a container registry.

## 0. Prerequisites
* [Docker](https://www.docker.com/products/docker-desktop)
  > **NOTE:** Some tools we use work better with access to docker commands without sudo. Use Docker Desktop version when possible. Otherwise, you need to add your user to docker group (see [instructions](https://www.docker.com/products/docker-desktop)). Please don't use rootless model, which isn't supported by some of the tools.
* make and gcc
  ```bash
  sudo apt-get update && sudo apt-get upgrade -y
  sudo apt-get install make gcc -y
  ```
* Helm (optional for building Helm chart)

## 1. Create environment variables

Maintain a ```.env``` file under the **portal** folder with the following environment variables:

- Container registry:
```bash
    CONTAINER_REGISTRY_NAME="kanprod.azurecr.io" # replace with your own container registry name
``` 
- Azure application insights:
```bash
    APPLICATIONINSIGHTS_INSTRUMENTATION_KEY="testinstkey"
    APPLICATIONINSIGHTS_INGESTION_ENDPOINT="https://testinsight.in.applicationinsights.azure.com/"
    APPLICATIONINSIGHTS_TENANT_ID="app-insight-tenant-id"
    APPLICATIONINSIGHTS_CLIENT_ID="app-insight-client-id"
    APPLICATIONINSIGHTS_CLIENT_SECRET="app-insight-client-secret"
``` 
- Django secret: 
```bash
    SECRET_KEY="django-secret-key"
```
> **NOTE**: Django [SECRET_KEY](https://docs.djangoproject.com/en/dev/ref/settings/#secret-key) is a random string needed when starting django apps, which requires 50 characters in length with a minimum 5 unique characters.

## 2. Update version number
Update ```portal/modules/webmodule/version.txt``` to set the container image version. The built container will be tagged as ```<CONTAINER_REGISTRY_NAME>/kanportal:<version>-<CPU architecture>```, such as ```kanprod.azurecr.io/kanportal:0.41.46-amd64```.
> **NOTE**: The current ```Makefile``` builds for ```amd64``` only.

## 3. Build KAN Portal container

Build webmodule image
```bash
    # under src/portal folder
    . .env # apply environment variables
    make build
```

Push webmodule image
```
    make push
```
