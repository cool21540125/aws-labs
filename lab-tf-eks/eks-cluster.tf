module "eks" {
    source = "terraform-aws-modules/eks/aws"
    version = "~>21.1.5"

    name = "istore-cluster"
    kubernetes_version = "1.33"

    addons = {
    }
}