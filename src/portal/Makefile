include .env

PWD = $(shell pwd)
WEBMODULE_PATH = $(PWD)/modules/webmodule
FILE := $(WEBMODULE_PATH)/version.txt
MODULE_VERSION := $(shell cat ${FILE})

.PHONY: help
help: ## show help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {gsub("\\\\n",sprintf("\n%22c",""), $$2);printf "\033[36m %-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)


.PHONY: build
build: check-env ## build kanportal image
	@DOCKER_BUILDKIT=1 docker build --rm -f "$(PWD)/modules/webmodule/dockerfiles/Dockerfile.amd64" \
		--build-arg GIT_LOG=$(git rev-parse HEAD) \
		--build-arg SECRET_KEY=$(SECRET_KEY) \
		-t $(CONTAINER_REGISTRY_NAME)/kanportal:$(MODULE_VERSION)-amd64 \
		"$(WEBMODULE_PATH)"

.PHONY: push
push: check-env ## push kanportal image
	@docker push $(CONTAINER_REGISTRY_NAME)/kanportal:$(MODULE_VERSION)-amd64

.PHONY: version
version: ## check kanportal version
	@echo $(MODULE_VERSION)

check-env:
ifndef SECRET_KEY
	$(error SECRET_KEY is undefined)
endif
ifndef CONTAINER_REGISTRY_NAME
	$(error CONTAINER_REGISTRY_NAME is undefined)
endif
