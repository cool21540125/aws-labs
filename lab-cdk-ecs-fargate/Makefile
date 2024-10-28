
# AWS_ACCOUNT := $(shell aws sts get-caller-identity --query Account --output text)
# AWS_REGION := $(shell aws configure get default.region)


.PHONY: init
init:
	$(info ***** Remember to comment ECS Part *****)
	exit 0


.PHONY: infra
infra:
	cdk deploy --require-approval never


.PHONE: image
image:
	export AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
	export AWS_REGION=$(aws configure get default.region)
	aws ecr get-login-password | docker login --username AWS --password-stdin ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
	cd flask_app && docker build -t ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/flask-app .
	docker push ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/flask-app
	cd ..
