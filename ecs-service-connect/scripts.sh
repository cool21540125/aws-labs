#!/bin/bash

VPC_ID=
SG_ID=
Subnet_ID_1=
Subnet_ID_2=

ECS_CLUSTER=
ECS_SERVICE_1=
ECS_SERVICE_2=
CLOUD_MAP_NAME=

### Create ECS Cluster + CloudMap
aws ecs create-cluster --cluster-name $ECS_CLUSTER --service-connect-defaults namespace=$CLOUD_MAP

### Verify
aws ecs describe-clusters --cluster $ECS_CLUSTER

# 抓出 CloudMap NamespaceId
aws ecs describe-clusters --cluster $ECS_CLUSTER | jq '.clusters[0].serviceConnectDefaults.namespace'

CLOUD_MAP_ID=ns-ad4kh6uxvhix6n42
aws servicediscovery get-namespace --id $CLOUD_MAP_ID | jq

### Deploy ECS Service
aws ecs create-service --service-nam $ECS_SERVICE_1 --cli-input-json file://serv1.json
aws ecs create-service --cli-input-json file://serv2.json
