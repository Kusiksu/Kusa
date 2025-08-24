"""
Конфигурация CORS для FastAPI приложения
"""

import os
from typing import List

def get_cors_origins() -> List[str]:
    """
    Получает список разрешенных origins для CORS
    """
    # Для разработки разрешаем все origins
    if os.getenv("ENVIRONMENT", "development") == "development":
        return [
            "http://localhost:8000",
            "http://localhost:3000",
            "http://127.0.0.1:8000",
            "http://127.0.0.1:3000",
            "*"
        ]
    
    # Для продакшена указываем конкретные домены
    return [
        "https://your-production-domain.com",
        "https://your-frontend-domain.com",
    ]

def get_cors_config():
    """
    Возвращает конфигурацию CORS middleware
    """
    return {
        "allow_origins": get_cors_origins(),
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": [
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ],
        "expose_headers": [
            "Content-Disposition",
            "Content-Length",
            "Content-Type",
        ],
        "max_age": 86400,  # 24 часа
    }
