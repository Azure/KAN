# Portal


## Makefile

A script for building/pushing portal modules

## Prerequisites
Maintain a .env file under **portal** which contains environment variables as shown below:

- Container registry name:
```
    CONTAINER_REGISTRY_NAME="testvoe.azurecr.io"
``` 
- Azure application insights:
```
    APPLICATIONINSIGHTS_INSTRUMENTATION_KEY="testinstkey"
    APPLICATIONINSIGHTS_INGESTION_ENDPOINT="https://testinsight.in.applicationinsights.azure.com/"
    APPLICATIONINSIGHTS_TENANT_ID="app-insight-tenant-id"
    APPLICATIONINSIGHTS_CLIENT_ID="app-insight-client-id"
    APPLICATIONINSIGHTS_CLIENT_SECRET="app-insight-client-secret"
``` 
- Django ssecret: 
    Django [SECRET_KEY](https://docs.djangoproject.com/en/dev/ref/settings/#secret-key) is a random string needed when starting django apps, which requires 50 characters in length with a minimum 5 unique characters.

``` 
    SECRET_KEY="django-secret-key"
```

## Build Steps

Build webmodule image
```
    make build
```

Push images
```
    make push
```
