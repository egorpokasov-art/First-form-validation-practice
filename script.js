class formValidation {
  selectors = {
    form: '[data-js-form]',
    spanErrors: '[data-js-errors]',
    passwordInput: '[data-js-password-input]',
  }

  stateClasses = {
    // formValid: 'is-valid',
    // formInvalid: 'is-invalid',
    // inputValid: 'is-valid',
    // inputInvalid: 'is-invalid',
    isValid: 'is-valid',
    isInvalid: 'is-invalid',
    isRequired: 'is-required',
  }

  setClasses = {
    errorSpan: 'field__error',
  }

  errorMessages = {
    valueMissing: () => 'Пожалуйста, заполните это поле.',
    patternMismatch: ({ title }) => title || 'Пароль не соответствует требованиям заполнения.',
    tooLong: ({ maxLength }) => `Максимальное количество вводимых символов - ${maxLength}`,
    tooShort: ({ minLength, type }) => {
      return type === 'password' ?
        `Пароль должен содержать не менее ${minLength} символов.` :
        `Минимальная длина логина не менее ${minLength} символов.`
    },
  }

  constructor() {
    this.form = document.querySelector(this.selectors.form)
    this.passwordInput = document.querySelector(this.selectors.passwordInput)

    this.bindEvents()
  }

  manageErrors(fieldElement, errorMessages) {
    if (!fieldElement && !errorMessages) return

    const fieldErrorsElement = fieldElement.parentElement.querySelector(this.selectors.spanErrors)

    fieldErrorsElement.innerHTML = ''

    errorMessages.forEach((message) => {
      const newErrorElement = document.createElement('span')
      newErrorElement.classList.add(this.setClasses.errorSpan)
      newErrorElement.textContent = message
      fieldErrorsElement.append(newErrorElement)
    })
  }

  validateField(fieldElement) {
    const isRequired = fieldElement.required

    if (!fieldElement || !isRequired) return;

    const validityState = fieldElement.validity
    const errors = Object.entries(this.errorMessages)
    const errorMessages = []

    errors.forEach(([errorType, errorMessage]) => {
      if (validityState[errorType]) {
        errorMessages.push(errorMessage(fieldElement))
      }
    })

    this.manageErrors(fieldElement, errorMessages)

    const isValid = errorMessages.length === 0
    const isEmpty = fieldElement.value.length === 0

    fieldElement.classList.toggle(this.stateClasses.isInvalid, !isValid)
    fieldElement.parentElement.classList.toggle(this.stateClasses.isRequired, isEmpty)

    fieldElement.ariaInvalid = !isValid

    return isValid
  }

  onBlur(event) {
    const { target } = event
    const isRequired = target.required

    if (target && isRequired) {
      this.validateField(target)
    }
  }

  bindEvents() {
    document.addEventListener('blur', (event) => this.onBlur(event), true)
  }
}

new formValidation()