// === Задание 1 ===
function findMax() {
  const a = parseFloat(document.getElementById('num1').value);
  const b = parseFloat(document.getElementById('num2').value);
  const result = Math.max(a, b);
  document.getElementById('maxResult').textContent = `Большее число: ${result}`;
}

// === Задание 2 ===
function generateRange() {
  const num = parseInt(document.getElementById('rangeInput').value);
  if (isNaN(num) || num < 0) {
    document.getElementById('rangeResult').textContent = 'Введите неотрицательное число';
    return;
  }
  const range = Array.from({ length: num + 1 }, (_, i) => i);
  document.getElementById('rangeResult').textContent = `Массив: [${range.join(', ')}]`;
}

// === Задание 3 ===
function filterEvenNumbers() {
  const input = document.getElementById('arrayInput').value;
  const numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  const even = numbers.filter(n => n % 2 === 0);
  document.getElementById('evenResult').textContent = `Четные числа: [${even.join(', ')}]`;
}

// === Анкета ===
const form = document.getElementById('userForm');
const fields = form.querySelectorAll('input, textarea, select');

// 🔍 Регулярка на буквы (латиница + кириллица)
const namePattern = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;

// === Валидация поля ===
function validateField(field) {
  const errorSpan = field.nextElementSibling;
  let valid = true;
  let errorMessage = '';

  const value = field.value.trim();

  if (!value) {
    valid = false;
    errorMessage = 'Это поле обязательно';
  }

  if (valid && (field.name === 'firstName' || field.name === 'lastName')) {
    if (!namePattern.test(value)) {
      valid = false;
      errorMessage = 'Допустимы только буквы';
    }
  }

  if (valid && field.type === 'tel' && !field.validity.valid) {
    valid = false;
    errorMessage = 'Введите корректный номер телефона';
  }

  if (valid && field.type === 'email' && !field.validity.valid) {
    valid = false;
    errorMessage = 'Введите корректный email';
  }

  if (!valid) {
    field.classList.add('invalid');
    errorSpan.textContent = errorMessage;
  } else {
    field.classList.remove('invalid');
    errorSpan.textContent = '';
  }
}

// === Проверка всей формы ===
function validateForm() {
  let isValid = true;
  fields.forEach(field => {
    validateField(field);
    if (field.classList.contains('invalid')) {
      isValid = false;
    }
  });
  return isValid;
}

// === Сохранение ===
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const isValid = validateForm();

  if (!isValid) {
    alert('❌ Сохранение не удалось. Исправьте ошибки формы.');
    return;
  }

  const formData = {};
  fields.forEach(field => {
    formData[field.name] = field.value.trim();
  });

  localStorage.setItem('formData', JSON.stringify(formData));
  alert('✅ Данные успешно сохранены!');
});

// === Загрузка данных из localStorage ===
document.getElementById('loadData').addEventListener('click', () => {
  const savedData = localStorage.getItem('formData');
  if (!savedData) {
    alert('Нет сохраненных данных.');
    return;
  }

  const formData = JSON.parse(savedData);

  fields.forEach(field => {
    if (formData[field.name] !== undefined) {
      field.value = formData[field.name];
      validateField(field); // визуально убрать ошибки, если поле корректно
    }
  });

  alert('📄 Данные загружены из localStorage.');
});
