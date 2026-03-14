class FormValidation {
  selectors = {
    form: '[data-js-form]',
    spanErrors: '[data-js-errors]',
    popUp: '[data-js-regForm-pop-up]',
    popUpCloseButton: '[data-js-popUp-button-close]',
  }

  stateClasses = {
    isValid: 'is-valid',
    isInvalid: 'is-invalid',
    isRequired: 'is-required',
  }

  visualClasses = {
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
    this.popUp = document.querySelector(this.selectors.popUp)
    this.popUpCloseButton = document.querySelector(this.selectors.popUpCloseButton)
    this.bindEvents()
  }

  isRadioChecked() {
    if (!this.form) return

    return [...this.form.gender].some(radio => radio.checked)
  }

  getErrorsList(fieldElement) {
    const isRequired = fieldElement.required

    if (!fieldElement || !isRequired) return []

    const validityState = fieldElement.validity
    const errorMessages = []

    Object.entries(this.errorMessages).forEach(([errorType, errorMessage]) => {
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
      newErrorElement.classList.add(this.visualClasses.errorSpan)
      newErrorElement.textContent = message
      fieldErrorsElement.append(newErrorElement)
    })
  }

  validateField(fieldElement) {
    const errorMessages = this.getErrorsList(fieldElement)

    this.manageErrors(fieldElement, errorMessages)

    const isValid = errorMessages.length === 0
    let isEmpty = fieldElement.value.length === 0

    const isToggleType = ['radio', 'checkbox'].includes(fieldElement.type)

    if (fieldElement.type === 'radio') {
      fieldElement.parentElement.classList.toggle(this.stateClasses.isRequired, !this.isRadioChecked())
    }

    if (fieldElement.type === 'checkbox') {
      fieldElement.parentElement.classList.toggle(this.stateClasses.isRequired, !fieldElement.checked)
    }

    if (!isToggleType) {
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

  updateFormValidityState() {
    this.requiredFields.forEach(field => {
      const isValid = this.getErrorsList(field).length === 0
      const fieldId = field.id

      if (fieldId in this.formValidityState) {
        this.formValidityState[fieldId] = isValid
      }
    })

    this.isRadioChecked() ?
      this.formValidityState.gender = true :
      this.formValidityState.gender = false


    return Object.values(this.formValidityState).every(value => value === true)
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

    let areAllValid = this.updateFormValidityState()

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
      this.form.style.display = 'none'
      this.popUp.showModal()
    }
  }

  bindEvents() {
    this.requiredFields.forEach(field => {
      field.addEventListener('input', () => this.toggleFormState())
    })
    document.addEventListener('blur', (event) => this.onBlur(event), true)
    document.addEventListener('change', (event) => this.onToggleChange(event))
    document.addEventListener('submit', (event) => this.onSubmit(event))
    this.popUpCloseButton.addEventListener('click', () => this.popUp.close())
  }
}

new FormValidation()

class ShowPassword {
  selectors = {
    fieldPassword: '[data-js-password-input]',
    showPasswordButton: '[data-js-show-password-button]',
  }

  stateClasses = {
    isActive: 'is-active',
  }

  constructor() {
    this.showPasswordButton = document.querySelector(this.selectors.showPasswordButton)
    this.fieldPassword = document.querySelector(this.selectors.fieldPassword)
    this.bindEvents()
  }

  get windowWidth() {
    return window.innerWidth
  }

  onPointerLeave = () => {
    this.fieldPassword.type = 'password'
    this.showPasswordButton.removeEventListener('pointerleave', this.onPointerLeave)
  }

  showPasswordDesktop(event) {
    if (!this.fieldPassword) return

    if (event.type === 'pointerdown') {
      this.fieldPassword.type = 'text'
      this.showPasswordButton.addEventListener('pointerleave', this.onPointerLeave)
    }

    if (event.type === 'pointerup') {
      this.fieldPassword.type = 'password'
    }
  }

  onDesktop(event) {
    if (this.windowWidth < 768) {
      this.showPasswordDesktop(event)
    }
  }

  showPasswordMobile() {
    if (!this.fieldPassword) return

    this.showPasswordButton.classList.toggle(this.stateClasses.isActive)
  }

  onMobile() {
    if (this.windowWidth < 768) {
      this.showPasswordMobile()
    }
  }


  bindEvents() {
    this.showPasswordButton.addEventListener('pointerdown', (event) => this.onDesktop(event))
    this.showPasswordButton.addEventListener('pointerup', (event) => this.onDesktop(event))
    this.showPasswordButton.addEventListener('click', () => this.onMobile())
  }
}

new ShowPassword()