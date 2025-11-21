# NexaGestion ERP - Deployment Guide

## Phase 17: Advanced DevOps & Infrastructure

This guide covers deploying NexaGestion using Docker, Kubernetes, and AWS infrastructure.

---

## 📦 Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/nexagestion.git
cd nexagestion

# Copy environment file
cp .env.example .env

# Update .env with your configuration
nano .env

# Start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Access application
# http://localhost:3000
```

### Services

- **App**: Next.js application on port 3000
- **PostgreSQL**: Database on port 5432
- **Redis**: Cache on port 6379
- **Nginx**: Reverse proxy on ports 80/443

---

## 🚀 AWS Deployment with Terraform

### Prerequisites
- Terraform 1.0+
- AWS CLI configured
- AWS account with appropriate permissions

### Setup

```bash
# Initialize Terraform
cd terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply configuration
terraform apply tfplan

# Get outputs
terraform output
```

### Infrastructure Created
- VPC with public/private subnets
- Internet Gateway
- Security Groups
- Route Tables
- Ready for ECS/RDS integration

---

## 🔄 CI/CD Pipeline

### GitHub Actions

The `.github/workflows/ci-cd.yml` file automates:

1. **Testing**: Runs linting, type checking, and tests
2. **Building**: Builds the Next.js application
3. **Docker**: Builds and pushes Docker image
4. **Deployment**: Deploys to production

### Setup

```bash
# Add secrets to GitHub
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password
```

---

## 📊 Monitoring & Logging

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Metrics

```bash
# Get CPU metrics
curl http://localhost:3000/api/monitoring/metrics?type=cpu&hours=24

# Get logs
curl http://localhost:3000/api/monitoring/logs?level=error&hours=24
```

### Dashboard

Access monitoring dashboard at: `http://localhost:3000/monitoring/dashboard`

---

## 🔐 Security

- SSL/TLS encryption with Nginx
- Rate limiting (10 req/s general, 100 req/s API)
- Security headers (HSTS, X-Frame-Options, etc.)
- Gzip compression enabled

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale Docker containers
docker-compose up -d --scale app=3

# Scale ECS tasks
terraform apply -var="ecs_desired_count=5"
```

### Load Balancing

Nginx automatically distributes traffic using `least_conn` algorithm.

---

## 🛠️ Troubleshooting

### Database Connection Issues

```bash
# Check database status
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### Application Issues

```bash
# View app logs
docker-compose logs app

# Restart application
docker-compose restart app
```

### Terraform Issues

```bash
# Validate configuration
terraform validate

# Format files
terraform fmt -recursive
```

---

## 📝 Maintenance

### Backups

```bash
# Backup database
docker-compose exec postgres pg_dump -U nexagestion nexagestion > backup.sql

# Restore database
docker-compose exec -T postgres psql -U nexagestion nexagestion < backup.sql
```

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

---

## 🎯 Production Checklist

- [ ] Update `.env` with production values
- [ ] Configure SSL certificates
- [ ] Setup database backups
- [ ] Configure monitoring alerts
- [ ] Setup log aggregation
- [ ] Configure auto-scaling policies
- [ ] Test disaster recovery
- [ ] Document runbooks
- [ ] Setup on-call rotation
- [ ] Configure CDN for static assets

