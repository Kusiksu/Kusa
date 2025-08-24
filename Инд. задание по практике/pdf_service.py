from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
import os

def generate_pdf(data, output_path):
    """
    Генерирует PDF анкету соискателя используя HTML+CSS шаблон
    """
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    env = Environment(loader=FileSystemLoader(template_dir))
    
    template = env.get_template('anketa_template.html')
    
    html_content = template.render(data=data)
    
    HTML(string=html_content).write_pdf(output_path)
