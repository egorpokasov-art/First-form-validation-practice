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

  fieldValidCounter = 0

  formValidityState = {
    login: false,
    password: false,
    gender: false,
    agreement: false,
  }

  constructor() {
    // this.form = document.querySelector(this.selectors.form)
    // this.passwordInput = document.querySelector(this.selectors.passwordInput)
    this.currentFormState = {...this.formValidityState}
    this.bindEvents()
  }

  resetFormState() {
    this.currentFormState = {...this.formValidityState}
  }

  getErrorsList(fieldElement) {
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

    return errorMessages
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
    const errorMessages = this.getErrorsList(fieldElement)

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

    if (isValid) this.fieldValidCounter += 1

    return isValid
  }

  onBlur(event) {
    const {target} = event
    const isRequired = target.required
    const isFormField = target.closest(this.selectors.form)

    if (target && isRequired && isFormField) {
      this.validateField(target)
    }
  }

  onToggleChange(event) {
    const {target} = event
    const isRequired = target.required
    const isToggleType = ['radio', 'checkbox'].includes(target.type)

    if (!isRequired || !isToggleType) return

    this.validateField(target)
  }

  // -----------------

  isFieldsEmpty() {
    const requiredFields = this.getRequiredFormFields()
    let isAllFieldsEmpty = false

    requiredFields.forEach(field => {
      if (field.value.length === 0) {
        isAllFieldsEmpty = true
      }

      if (field.checked) {
        isAllFieldsEmpty = false
      }
    })

    console.log(isAllFieldsEmpty)

    return isAllFieldsEmpty
  }

  isAllFieldsValid() {
    const requiredFields = this.getRequiredFormFields()
    let onlyOneInvalid = false
    let isAllFieldsValid = true

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        onlyOneInvalid = true
      }
    })

    if (onlyOneInvalid) isAllFieldsValid = false

    return isAllFieldsValid
  }

  // ---------------------

  getRequiredFormFields() {
    const formElement = document.querySelector(this.selectors.form)

    if (!formElement) return

    return [...formElement.elements].filter(element => element.required)
  }

  changeFormValidityState(fieldElement) {
    const isValid = this.getErrorsList(fieldElement).length === 0
    const fieldId = fieldElement.id
    const radios = []

    if (isValid) {
      Object.keys(this.formValidityState).forEach(key => {
        if (key === fieldId) {
          this.formValidityState[key] = true
        }
      })
    }

    if (fieldId === 'male' || fieldId === 'female') {
      radios.push(fieldElement)
    }

    if (radios.filter(radio => radio.checked === true).length !== 0) {
      this.formValidityState.gender = true
    }
  }

  showFormState(fieldElement) {
    const formElement = document.querySelector(this.selectors.form)

    if (!formElement) return

    this.changeFormValidityState(fieldElement)

    const isAllValid = Object.values(this.formValidityState)
      .filter(value => value === false).length === 0

    if (isAllValid) {
      formElement.classList.toggle(this.stateClasses.isValid)
    }

    this.resetFormState()
  }

  onSubmit(event) {
    const {target} = event
    const isForm = target.matches(this.selectors.form)
    let isFormValid = true
    let firstInvalidField = null

    if (!isForm) return

    const requiredFields = [...target.elements].filter(element => element.required)

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isFormValid = false

        if (!firstInvalidField) {
          firstInvalidField = field
        }
      }
    })

    if (!isFormValid) {
      event.preventDefault()

      target.classList.toggle(this.stateClasses.isInvalid)

      firstInvalidField.focus()
    }
  }

  bindEvents() {
    const requiredFields = this.getRequiredFormFields()

    requiredFields.forEach(field => {
      field.addEventListener('input', (event) => this.showFormState(event.target))
    })

    document.addEventListener('blur', (event) => this.onBlur(event), true)
    document.addEventListener('change', (event) => this.onToggleChange(event))
    document.addEventListener('submit', (event) => this.onSubmit(event))
  }
}

new formValidation()