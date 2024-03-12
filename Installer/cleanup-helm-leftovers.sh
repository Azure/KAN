#!/bin/bash

# The Helm release name to clean up
RELEASE_NAME="kanportal3"
# Namespace of the release
NAMESPACE="default"

# Step 1: Find all resource types in the cluster
for resource in $(kubectl api-resources --verbs=list --namespaced -o name); do
  # Step 2: List all resources of this type in the specified namespace, check for the annotation
  kubectl get $resource -n $NAMESPACE -o json | jq -r --arg RELEASE_NAME "$RELEASE_NAME" '.items[] | select(.metadata.annotations."meta.helm.sh/release-name"==$RELEASE_NAME) | .metadata.name' | while read name; do
    if [ ! -z "$name" ]; then
      echo "Deleting $resource $name in namespace $NAMESPACE..."
      kubectl delete $resource -n $NAMESPACE $name
    fi
  done
done
