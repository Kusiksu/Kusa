from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import tempfile
from pdf_service import generate_pdf
from cors_config import get_cors_config

app = FastAPI(title="Анкета соискателя PDF Generator", version="1.0.0")

# Настройка CORS middleware
cors_config = get_cors_config()
app.add_middleware(
    CORSMiddleware,
    **cors_config
)

# Настройка статических файлов и шаблонов
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class ApplicantData(BaseModel):
    full_name: str
    birth_date: str
    email: str
    phone: str
    city: str
    gender: str
    citizenship: str
    education: str
    graduation_year: str
    work_experience: str
    professional_skills: str
    foreign_languages: str
    about_me: str
    photo_url: Optional[str] = None
    github_link: Optional[str] = None
    telegram_link: Optional[str] = None
    ready_to_relocate: bool = False
    ready_to_business_trips: bool = False

@app.post("/generate-pdf/")
async def generate_applicant_pdf(data: ApplicantData):
    """
    Генерирует PDF файл с анкетой соискателя на основе переданных данных
    """
    try:
        # Создаем временный файл для PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            pdf_path = tmp_file.name
        
        # Генерируем PDF
        generate_pdf(data, pdf_path)
        
        # Возвращаем файл как ответ с дополнительными заголовками
        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=f"anketa_{data.full_name.replace(' ', '_')}.pdf",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Disposition": f"attachment; filename=anketa_{data.full_name.replace(' ', '_')}.pdf"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка генерации PDF: {str(e)}")

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})

@app.get("/form", response_class=HTMLResponse)
async def form_page(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})

@app.get("/api")
async def api_info():
    return {"message": "Сервис генерации PDF анкет соискателей"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.options("/generate-pdf/")
async def options_generate_pdf():
    """
    Обработчик OPTIONS запросов для CORS preflight
    """
    return {"message": "OK"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
