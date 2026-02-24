const MAX_FILE_SIZE = 1024 * 1024;
const MAX_DEPTH = 10;

export default class ImportManager {
  constructor() {
    this.importedForms = new Map();
    this.availableForms = new Map();
  }

  async importFormFromFile(file) {
    try {

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Файл слишком большой. Максимальный размер: 1MB');
      }

      if (!file.name.endsWith('.json')) {
        throw new Error('Разрешены только JSON файлы');
      }

      const content = await file.text();

      if (content.length > MAX_FILE_SIZE) {
        throw new Error('Содержимое файла слишком большое. Максимальный размер: 1MB');
      }

      if (!this.checkJsonDepth(content)) {
        throw new Error(`Слишком глубокая вложенность JSON. Максимальная глубина: ${MAX_DEPTH} уровней`);
      }

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

  checkJsonDepth(jsonString) {


    const cleanJson = jsonString.replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем блочные комментарии
      .replace(/\/\/.*$/gm, '');                                  // Удаляем строковые комментарии

    let depth = 0;
    let maxDepth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanJson.length; i++) {
        const char = cleanJson[i];

      if (escapeNext) {
            escapeNext = false;
            continue;
      }

      if (char === '\\' && inString) {
            escapeNext = true;
            continue;
      }

      if (char === '"' && !inString) {
            inString = true;
      } else if (char === '"' && inString) {
            inString = false;
      }

      if (!inString) {
        if (char === '{' || char === '[') {
                depth++;
          maxDepth = Math.max(maxDepth, depth);
        } else if (char === '}' || char === ']') {
                depth--;
        }
      }
    }

    return maxDepth <= MAX_DEPTH;
  }

  validateFormConfig(config) {
    if (config.fields.length > 100) {
      throw new Error('Слишком болльшое количество полей.')
    }
    config.fields.forEach(field => {
      if (field.placeholder && field.placeholder.length > 200) {
        throw new Error('Слишком длинный placeholder');
      }
      if (field.label && field.label.length > 100) {
        throw new Error('Слишком длинный заголовок поля');
      }
    });
    return config &&
      config.id &&
      config.title &&
      Array.isArray(config.fields) &&
      config.fields.length <= 50;
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
