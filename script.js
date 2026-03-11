class FormValidation {
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
        `Минимальная длина пароля - ${minLength} символов.` :
        `Минимальная длина логина не менее ${minLength} символов.`
    },
  }

  formValidityState = {
    login: false,
    password: false,
    gender: false,
    agreement: false,
  }

  constructor() {
    this.form = document.querySelector(this.selectors.form)
    this.fieldErrors = document.querySelectorAll(this.selectors.spanErrors)
    this.requiredFields = [...this.form.elements].filter(element => element.required)
    this.bindEvents()
  }

  isRadioChecked() {
    if (!this.form) return

    return [...this.form.gender].some(radio => radio.checked)
  }

  getErrorsList(fieldElement) {
    const isRequired = fieldElement.required

    if (!fieldElement || !isRequired) return;

    const validityState = fieldElement.validity
    const errors = Object.entries(this.errorMessages)
    const errorMessages = []
    let isRadioValid = false

    if (fieldElement.type === 'radio') {
      isRadioValid = this.isRadioChecked()

      if (isRadioValid) {
        errorMessages.length = 0
      } else {
        errorMessages.push(this.errorMessages.valueMissing())
      }
    } else {
      errors.forEach(([errorType, errorMessage]) => {
        if (validityState[errorType]) {
          errorMessages.push(errorMessage(fieldElement))
        }
      })
    }

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
    if (!fieldElement.required) return

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

  isLeasOneFieldEmpty() {
    console.log('Проверка')
    return this.requiredFields.some(field => field.validity.valueMissing === true)
  }

  clearErrorMessages() {
    this.fieldErrors.forEach(fieldError => fieldError.innerHTML = '')
  }

  uploadFormValidityState() {
    this.requiredFields.forEach(field => {
      const isValid = this.getErrorsList(field).length === 0
      const fieldId = field.id

      Object.keys(this.formValidityState).forEach(key => {
        if (isValid) {
          if (key === fieldId) {
            this.formValidityState[key] = true
          }
        } else {
          if (key === fieldId) {
            this.formValidityState[key] = false
          }
        }
      })
    })

    this.isRadioChecked() ?
      this.formValidityState.gender = true :
      this.formValidityState.gender = false

    const isAllValid = Object.values(this.formValidityState)
      .every(value => value === true)

    return isAllValid
  }

  showFormState() {
    if (!this.form) return

    this.form.classList.remove(this.stateClasses.isInvalid)
    this.clearErrorMessages()
    this.requiredFields.forEach(field => {
      field.parentElement.classList.remove(this.stateClasses.isRequired)
    })

    console.log('Запустился сложный метод')
  }

  toggleFormState() {
    const isFieldsAlreadyValid = Object.values(this.formValidityState)
      .every(stateField => stateField === true)

    if (!isFieldsAlreadyValid) {
      if (this.isLeasOneFieldEmpty()) return
    }

    let areAllValid = this.uploadFormValidityState()

    if (areAllValid) {
      this.showFormState()
    }

    this.form.classList.toggle(this.stateClasses.isValid, areAllValid)

  }

  onSubmit(event) {
    const {target} = event
    const isForm = target.matches(this.selectors.form)
    let isFormValid = true
    let firstInvalidField = null

    if (!target || !isForm) return

    this.requiredFields.forEach(field => {
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
    } else {
      return true
    }
  }

  bindEvents() {
    this.requiredFields.forEach(field => {
      field.addEventListener('input', () => this.toggleFormState())
    })
    document.addEventListener('blur', (event) => this.onBlur(event), true)
    document.addEventListener('change', (event) => this.onToggleChange(event))
    document.addEventListener('submit', (event) => this.onSubmit(event))
  }
}

new FormValidation()

class FormRegPopUp {

}
