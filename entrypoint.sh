#!/bin/bash

# Не выполнять! это нужно запускать в двух разных терминалах

# Команда для запуска celery beat
celery -A settings.celery_app beat --loglevel=INFO

# Команда для запуска celery worker
celery -A settings.celery_app worker --loglevel=INFO