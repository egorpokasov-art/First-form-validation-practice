class formValidation {
  selectors = {
    form: '[data-js-form]',
    spanErrors: '[data-js-errors]',
    passwordInput: '[data-js-password-input]',
  }

  stateClasses = {
    isValid: 'is-valid',
    isInvalid: 'is-invalid',
    isRequired: 'is-required',
  }

  setClasses = {
    errorSpan: 'field__error',
  }

  errorMessages = {
    valueMissing: () => 'Пожалуйста, заполните это поле.',
    patternMismatch: ({title}) => title || 'Пароль не соответствует требованиям заполнения.',
    tooLong: ({maxLength}) => `Максимальное количество вводимых символов - ${maxLength}`,
    tooShort: ({minLength, type}) => {
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
    const isToggleType = ['radio', 'checkbox'].includes(fieldElement.type)

    if (isToggleType) {
      const isChecked = fieldElement.checked

      fieldElement.parentElement.classList.toggle(this.stateClasses.isRequired, !isChecked)
    } else {
      fieldElement.parentElement.classList.toggle(this.stateClasses.isRequired, isEmpty)
    }

    fieldElement.classList.toggle(this.stateClasses.isInvalid, !isValid && !isEmpty)

    fieldElement.ariaInvalid = !isValid

    return isValid
  }

  onBlur(event) {
    const { target } = event
    const isRequired = target.required
    const isFormField = target.closest(this.selectors.form)

    if (target && isRequired && isFormField) {
      this.validateField(target)
    }
  }

  onToggleChange(event) {
    const { target } = event
    const isRequired = target.required
    const isToggleType = ['radio', 'checkbox'].includes(target.type)

    if (!isRequired || !isToggleType) return

    this.validateField(target)
  }

  onFormStatusChange(event) {
    const { target } = event
    const formElement = target.matches(this.selectors.form)

    if (!isForm || !target) return

    const requiredFields = [...target.elements].filter(element => element.required)

    const validFields = requiredFields.filter(field => {
      let isValid = this.validateField(field)

      if (isValid) {
        return field
      }
    })

    if (requiredFields.length === validFields.length) {
      target.style.boxShadow = '3px 3px 15px var(--color-green)'
    }
  }

  onSubmit(event) {
    const { target } = event
    const isForm = target.matches(this.selectors.form)

    if (!isForm) return

    event.preventDefault()

    const requiredFields = [...target.elements].filter(element => element.required)

    requiredFields.forEach(field => {
      this.validateField(field)
    })


  }

  bindEvents() {
    document.addEventListener('blur', (event) => this.onBlur(event), true)
    document.addEventListener('change', (event) => this.onToggleChange(event))
    document.addEventListener('change', (event) => this.onFormStatusChange(event))
    document.addEventListener('submit', (event) => this.onSubmit(event))
  }
}

new formValidation()