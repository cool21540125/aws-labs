import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as iam from "aws-cdk-lib/aws-iam";

export class GithubOidcProviderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const GITHUB_THUMBPRINT = "https://token.actions.githubusercontent.com";

    const oidcProvider = new iam.OpenIdConnectProvider(this, "GithubOidcProvider", {
      url: GITHUB_THUMBPRINT,
      clientIds: ["sts.amazonaws.com"],
      thumbprints: [GITHUB_THUMBPRINT]
    });
  }
}