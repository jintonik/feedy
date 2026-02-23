export default class UIComponents {
  static createTextInput(field) {
    const div = document.createElement('div');
    div.className = 'questions';

    const h3 = document.createElement('h3');
    h3.textContent = `${field.label}${field.required ? ' *' : ''}`;
    div.appendChild(h3);

    const input = document.createElement('input');
    input.type = field.type;
    input.id = field.id;
    input.name = field.id;
    if (field.required) {
      input.required = true;
    }
    if (field.placeholder) {
      input.placeholder = field.placeholder;
    }
    div.appendChild(input);

    return div;
  }

  static createTextArea(field) {
    const div = document.createElement('div');
    div.className = 'question';

    const h3 = document.createElement('h3');
    h3.textContent = `${field.label}${field.required ? ' *' : ''}`;
    div.appendChild(h3);

    const textArea = document.createElement('textarea');
    textArea.id = field.id;
    textArea.name = field.id;
    if (field.required) {
      textArea.required = true;
    }
    if (field.placeholder) {
      textArea.placeholder = field;
    }
    textArea.rows = 4;
    div.appendChild(textArea);

    return div;
  }

  static createRatingInput(field) {
    const div = document.createElement('div');
    div.className = 'question';

    const h3 = document.createElement('h3');
    h3.textContent = `${field.label}${field.required ? ' *' : ''}`;
    div.appendChild(h3);

    const select = document.createElement('select');
    select.id = field.id;
    select.name = field.id;
    if (field.required) {
      select.required = true;
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Выберите оценку';
    select.appendChild(defaultOption);

    field.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });
    div.appendChild(select);

    return div;
  }

  static createRadioGroup(field) {
    const div = document.createElement('div');
    div.className = 'question';

    const h3 = document.createElement('h3');
    h3.textContent = `${field.label}${field.required ? ' *' : ''}`;
    div.appendChild(h3);

    const group = document.createElement('div');
    group.className = 'radio-group';

    field.options.forEach(option => {
      const label = document.createElement('label');
      label.className = 'radio-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = field.id;
      input.value = option;
      if (field.required) input.required = true;

      const customRadio = document.createElement('span');
      customRadio.className = 'radio-custom';

      const span = document.createElement('span');
      span.textContent = option;

      label.appendChild(input);
      label.appendChild(customRadio);
      label.appendChild(span);
      group.appendChild(label);
    });
    div.appendChild(group);

    return div;
  }

  static createCheckboxGroup(field) {
    const div = document.createElement('div');
    div.className = 'question';

    const h3 = document.createElement('h3');
    h3.textContent = field.label;
    div.appendChild(h3);

    const group = document.createElement('div');
    group.className = 'checkbox-group';

    field.options.forEach(option => {
      const label = document.createElement('label');
      label.className = 'checkbox-option';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = field.id;
      input.value = option;

      const customCheckbox = document.createElement('span');
      customCheckbox.className = 'checkbox-custom';

      const span = document.createElement('span');
      span.textContent = option;

      label.appendChild(input);
      label.appendChild(customCheckbox);
      label.appendChild(span);
      group.appendChild(label);
    });
    div.appendChild(group);

    return div;
  }

  static createForm(formFields) {
    const button = document.createElement('button');
    button.type = 'submit';
    button.id = 'submitBtn';
    button.className = 'submit-btn';

    const btnSpanText = document.createElement('span');
    btnSpanText.className = 'btn-text';
    btnSpanText.textContent = 'Сохранить отзыв';
    button.appendChild(btnSpanText);

    const btnSpanStatus = document.createElement('span');
    btnSpanStatus.className = 'btn-loading';
    btnSpanStatus.textContent = 'Сохранение...';
    button.appendChild(btnSpanStatus);

    const form = document.createElement('form');
    form.id = 'dynamicForm';
    form.className = 'dynamic-form';

    const fragment = document.createDocumentFragment();

    formFields.fields.forEach(field => {
            let fieldElement;
      switch (field.type) {
      case 'text':
      case 'email':
        fieldElement = this.createTextInput(field);
                    break;
      case 'textarea':
        fieldElement = this.createTextArea(field);
                    break;
      case 'rating':
      case 'select':
        fieldElement = this.createRatingInput(field);
                    break;
      case 'radio':
        fieldElement = this.createRadioGroup(field);
                    break;
      case 'checkbox':
        fieldElement = this.createCheckboxGroup(field);
                    break;
      default:
        fieldElement = this.createTextInput(field);
      }
      fragment.appendChild(fieldElement);
    });
    form.appendChild(fragment);
    form.appendChild(button);

    return form;
  }
}
