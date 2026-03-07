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

  formValidityState = {
    login: false,
    password: false,
    gender: false,
    agreement: false,
  }

  constructor() {
    this.requiredFields = this.getRequiredFormFields()

    this.bindEvents()
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

  // -----------------

  getRequiredFormFields() {
    const formElement = document.querySelector(this.selectors.form)

    if (!formElement) return

    return [...formElement.elements].filter(element => element.required)
  }

  isAnyFieldsEmpty(fieldElement) {
    // const requiredFields = this.getRequiredFormFields()
    let isAnyFieldsEmpty = false
    const radios = []

    this.requiredFields.forEach(field => {
      if (field.value.length === 0) {
        isAnyFieldsEmpty = true
      }

      if (fieldElement.type === 'radio') {
        radios.push(fieldElement)
      }

      if (radios.filter(radio => radio.checked === true).length !== 0) {
        isAnyFieldsEmpty = false
      }

      if (fieldElement.type === 'checkbox' && !field.checked) {
        isAnyFieldsEmpty = true
      }
    })

    console.log(`Некоторые элементы пустые? - ${isAnyFieldsEmpty}`)

    return isAnyFieldsEmpty
  }

  // ---------------------

  clearErrorMessages() {
    const allFieldErrors = document.querySelectorAll(this.selectors.spanErrors)

    allFieldErrors.forEach(fieldError => fieldError.innerHTML = '')
  }

  changeFormValidityState(fieldElement) {
    const isValid = this.getErrorsList(fieldElement).length === 0
    const fieldElementId = fieldElement.id
    const radios = []

    if (isValid) {
      Object.keys(this.formValidityState).forEach(key => {
        if (key === fieldElementId) {
          this.formValidityState[key] = true
        }
      })
    } else {
      Object.keys(this.formValidityState).forEach(key => {
        if (key === fieldElementId) {
          this.formValidityState[key] = false
        }
      })
    }

    if (fieldElementId === 'male' || fieldElementId === 'female') {
      radios.push(fieldElement)
    }

    if (radios.filter(radio => radio.checked === true).length !== 0) {
      this.formValidityState.gender = true
    }
  }

  showFormState(fieldElement) {
    const formElement = document.querySelector(this.selectors.form)

    if ( !fieldElement || !formElement) return

    this.changeFormValidityState(fieldElement)

    const isAllValid = Object.values(this.formValidityState)
      .filter(value => value === false).length === 0

    if (isAllValid) {
      formElement.classList.remove(this.stateClasses.isInvalid)
      this.clearErrorMessages()
    }

    formElement.classList.toggle(this.stateClasses.isValid, isAllValid)

    // console.log('запустился сложный метод')
  }

  onSubmit(event) {
    const {target} = event
    const isForm = target.matches(this.selectors.form)
    let isFormValid = true
    let firstInvalidField = null

    if (!target || !isForm) return

    const radioGroups = new Set()

    // this.requiredFields.forEach(field => {
    //   // Для радио-кнопок собираем группы
    //   if (field.type === 'radio') {
    //     radioGroups.add(field.name)
    //     return // пропускаем индивидуальную проверку
    //   }
    // })

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