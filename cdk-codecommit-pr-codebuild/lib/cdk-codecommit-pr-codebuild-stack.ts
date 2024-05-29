import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as events from 'aws-cdk-lib/aws-events';

export class CdkCodecommitPrCodebuildStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // ============================================================
    // CodeCommit - 會直接去載入此 `demo-repo` 這個 CodeCommit Repository
    // ============================================================
    const repo = codecommit.Repository.fromRepositoryName(this, 'cdk-codeCommit', 'demo-repo');

    // ============================================================
    // CodeBuild
    // ============================================================
    const project = new codebuild.Project(this, 'cdk-build-project', {
      source: codebuild.Source.codeCommit({
        repository: repo,
      }),
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
    });

    // ============================================================
    // CodeCommit 觸發方式
    // EventPattern:
    // source:
    //   - aws.s3
    // detail-type:
    //   - Object Created
    // detail:
    //   bucket:
    //     name:
    //       - !Sub caretw-${AWS::AccountId}
    // ============================================================
    repo.onPullRequestStateChange('cdk-onPRChanged-codecommit', {
      // 已經 Closed 的 Branch 不做 build
      eventPattern: {
        detail: {
          ''
        }
      },
      target: new targets.CodeBuildProject(project, {
        // IMPORTANT: 底下這包不知道在幹嘛
        event: events.RuleTargetInput.fromObject({
          // link commit on PR -> CodeBuild Project (不懂)
          sourceVersion: events.EventField.fromPath('$.detail.sourceReference'),
          // Mapping 可留 PR comment
          environmentVariablesOverride: [
            {
              "name": "pullRequestID",
              "type": "PLAINTEXT",
              "value": events.EventField.fromPath('$.detail.pullRequestId'),
            },
            {
              "name": "repositoryName",
              "type": "PLAINTEXT",
              "value": repo,
            },
            {
              "name": "sourceCommit",
              "type": "PLAINTEXT",
              "value": events.EventField.fromPath('$.detail.sourceCommit'),
            },
            {
              "name": "destinationCommit",
              "type": "PLAINTEXT",
              "value": events.EventField.fromPath('$.detail.destinationCommit'),
            }
          ],
        }),
      }),
    });
  }
}
