terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0.0" 
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

variable "db_user" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_name" {
  type      = string
  sensitive = true
}

variable "nextauth_secret" {
  type      = string
  sensitive = true
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

variable "resend_apikey" {
  type      = string
  sensitive = true
}

variable "backend_image" {
  type    = string
  default = "ghcr.io/rmcampos/event.me:v2026.03.05.6"
}

variable "migrations_image" {
  type    = string
  default = "ghcr.io/rmcampos/event.me:v2026.03.05.6-migrations"
}

resource "kubernetes_namespace_v1" "eventme" {
  metadata {
    name = "eventme"
  }
}

resource "kubernetes_secret_v1" "eventme_secrets" {
  metadata {
    name      = "eventme-secrets"
    namespace = kubernetes_namespace_v1.eventme.metadata[0].name
  }

  data = {
    postgres_user       = var.db_user
    postgres_password   = var.db_password
    postgres_db         = var.db_name
    nextauth_secret     = var.nextauth_secret
    google_client_id     = var.google_client_id
    google_client_secret = var.google_client_secret
    resend_apikey       = var.resend_apikey
  }
}

resource "kubernetes_persistent_volume_claim_v1" "eventme_db_data" {
  metadata {
    name      = "postgres-data-pvc"
    namespace = kubernetes_namespace_v1.eventme.metadata[0].name
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }
}

resource "kubernetes_deployment_v1" "eventme_db" {
  metadata {
    name      = "eventme-db"
    namespace = kubernetes_namespace_v1.eventme.metadata[0].name
  }
  spec {
    replicas = 1
    selector { match_labels = { app = "eventme-db" } }
    template {
      metadata { labels = { app = "eventme-db" } }
      spec {
        container {
          image = "postgres:16-alpine"
          name  = "postgres"
          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }
          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.eventme_secrets.metadata[0].name
                key = "postgres_user"
              }
            }
          }
          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.eventme_secrets.metadata[0].name
                key = "postgres_password"
              }
            }
          }
          env {
            name = "POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.eventme_secrets.metadata[0].name
                key = "postgres_db"
              }
            }
          }
          port { container_port = 5432 }
        }
        volume {
          name = "postgres-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim_v1.eventme_db_data.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "eventme_db_svc" {
  metadata {
    name      = "eventme-db-svc"
    namespace = kubernetes_namespace_v1.eventme.metadata[0].name
  }
  spec {
    selector = { app = "eventme-db" }
    port { port = 5432 }
    type = "ClusterIP"
  }
}

resource "kubernetes_deployment_v1" "eventme_app" {
  metadata {
    name      = "eventme-app"
    namespace = kubernetes_namespace_v1.eventme.metadata[0].name
  }
  spec {
    replicas = 1
    selector { match_labels = { app = "eventme-app" } }
    template {
      metadata { labels = { app = "eventme-app" } }
      spec {
        init_container {
          name        = "prisma-migrate"
          image       = var.migrations_image
          command     = ["node", "node_modules/prisma/build/index.js", "db", "push"]
          env {
            name = "DATABASE_URL"
            value = "postgresql://${var.db_user}:${var.db_password}@eventme-db-svc:5432/${var.db_name}?schema=public"
          }
        }
        container {
          image = var.backend_image
          name  = "app"
          env {
            name = "DATABASE_URL"
            value = "postgresql://${var.db_user}:${var.db_password}@eventme-db-svc:5432/${var.db_name}?schema=public"
          }
          resources {
            limits   = { memory = "128Mi", cpu = "250m" }
            requests = { memory = "128Mi", cpu = "250m" }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "eventme_app_svc" {
  metadata {
    name      = "eventme-app-svc"
    namespace = kubernetes_namespace_v1.eventme.metadata[0].name
  }
  spec {
    selector = { app = "eventme-app" }
    port {
      port = 3000
      target_port = 3000
    }
  }
}

    # Unified Ingress for App and API
resource "kubernetes_ingress_v1" "eventme_ingress" {
  metadata {
    name      = "eventme-ingress"
    namespace = kubernetes_namespace_v1.eventme.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"    = "traefik"
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
    }
  }
  spec {
    tls {
      hosts       = ["eventme.darkroasted.vps-kinghost.net"]
      secret_name = "eventme-tls-certs"
    }
    rule {
      host = "eventme.darkroasted.vps-kinghost.net"
      http {
        path {
          path = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.eventme_app_svc.metadata[0].name
              port { number = 3000 }
            }
          }
        }
      }
    }
  }
}
