ifneq (,$(wildcard ../../.env))
    include ../../.env
    export
endif

REGISTRY := $(REGISTRY_URL)
PROJECT := $(REGISTRY_PROJECT)
IMAGE := $(REGISTRY_BACKEND_IMAGE)
TAG = latest

build:
	docker build -t $(IMAGE):$(TAG) -f $(abspath Dockerfile) $(abspath ../..)

tag: build
	docker tag $(IMAGE):$(TAG) $(REGISTRY)/$(PROJECT)/$(IMAGE):$(TAG)

push: tag
	docker push $(REGISTRY)/$(PROJECT)/$(IMAGE):$(TAG)

all: push