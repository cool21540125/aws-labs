#!/bin/bash -xe
# Install OS packages
# yum update -y
# yum groupinstall -y "Development Tools"


### SSM Agent
yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
systemctl start amazon-ssm-agent
systemctl enable amazon-ssm-agent || true


### Nginx
amazon-linux-extras install -y nginx1
systemctl start nginx
systemctl enable nginx


### CloudWatch Unified Agent
yum install -y amazon-cloudwatch-agent
systemctl start  amazon-cloudwatch-agent
systemctl enable  amazon-cloudwatch-agent


# # Code Deploy Agent
# wget https://aws-codedeploy-us-west-2.s3.us-west-2.amazonaws.com/latest/install
# chmod +x ./install
# ./install auto
