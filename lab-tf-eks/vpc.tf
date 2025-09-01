
resource "random_string" "suffix" {
  length = 8
  special = false
}

locals {
  cluster_name = "istore-eks-${random_string.suffix.result}"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "6.0.1"

  name = "istore-vpc"
  cidr = "10.66.0.0/16"

  azs             = ["us-west-2a", "us-west-2b", "us-west-2c"]
  public_subnets  = ["10.66.1.0/24", "10.66.2.0/24", "10.66.3.0/24"]
  private_subnets = ["10.66.101.0/24", "10.66.102.0/24", "10.66.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  create_igw = true

  tags = {
    CreatedOn   = "2025Q3"
    CreatedVia  = "Terraform"
    Environment = "dev"
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }
}
