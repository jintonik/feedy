// Инициализация компонентов
class FormBuilder {
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

// Менеджер импорта форм
class ImportManager {
    constructor() {
        this.importedForms = new Map();
        this.availableForms = new Map();
    }

    // Импорт формы из JSON файла
    async importFormFromFile(file) {
        try {
            const content = await file.text();
            const formConfig = JSON.parse(content);

            // Валидация формы
            if (!this.validateFormConfig(formConfig)) {
                throw new Error('Неверный формат формы');
            }

            // Сохраняем импортированную форму
            this.importedForms.set(formConfig.id, formConfig);

            // Добавляем в список доступных форм
            this.availableForms.set(formConfig.id, {
                name: formConfig.title,
                id: formConfig.id,
                isImported: true
            });

            return formConfig;
        } catch (error) {
            throw new Error(`Ошибка импорта формы: ${error.message}`);
        }
    }

    // Валидация конфигурации формы
    validateFormConfig(config) {
        return config &&
               config.id &&
               config.title &&
               Array.isArray(config.fields);
    }

    // Экспорт формы в JSON
    exportForm(formId) {
        const form = this.importedForms.get(formId) || this.getBuiltInForm(formId);
        if (!form) {
            throw new Error('Форма не найдена');
        }

        return JSON.stringify(form, null, 2);
    }

    // Получение списка всех доступных форм
    getAvailableForms() {
        // Сначала встроенные формы
        const builtInForms = [
            { name: 'Обратная связь', id: 'default', isImported: false }
        ];

        // Затем импортированные формы
        const importedForms = Array.from(this.importedForms.entries()).map(([id, config]) => ({
            name: config.title,
            id: id,
            isImported: true
        }));

        return [...builtInForms, ...importedForms];
    }

    // Получение формы по ID
    getForm(formId) {
        return this.importedForms.get(formId) || this.getBuiltInForm(formId);
    }

    // Получение встроенной формы
    getBuiltInForm(formId) {
        // Для простоты возвращаем null, можно добавить логику
        return null;
    }

    // Удаление импортированной формы
    removeImportedForm(formId) {
        this.importedForms.delete(formId);
        this.availableForms.delete(formId);
    }

    // Список импортированных форм
    getImportedForms() {
        return Array.from(this.importedForms.entries()).map(([id, config]) => ({
            id: id,
            title: config.title,
            fieldsCount: config.fields.length
        }));
    }
}

// Основной класс приложения
class FeedbackApp {
    constructor() {
        this.formBuilder = new FormBuilder();
        this.importManager = new ImportManager();
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
            const formHTML = this.formBuilder.createFormHTML(config);
            document.getElementById('formContent').innerHTML = formHTML;

            // Применяем тему
            this.formBuilder.applyTheme(config.theme);

            // Перезагружаем обработчики событий
            this.setupEventListeners();

        } catch (error) {
            console.error('Ошибка загрузки формы:', error);
            this.showStatus('Ошибка загрузки формы', 'error');
        }
    }

    setupEventListeners() {
        // Обработчик отправки формы
        const form = document.getElementById('dynamicForm');
        const submitBtn = document.getElementById('submitBtn');

        if (form && submitBtn) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    // Добавляем кнопку очистки данных
    setupClearButton() {
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.style.backgroundColor = '#f44336'; // Красный цвет

        clearBtn.addEventListener('click', () => this.clearAllFeedbacks());
    }

    // Добавляем кнопку экспорта
    setupExportButton() {
        // Обработчик экспорта
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }
    }

    // Метод очистки всех отзывов
    clearAllFeedbacks() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ отзывы? Это действие нельзя отменить.')) {
            try {
                localStorage.removeItem('feedbacks');
                this.feedbackData = [];
                this.loadFeedbacks();
                this.showStatus('Все отзывы успешно удалены!', 'success');
            } catch (error) {
                this.showStatus(`Ошибка очистки: ${error.message}`, 'error');
            }
        }
    }

    setupImportButton() {
        const formContainer = document.querySelector('.form-container');
        const importBtn = document.createElement('button');
        importBtn.id = 'importBtn';
        importBtn.className = 'export-btn';
        importBtn.textContent = 'Импорт формы из JSON';

        // Добавляем скрытый input для выбора файла
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

        // Вставляем кнопку перед формой
        formContainer.insertBefore(importBtn, document.getElementById('formContent'));
        formContainer.appendChild(fileInput);
    }

    async importFormFromFile(file) {
        try {
            const content = await file.text();
            const formConfig = JSON.parse(content);

            // Валидация формы
            if (!this.validateFormConfig(formConfig)) {
                throw new Error('Неверный формат формы');
            }

            // Сохраняем импортированную форму
            this.importManager.importedForms.set(formConfig.id, formConfig);

            // Добавляем в список доступных форм
            this.importManager.availableForms.set(formConfig.id, {
                name: formConfig.title,
                id: formConfig.id,
                isImported: true
            });

            this.showStatus('Форма успешно импортирована!', 'success');

        } catch (error) {
            this.showStatus(`Ошибка импорта формы: ${error.message}`, 'error');
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

        // Валидация формы
        if (!this.formBuilder.validateForm()) {
            this.showStatus('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        // Получаем данные формы
        const formData = this.formBuilder.getFormData();
        formData.timestamp = new Date().toISOString();

        // Отключаем кнопку во время отправки
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Сохраняем локально
            this.saveFeedbackLocally(formData);
            this.showStatus('Отзыв успешно сохранен!', 'success');
            this.formBuilder.resetForm();

            // Обновляем список отзывов
            this.loadFeedbacks();

        } catch (error) {
            this.showStatus(`Ошибка: ${error.message}`, 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    saveFeedbackLocally(feedback) {
        // Получаем существующие отзывы
        const existingFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        existingFeedbacks.push(feedback);
        localStorage.setItem('feedbacks', JSON.stringify(existingFeedbacks));

        // Сохраняем в локальный массив
        this.feedbackData = existingFeedbacks;
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type} show`;

        // Автоматически скрыть сообщение через 5 секунд
        setTimeout(() => {
            statusDiv.className = 'status-message';
        }, 5000);
    }

    loadFeedbacks() {
        try {
            // Получаем отзывы из localStorage
            const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
            this.feedbackData = feedbacks;

            // Очищаем текущий список
            const feedbackItems = document.getElementById('feedbackItems');
            if (!feedbackItems) return;

            feedbackItems.innerHTML = '';

            // Показываем последние 10 отзывов
            const recentFeedbacks = feedbacks.slice(-10);

            if (recentFeedbacks.length === 0) {
                feedbackItems.innerHTML = '<p>Пока нет отзывов</p>';
                return;
            }

            recentFeedbacks.forEach(feedback => {
                const item = document.createElement('div');
                item.className = 'feedback-item';

                // Форматируем дату
                const date = new Date(feedback.timestamp);
                const formattedDate = date.toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Создаем HTML для отзыва
                let content = `<h3>${feedback.name || 'Аноним'}</h3>`;

                if (feedback.message) {
                    content += `<p><strong>Отзыв:</strong> ${feedback.message.substring(0, 100)}${feedback.message.length > 100 ? '...' : ''}</p>`;
                }

                content += `<p class="date">${formattedDate}</p>`;

                item.innerHTML = content;
                feedbackItems.appendChild(item);
            });
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            this.showStatus('Ошибка загрузки отзывов', 'error');
        }
    }

     exportToCSV() {
         try {
            // Получаем все отзывы
            const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');

            if (feedbacks.length === 0) {
                this.showStatus('Нет отзывов для экспорта', 'error');
                return;
            }

            // Создаем CSV содержимое
            let csvContent = '"Дата","Имя","Email","Отзыв","Оценка","Функции"\n';

            feedbacks.forEach(feedback => {
                const row = [
                    `"${new Date(feedback.timestamp).toLocaleString('ru-RU')}"`,
                    `"${feedback.name || 'Аноним'}"`,
                    `"${feedback.email || ''}"`,
                    `"${feedback.message || ''}"`,
                    `"${feedback.rating || ''}"`,
                    `"${feedback.features ? feedback.features.join(', ') : ''}"`
                ].join(',');

                csvContent += row + '\n';
            });

            // Создаем Blob и скачиваем файл
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'feedback-export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showStatus('Отзывы успешно экспортированы в CSV!', 'success');

        } catch (error) {
            this.showStatus(`Ошибка экспорта: ${error.message}`, 'error');
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackApp();
});
