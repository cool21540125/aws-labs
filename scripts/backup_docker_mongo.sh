#!/bin/bash
#
# 腳本目的: 備份 Docker Container 裡頭的 MongoDB
#
# ================================================================

# ------ EC2 Host variables ------
MONGO_CONTAINER_NAME=mongo

# ------ MongoDB container variables ------
MONGO_ADMIN_USER=
MONGO_ADMIN_PASSWORD=
MONGO_BACKUP_DBS=("db_1" "db_2")

# ------ AWS variables ------
BACKUP_ROLE_ARN=arn:aws:iam::123456789012:role/RoleToBackup
BACKUP_BUCKET_NAME=backup-bucket-123456789012
TOPIC_ARN=

### Switch to a role that is allowed to upload file to S3 Bucket
creds=$(aws sts assume-role --role-arn $BACKUP_ROLE_ARN --role-session-name ec2_mongodb_backup --output json --no-cli-pager)
export AWS_ACCESS_KEY_ID=$(echo $creds | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $creds | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $creds | jq -r '.Credentials.SessionToken')

backup() {
  for db in "${MONGO_BACKUP_DBS[@]}"; do

    docker exec -it ${MONGO_CONTAINER_NAME} mongodump -u ${MONGO_ADMIN_USER} -p ${MONGO_ADMIN_PASSWORD} --authenticationDatabase admin --out /tmp/ --db ${db}

    docker cp ${MONGO_CONTAINER_NAME}:/tmp/${db} .

    aws s3 cp ${db} s3://${BACKUP_BUCKET_NAME}/mongodb/${db} --recursive

  done

  aws sns publish --topic-arn $TOPIC_ARN --subject "MongoDB backup -- OK" --message "EC2 - MongoDB Container backup successful!"
}

backup
