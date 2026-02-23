// Менеджер импорта форм
export default class ImportManager {
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
