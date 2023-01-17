# grpc_proto

A simple http server that receives the inference result.



## Build 

Build the http_endpoint container using docker:
```
    docker build -t {YOUR_CONTAINER_REGISTRY}/http_endpoint:latest .
```

## Push

Upload the grpc_proto container to container registry
```
    docker push {YOUR_CONTAINER_REGISTRY}/http_endpoint:latest
```

## Run

Run the http endpoint through docker
```
    docker run -p 5000:5000 -itd {YOUR_CONTAINER_REGISTRY}/http_endpoint:latest
```
