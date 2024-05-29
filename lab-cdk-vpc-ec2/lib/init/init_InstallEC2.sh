#!/bin/bash -xe
# Install OS packages
# yum update -y
# yum groupinstall -y "Development Tools"

### SSM Agent
yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
systemctl start amazon-ssm-agent
systemctl enable amazon-ssm-agent || true

### CloudWatch Unified Agent
yum install -y amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent
systemctl enable amazon-cloudwatch-agent

### X-Ray Agent
# https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon-ec2.html
# curl https://s3.us-east-2.amazonaws.com/aws-xray-assets.us-east-2/xray-daemon/aws-xray-daemon-3.x.rpm -o /home/ec2-user/xray.rpm
# yum install -y /home/ec2-user/xray.rpm

# # Code Deploy Agent
# wget https://aws-codedeploy-us-west-2.s3.us-west-2.amazonaws.com/latest/install
# chmod +x ./install
# yum install -y ruby  # 此份 install 腳本, 使用 ruby 執行
# ./install auto

### Nginx
amazon-linux-extras install -y nginx1
systemctl start nginx
systemctl enable nginx
