// Менеджер импорта форм
export default class ImportManager {
  constructor() {
    this.importedForms = new Map();
    this.availableForms = new Map();
  }

  async importFormFromFile(file) {
    try {
      const content = await file.text();
      const formConfig = JSON.parse(content);

      if (!this.validateFormConfig(formConfig)) {
        throw new Error('Неверный формат формы');
      }

      this.importedForms.set(formConfig.id, formConfig);

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

  validateFormConfig(config) {
    return config &&
      config.id &&
      config.title &&
      Array.isArray(config.fields);
  }

  exportForm(formId) {
    const form = this.importedForms.get(formId) || this.getBuiltInForm(formId);
    if (!form) {
      throw new Error('Форма не найдена');
    }

    return JSON.stringify(form, null, 2);
  }

  getAvailableForms() {
    const builtInForms = [
      { name: 'Обратная связь', id: 'default', isImported: false }
    ];

    const importedForms = Array.from(this.importedForms.entries()).map(([id, config]) => ({
      name: config.title,
      id: id,
      isImported: true
    }));

    return [...builtInForms, ...importedForms];
  }

  getForm(formId) {
    return this.importedForms.get(formId) || this.getBuiltInForm(formId);
  }

  getBuiltInForm(formId) {
    return null;
  }

  removeImportedForm(formId) {
    this.importedForms.delete(formId);
    this.availableForms.delete(formId);
  }

  getImportedForms() {
    return Array.from(this.importedForms.entries()).map(([id, config]) => ({
      id: id,
      title: config.title,
      fieldsCount: config.fields.length
    }));
  }
}
