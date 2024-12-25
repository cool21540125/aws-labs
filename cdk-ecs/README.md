
- 2023/11/15

```bash
cdk version
#2.108.1 (build 2320255)

export AWS_PROFILE=xxx


### init
cdk bootstrap
cdk synth


### build stack & deploy infra
cdk diff
cdk synth
cdk deploy --all --require-approval never


cdk destroy -vv


### ================= aws CLI ===================
aws ecs list-task-definitions
aws ecs list-clusters

aws ecs list-services --cluster $CFNCluster     
```
