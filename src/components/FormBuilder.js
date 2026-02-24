import UIComponents from '../components/UIComponents';

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
        throw new Error(`Форма ${formId} не найдена: ${response.status}`);
      }
      this.formConfig = await response.json();
      return this.formConfig;
    } catch (error) {
      console.error('Ошибка загрузки формы:', error);
      return await this.loadDefaultForm();
    }
  }

  async loadDefaultForm() {
    try {
      const response = await fetch('./src/custom-forms/default-form.json');
      if (!response.ok) {
        throw new Error(`Ошибка загрузки формы: ${response.status}`)
      }

      this.formConfig = await response.json();
      return this.formConfig;
    } catch (error) {
      console.error('Ошибка загрзки формы по умолчанию:', error)
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

  createFormHTML(config) {
    return UIComponents.createForm(config);
  }

  applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor || '#1a73e8');
    root.style.setProperty('--secondary-color', theme.secondaryColor || '#f1f3f4');
    root.style.setProperty('--accent-color', theme.accentColor || '#202124');
  }

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

  getFormData() {
    const form = document.getElementById('dynamicForm');
    const formData = new FormData(form);
    const data = {};

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

  resetForm() {
    const form = document.getElementById('dynamicForm');
    if (form) {
      form.reset();
    }
  }
}
