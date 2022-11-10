include .env

PWD = $(shell pwd)
WEBMODULE_PATH = $(PWD)/modules/webmodule
FILE := $(WEBMODULE_PATH)/version.txt
MODULE_VERSION := $(shell cat ${FILE})

.PHONY: help
help: ## show help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {gsub("\\\\n",sprintf("\n%22c",""), $$2);printf "\033[36m %-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)


.PHONY: build
build: check-env ## build webmodule image
	@DOCKER_BUILDKIT=1 docker build --rm -f "$(PWD)/modules/webmodule/dockerfiles/Dockerfile.amd64" \
		--build-arg GIT_LOG=$(git rev-parse HEAD) \
		--build-arg APPLICATIONINSIGHTS_INSTRUMENTATION_KEY=$(APPLICATIONINSIGHTS_INSTRUMENTATION_KEY) \
		--build-arg APPLICATIONINSIGHTS_INGESTION_ENDPOINT=$(APPLICATIONINSIGHTS_INGESTION_ENDPOINT) \
		--build-arg APPLICATIONINSIGHTS_TENANT_ID=$(APPLICATIONINSIGHTS_TENANT_ID) \
		--build-arg APPLICATIONINSIGHTS_CLIENT_ID=$(APPLICATIONINSIGHTS_CLIENT_ID) \
		--build-arg APPLICATIONINSIGHTS_CLIENT_SECRET=$(APPLICATIONINSIGHTS_CLIENT_SECRET) \
		--build-arg SECRET_KEY=$(SECRET_KEY) \
		-t $(CONTAINER_REGISTRY_NAME)/webmodule:$(MODULE_VERSION)-amd64 \
		"$(WEBMODULE_PATH)"

.PHONY: push
push: check-env ## push webmodule image
	@docker push $(CONTAINER_REGISTRY_NAME)/webmodule:$(MODULE_VERSION)-amd64

.PHONY: version
version: ## check webmodule version
	@echo $(MODULE_VERSION)

check-env:
ifndef APPLICATIONINSIGHTS_INSTRUMENTATION_KEY
	$(error APPLICATIONINSIGHTS_INSTRUMENTATION_KEY is undefined)
endif
ifndef APPLICATIONINSIGHTS_INGESTION_ENDPOINT
	$(error APPLICATIONINSIGHTS_INGESTION_ENDPOINT is undefined)
endif
ifndef APPLICATIONINSIGHTS_TENANT_ID
	$(error APPLICATIONINSIGHTS_TENANT_ID is undefined)
endif
ifndef APPLICATIONINSIGHTS_CLIENT_ID
	$(error APPLICATIONINSIGHTS_CLIENT_ID is undefined)
endif
ifndef APPLICATIONINSIGHTS_CLIENT_SECRET
	$(error APPLICATIONINSIGHTS_CLIENT_SECRET is undefined)
endif
ifndef SECRET_KEY
	$(error SECRET_KEY is undefined)
endif
ifndef CONTAINER_REGISTRY_NAME
	$(error CONTAINER_REGISTRY_NAME is undefined)
endif
