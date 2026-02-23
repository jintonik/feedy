export default class FormBuilder {
    constructor() {
    this.currentForm = null;
    this.formConfig = null;
  }

  // Загрузка конфигурации формы
    async loadForm(formId) {
    try {
      const response = await fetch(`./src/custom-forms/${formId}-form.json`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text);
        throw new Error('Response is not valid JSON');
      }

      const config = await response.json();
      this.formConfig = config;
      return config;
    } catch (error) {
      console.error('Ошибка загрузки формы:', error);
      // Возвращаем форму по умолчанию
      return await this.loadDefaultForm();
    }
  }

  // Загрузка формы по умолчанию
  async loadDefaultForm() {
    try {
      const response = await fetch('./src/custom-forms/default-form.json');

      if (!response.ok) {
        throw new Error(`Failed to load default form: ${response.status}`);
      }

      const config = await response.json();
      this.formConfig = config;
      return config;
    } catch (error) {
      console.error('Ошибка загрузки формы по умолчанию:', error);
      // Возвращаем базовую конфигурацию
      return {
        id: 'default',
        title: 'Форма обратной связи',
        description: 'Стандартная форма обратной связи',
        fields: [
          {
            type: 'text',
            id: 'name',
            label: 'Как вас зовут?',
            required: true,
            placeholder: 'Введите ваше имя'
          },
          {
            type: 'textarea',
            id: 'message',
            label: 'Ваш отзыв',
            required: true,
            placeholder: 'Расскажите подробнее...'
          }
        ],
        theme: {
          primaryColor: '#1a73e8',
          secondaryColor: '#f1f3f4',
          accentColor: '#202124'
        }
      };
    }
  }

  // Создание HTML формы
  createFormHTML(config) {
    const formHTML = `
            <form id="dynamicForm" class="dynamic-form">
                ${this.generateFields(config.fields)}
                <button type="submit" id="submitBtn" class="submit-btn">
                    <span class="btn-text">Сохранить отзыв</span>
                    <span class="btn-loading">Сохранение...</span>
                </button>
            </form>
        `;

    return formHTML;
  }

  // Генерация полей формы
  generateFields(fields) {
    return fields.map(field => {
      switch (field.type) {
        case 'text':
        case 'email':
          return this.createTextInput(field);
        case 'textarea':
          return this.createTextArea(field);
        case 'rating':
          return this.createRatingInput(field);
        case 'select':
          return this.createSelect(field);
        case 'radio':
          return this.createRadioGroup(field);
        case 'checkbox':
          return this.createCheckboxGroup(field);
        default:
          return '';
      }
    }).join('');
  }

    createTextInput(field) {
    return `
            <div class="question">
                <h3>${field.label}${field.required ? ' *' : ''}</h3>
                <input type="${field.type}"
                       id="${field.id}"
                       name="${field.id}"
                       ${field.required ? 'required' : ''}
                       placeholder="${field.placeholder || ''}">
            </div>
        `;
  }

  createTextArea(field) {
    return `
            <div class="question">
                <h3>${field.label}${field.required ? ' *' : ''}</h3>
                <textarea id="${field.id}"
                          name="${field.id}"
                          ${field.required ? 'required' : ''}
                          placeholder="${field.placeholder || ''}"
                          rows="4"></textarea>
            </div>
        `;
  }

  createRatingInput(field) {
    const options = field.options.map(option =>
      `<option value="${option}">${option}</option>`
    ).join('');

    return `
            <div class="question">
                <h3>${field.label}${field.required ? ' *' : ''}</h3>
                <select id="${field.id}" name="${field.id}" ${field.required ? 'required' : ''}>
                    <option value="">Выберите оценку</option>
                    ${options}
                </select>
            </div>
        `;
  }

  createSelect(field) {
    const options = field.options.map(option =>
      `<option value="${option}">${option}</option>`
    ).join('');

    return `
            <div class="question">
                <h3>${field.label}${field.required ? ' *' : ''}</h3>
                <select id="${field.id}" name="${field.id}" ${field.required ? 'required' : ''}>
                    <option value="">Выберите вариант</option>
                    ${options}
                </select>
            </div>
        `;
  }

    createRadioGroup(field) {
    const radioOptions = field.options.map(option =>
      `<label class="radio-option">
                <input type="radio" name="${field.id}" value="${option}" required>
                <span class="radio-custom"></span>
                <span>${option}</span>
            </label>`
    ).join('');

    return `
            <div class="question">
                <h3>${field.label}${field.required ? ' *' : ''}</h3>
                <div class="radio-group">
                    ${radioOptions}
                </div>
            </div>
        `;
  }

  createCheckboxGroup(field) {
    const checkboxOptions = field.options.map(option =>
      `<label class="checkbox-option">
                <input type="checkbox" name="${field.id}" value="${option}">
                <span class="checkbox-custom"></span>
                <span>${option}</span>
            </label>`
    ).join('');

    return `
            <div class="question">
                <h3>${field.label}</h3>
                <div class="checkbox-group">
                    ${checkboxOptions}
                </div>
            </div>
        `;
  }

  // Применение темы
  applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor || '#1a73e8');
    root.style.setProperty('--secondary-color', theme.secondaryColor || '#f1f3f4');
    root.style.setProperty('--accent-color', theme.accentColor || '#202124');
  }

  // Валидация формы
  validateForm() {
    const form = document.getElementById('dynamicForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    for (let input of inputs) {
      if (!input.value.trim()) {
        input.focus();
        return false;
      }
    }
    return true;
  }

  // Получение данных формы
  getFormData() {
    const form = document.getElementById('dynamicForm');
    const formData = new FormData(form);
    const data = {};

    // Преобразуем FormData в объект
    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  // Сброс формы
  resetForm() {
    const form = document.getElementById('dynamicForm');
    if (form) {
      form.reset();
    }
  }
}
