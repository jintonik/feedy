import FormBuilder from './components/FormBuilder.js'
import ImportManager from './components/ImportManager.js';
import CsvUtility from './utils/CsvUtility.js';
import CsvUtils from './utils/CsvUtility.js';
import StorageManager from './utils/StorageManager.js';
import StatusManager from './components/StatusManager.js'

class FeedbackApp {
  constructor() {
    this.formBuilder = new FormBuilder();
    this.importManager = new ImportManager();
    this.csvUtils = new CsvUtils();
    this.storageManager = new StorageManager();
    this.statusManager = new StatusManager();
    this.feedbackData = [];
    this.currentFormId = 'default';
    this.init();
  }

  async init() {
    await this.loadCurrentForm();
    this.setupEventListeners();
    this.loadFeedbacks();
    this.setupImportButton();
    this.setupClearButton();
    this.setupExportButton();
  }

  async loadCurrentForm() {
    try {
      const config = await this.formBuilder.loadForm(this.currentFormId);
      const formElement = this.formBuilder.createFormHTML(config);
      const formContent = document.getElementById('formContent');
      if (formElement && formContent) {
        formContent.replaceChildren();
        formContent.appendChild(formElement);
      }

      this.formBuilder.applyTheme(config.theme);

      this.setupEventListeners();

    } catch (error) {
      console.error('Ошибка загрузки формы:', error);
      StatusManager.showStatus('Ошибка загрузки формы', 'error');
    }
  }

  setupEventListeners() {
    const form = document.getElementById('dynamicForm');
    const submitBtn = document.getElementById('submitBtn');

    if (form && submitBtn) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }

  setupClearButton() {
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.style.backgroundColor = '#f44336'; // Красный цвет
    clearBtn.addEventListener('click', () => this.clearAllFeedbacks());
  }

  setupExportButton() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportToCSV());
    }
  }

  clearAllFeedbacks() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ отзывы? Это действие нельзя отменить.')) {
      try {
        StorageManager.clearAllFeedback();
        StorageManager.getAllFeedback();
        StatusManager.showStatus('Все отзывы успешно удалены!', 'success');
      } catch (error) {
        StatusManager.showStatus(`Ошибка очистки: ${error.message}`, 'error');
      }
    }
  }

  setupImportButton() {
    const formContainer = document.querySelector('.form-container');
    const importBtn = document.createElement('button');
    importBtn.id = 'importBtn';
    importBtn.className = 'export-btn';
    importBtn.textContent = 'Импорт формы из JSON';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.importFormFromFile(e.target.files[0]);
      }
    });

    importBtn.addEventListener('click', () => fileInput.click());

    formContainer.insertBefore(importBtn, document.getElementById('formContent'));
    formContainer.appendChild(fileInput);
  }

  async importFormFromFile(file) {
    try {
      const content = await file.text();
      const formConfig = JSON.parse(content);

      if (!this.validateFormConfig(formConfig)) {
        throw new Error('Неверный формат формы');
      }

      this.importManager.importedForms.set(formConfig.id, formConfig);

      this.importManager.availableForms.set(formConfig.id, {
        name: formConfig.title,
        id: formConfig.id,
        isImported: true
      });

      StatusManager.showStatus('Форма успешно импортирована!', 'success');
    } catch (error) {
      StatusManager.showStatus(`Ошибка импорта формы: ${error.message}`, 'error');
    }
  }

  validateFormConfig(config) {
    return config &&
      config.id &&
      config.title &&
      Array.isArray(config.fields);
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if (!this.formBuilder.validateForm()) {
      StatusManager.showStatus('Пожалуйста, заполните все обязательные поля', 'error');
      return;
    }

    const formData = this.formBuilder.getFormData();
    formData.timestamp = new Date().toISOString();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      StorageManager.saveFeedback(formData);
      StatusManager.showStatus('Отзыв успешно сохранен!', 'success');
      this.formBuilder.resetForm();

      this.loadFeedbacks();

    } catch (error) {
      StatusManager.showStatus(`Ошибка: ${error.message}`, 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  saveFeedbackLocally(feedback) {
    StorageManager.saveFeedback(feedback);
    this.feedbackData = StorageManager.getAllFeedback();
  }

  loadFeedbacks() {
    try {
      const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      this.feedbackData = feedbacks;

      const feedbackItems = document.getElementById('feedbackItems');
      if (!feedbackItems) return;

      feedbackItems.replaceChildren();

      const recentFeedbacks = feedbacks.slice(-10);

      if (recentFeedbacks.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Пока нет отзывов';
        feedbackItems.appendChild(p);
        return;
      }

      recentFeedbacks.forEach(feedback => {
        const item = document.createElement('div');
        item.className = 'feedback-item';

        const h3 = document.createElement('h3');
        h3.textContent = feedback.name || 'Аноним';
        item.appendChild(h3);

        if (feedback.message) {
          const messageP = document.createElement('p');

          const strong = document.createElement('strong');
          strong.textContent = 'Отзыв:';

          const textNode = document.createTextNode(' ' + feedback.message.substring(0, 100));

          if (feedback.message.length > 100) {
            const ellipsis = document.createTextNode('...');
            messageP.appendChild(strong);
            messageP.appendChild(textNode);
            messageP.appendChild(ellipsis);
          } else {
            messageP.appendChild(strong);
            messageP.appendChild(textNode);
          }

          item.appendChild(messageP);
        }

        const date = new Date(feedback.timestamp);
        const formattedDate = date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const dateP = document.createElement('p');
        dateP.className = 'date';
        dateP.textContent = formattedDate;
        item.appendChild(dateP);

        feedbackItems.appendChild(item);
      });

    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
      StatusManager.showStatus('Ошибка загрузки отзывов', 'error');
    }
  }

  exportToCSV() {
    const result = CsvUtility.exportToCSV(this.feedbackData);
    StatusManager.showStatus(result.message, result.type);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  new FeedbackApp();
});
