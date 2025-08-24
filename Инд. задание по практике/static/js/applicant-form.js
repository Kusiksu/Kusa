/**
 * Функции для работы с формой анкеты соискателя
 */

class ApplicantFormHandler {
  constructor() {
    this.apiUrl = '/generate-pdf/';
    this.formId = 'applicant-form';
    this.submitButtonId = 'submit-btn';
    this.loadingClass = 'loading';
    this.errorClass = 'error';
    this.successClass = 'success';
  }

  /**
   * Инициализация обработчиков событий
   */
  init() {
    const form = document.getElementById(this.formId);
    const submitBtn = document.getElementById(this.submitButtonId);

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
    }

    // Добавляем валидацию в реальном времени
    this.addRealTimeValidation();
  }

  /**
   * Обработка отправки формы
   */
  async handleSubmit(event) {
    event.preventDefault();

    const form = document.getElementById(this.formId);
    const submitBtn = document.getElementById(this.submitButtonId);

    // Проверяем валидность формы
    if (!this.validateForm(form)) {
      this.showError('Пожалуйста, заполните все обязательные поля корректно');
      return;
    }

    // Показываем состояние загрузки
    this.setLoadingState(true, submitBtn);

    try {
      // Собираем данные формы
      const formData = this.collectFormData(form);

      // Отправляем запрос
      const response = await this.sendRequest(formData);

      // Обрабатываем успешный ответ
      this.handleSuccess(response, formData.full_name);

    } catch (error) {
      // Обрабатываем ошибку
      this.handleError(error);
    } finally {
      // Убираем состояние загрузки
      this.setLoadingState(false, submitBtn);
    }
  }

  /**
   * Сбор данных из формы
   */
  collectFormData(form) {
    const formData = new FormData(form);
    const data = {};

    // Преобразуем FormData в объект
    for (let [key, value] of formData.entries()) {
      // Обрабатываем чекбоксы
      if (key.includes('ready_to_')) {
        data[key] = value === 'on' || value === 'true';
      } else {
        data[key] = value;
      }
    }

    // Добавляем значения чекбоксов, которые могут быть не отмечены
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (!data.hasOwnProperty(checkbox.name)) {
        data[checkbox.name] = false;
      }
    });

    return data;
  }

  /**
   * Отправка запроса на сервер
   */
  async sendRequest(data) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf, application/json',
      },
      mode: 'cors',
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  /**
   * Обработка успешного ответа
   */
  handleSuccess(response, fullName) {
    // Создаем blob из ответа
    response.blob().then(blob => {
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `anketa_${fullName.replace(/\s+/g, '_')}.pdf`;

      // Добавляем ссылку в DOM и кликаем по ней
      document.body.appendChild(a);
      a.click();

      // Очищаем
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      this.showSuccess('PDF анкета успешно сгенерирована и скачана!');
    });
  }

  /**
   * Обработка ошибки
   */
  handleError(error) {
    console.error('Ошибка при генерации PDF:', error);
    
    // Специальная обработка CORS ошибок
    if (error.message.includes('CORS') || error.message.includes('cors')) {
      this.showError('Ошибка CORS: Проверьте настройки сервера и убедитесь, что запрос отправляется с разрешенного домена');
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      this.showError('Ошибка сети: Проверьте подключение к интернету и доступность сервера');
    } else {
      this.showError(`Ошибка при генерации PDF: ${error.message}`);
    }
  }

  /**
   * Валидация формы
   */
  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Дополнительная валидация email
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !this.isValidEmail(emailField.value)) {
      this.showFieldError(emailField, 'Введите корректный email адрес');
      isValid = false;
    }

    // Валидация телефона
    const phoneField = form.querySelector('input[name="phone"]');
    if (phoneField && phoneField.value && !this.isValidPhone(phoneField.value)) {
      this.showFieldError(phoneField, 'Введите корректный номер телефона');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Валидация отдельного поля
   */
  validateField(field) {
    const value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, 'Это поле обязательно для заполнения');
      return false;
    }

    this.clearFieldError(field);
    return true;
  }

  /**
   * Валидация email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Валидация телефона
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Добавление валидации в реальном времени
   */
  addRealTimeValidation() {
    const form = document.getElementById(this.formId);
    if (!form) return;

    const fields = form.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
      field.addEventListener('blur', () => {
        this.validateField(field);
      });

      field.addEventListener('input', () => {
        this.clearFieldError(field);
      });
    });
  }

  /**
   * Показать ошибку для поля
   */
  showFieldError(field, message) {
    this.clearFieldError(field);

    field.classList.add(this.errorClass);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';

    field.parentNode.appendChild(errorDiv);
  }

  /**
   * Очистить ошибку поля
   */
  clearFieldError(field) {
    field.classList.remove(this.errorClass);

    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * Установка состояния загрузки
   */
  setLoadingState(isLoading, button) {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.classList.add(this.loadingClass);
      button.textContent = 'Генерация PDF...';
    } else {
      button.disabled = false;
      button.classList.remove(this.loadingClass);
      button.textContent = 'Сгенерировать PDF';
    }
  }

  /**
   * Показать сообщение об успехе
   */
  showSuccess(message) {
    this.showMessage(message, this.successClass);
  }

  /**
   * Показать сообщение об ошибке
   */
  showError(message) {
    this.showMessage(message, this.errorClass);
  }

  /**
   * Показать сообщение
   */
  showMessage(message, type) {
    // Удаляем существующие сообщения
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.padding = '1rem';
    messageDiv.style.margin = '1rem 0';
    messageDiv.style.borderRadius = '0.375rem';
    messageDiv.style.fontWeight = '500';

    if (type === this.successClass) {
      messageDiv.style.backgroundColor = '#d1fae5';
      messageDiv.style.color = '#065f46';
      messageDiv.style.border = '1px solid #a7f3d0';
    } else {
      messageDiv.style.backgroundColor = '#fee2e2';
      messageDiv.style.color = '#991b1b';
      messageDiv.style.border = '1px solid #fecaca';
    }

    const form = document.getElementById(this.formId);
    if (form) {
      form.parentNode.insertBefore(messageDiv, form);
    }

    // Автоматически скрываем сообщение через 5 секунд
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  /**
   * Очистка формы
   */
  clearForm() {
    const form = document.getElementById(this.formId);
    if (form) {
      form.reset();

      // Очищаем все ошибки
      const errorFields = form.querySelectorAll(`.${this.errorClass}`);
      errorFields.forEach(field => this.clearFieldError(field));

      // Удаляем сообщения
      const messages = document.querySelectorAll('.message');
      messages.forEach(msg => msg.remove());
    }
  }
}

// Создаем глобальный экземпляр
const applicantForm = new ApplicantFormHandler();

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  applicantForm.init();
});

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApplicantFormHandler;
}
