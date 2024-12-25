
AWS_ACCOUNT := $(shell aws sts get-caller-identity --query Account --output text)
AWS_REGION := $(shell aws configure get default.region)

.PHONY: init infra image service all-start

init:
	yarn install

infra:
	cdk deploy --require-approval never LabCdkEcsFargateInfra

image:
	aws ecr get-login-password | docker login --username AWS --password-stdin ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
	cd flask_app && docker build -t ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/sre-poc-flask-app .
	docker push ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/sre-poc-flask-app
	cd ..

service:
	cdk deploy --require-approval never LabCdkEcsFargateService -vv

all-start:
	$(MAKE) init
	$(MAKE) infra
	$(MAKE) image
	$(MAKE) service

delete-all:
	cdk destroy --force LabCdkEcsFargateService
	aws ecr batch-delete-image --repository-name sre-poc-flask-app --image-ids imageTag=latest
	cdk destroy --force LabCdkEcsFargateInfra
