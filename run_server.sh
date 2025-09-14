#!/bin/bash
# Script to run Django server with correct PostgreSQL configuration

export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=edulearn_db
export DB_HOST=localhost
export DB_PORT=5432

echo "Starting EduLearn Django server..."
echo "Database: PostgreSQL (edulearn_db)"
echo "User: postgres"
echo "Host: localhost:5432"
echo ""

# Run the Django development server
env/bin/python manage.py runserver 0.0.0.0:8000
