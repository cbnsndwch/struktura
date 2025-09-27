# Development Environment Setup

This guide provides step-by-step instructions for setting up the Struktura development environment using Docker Compose.

## Prerequisites

- **Docker**: Version 20.0 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cbnsndwch/struktura.git
   cd struktura
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start the development environment**:
   ```bash
   # Start all services with hot reload
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   
   # Or use the shorthand
   docker-compose up -d
   ```

4. **Verify services are running**:
   ```bash
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f app
   ```

5. **Access the application**:
   - **Main Application**: http://localhost:3000
   - **Health Check**: http://localhost:3000/health
   - **GraphQL Playground**: http://localhost:3000/graphql
   - **MongoDB**: localhost:27017
   - **Redis**: localhost:6379

## Services Overview

### Application Service (`app`)
- **Port**: 3000
- **Hot Reload**: Enabled for development
- **Health Check**: `/health` endpoint
- **GraphQL**: Available at `/graphql`

### MongoDB Service (`mongodb`)
- **Port**: 27017
- **Database**: `struktura-dev`
- **Credentials**: `mongo-user` / `mongo-pass`
- **Replica Set**: `rs0` (initialized automatically)
- **Data Persistence**: Docker volume `mongodb_data`

### Redis Service (`redis`)
- **Port**: 6379
- **Persistence**: AOF enabled
- **Data Persistence**: Docker volume `redis_data`

## Development Workflow

### Starting Development

```bash
# Start all services
docker-compose up -d

# View application logs
docker-compose logs -f app

# View all service logs
docker-compose logs -f
```

### Code Changes and Hot Reload

The application service is configured with volume mounts for hot reload:
- Changes to `/apps`, `/features`, `/libs` are automatically detected
- The NestJS application restarts automatically on file changes
- No need to rebuild containers for code changes

### Running Commands Inside Containers

```bash
# Execute commands in the app container
docker-compose exec app pnpm build
docker-compose exec app pnpm test
docker-compose exec app pnpm lint

# Access MongoDB shell
docker-compose exec mongodb mongosh -u mongo-user -p mongo-pass --authenticationDatabase admin

# Access Redis CLI
docker-compose exec redis redis-cli
```

### Database Operations

```bash
# View MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB
docker-compose exec mongodb mongosh mongodb://mongo-user:mongo-pass@localhost:27017/struktura-dev?authSource=admin

# View database status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Stopping and Cleaning Up

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Rebuild containers (after Dockerfile changes)
docker-compose build
docker-compose up -d
```

## Environment Configuration

### Environment Variables

The `.env` file contains all configuration variables:

```bash
# Node.js Environment
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=mongodb://mongo-user:mongo-pass@mongodb:27017/struktura-dev?authSource=admin

# Redis Configuration  
REDIS_URL=redis://redis:6379

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
```

### Customizing Configuration

1. **Database Credentials**: Modify `MONGO_USERNAME` and `MONGO_PASSWORD` in `.env`
2. **Port Mapping**: Change port mappings in `docker-compose.yml`
3. **Volume Mounts**: Customize volume mounts for different workflows

## Health Checks

All services include health checks:

```bash
# Check health status of all services
docker-compose ps

# Test application health endpoint
curl http://localhost:3000/health

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Test Redis connection
docker-compose exec redis redis-cli ping
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify MongoDB is accessible
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Reset MongoDB data (WARNING: Deletes all data)
docker-compose down
docker volume rm struktura_mongodb_data
docker-compose up -d
```

#### Application Won't Start
```bash
# Check application logs
docker-compose logs app

# Rebuild application container
docker-compose build app
docker-compose up -d app

# Run in development mode with logs
docker-compose up app
```

#### Hot Reload Not Working
```bash
# Verify volume mounts
docker-compose exec app ls -la /app/apps

# Check if nodemon/nest is watching files
docker-compose exec app ps aux | grep node
```

### Performance Issues

#### Slow Startup
- The first startup downloads and builds containers, which can take 5-10 minutes
- Subsequent starts are much faster due to Docker layer caching

#### Slow Hot Reload
- Ensure you're using native Docker (not Docker Desktop on older systems)
- Consider excluding `node_modules` from file watching

## Production Considerations

This setup is optimized for development. For production deployment:

1. Use `docker-compose.prod.yml` (when available)
2. Set `NODE_ENV=production`
3. Use external managed databases (MongoDB Atlas, Redis Cloud)
4. Configure proper secrets management
5. Enable SSL/TLS termination
6. Set up monitoring and logging

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Guide](https://hub.docker.com/_/mongo)
- [Redis Docker Guide](https://hub.docker.com/_/redis)
- [NestJS Documentation](https://docs.nestjs.com/)

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify all services are healthy: `docker-compose ps`
3. Review this documentation
4. Create an issue in the repository with logs and error details