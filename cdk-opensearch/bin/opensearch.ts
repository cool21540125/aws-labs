#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { OpensearchStack } from "../lib/opensearch-stack";

const app = new cdk.App();

const ACCOUNT = process.env["AWS_ACCOUNT_ID"] || "";
const REGION = process.env["AWS_DEFAULT_REGION"] || "";

const env = { account: ACCOUNT, region: REGION };

new OpensearchStack(app, "es", { env: env });
