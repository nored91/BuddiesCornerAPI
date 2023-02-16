import { BadRequestException, ValidationError } from '@nestjs/common';
import { ValidationErrorMessage } from '../object/validationErrorMessage.object';

export class BadRequestExceptionValidation extends BadRequestException {
  validationErrorsMessage: ValidationErrorMessage[];
  constructor(ValidationErrors: ValidationError[]) {
    super('Bad Request - Validation failed');
    this.validationErrorsMessage = [];
    this.parseValidationError(ValidationErrors);
  }

  public parseValidationError(ValidationErrors: ValidationError[]) {
    ValidationErrors.forEach((val) => {
      if (val.children && val.children.length > 0) {
        this.parseValidationError(val.children);
      }
      if (val.constraints) {
        let validationErrorMessage = new ValidationErrorMessage();
        validationErrorMessage.fieldName = val.property;
        validationErrorMessage.propertyErrors = Object.values(val.constraints);
        this.validationErrorsMessage.push(validationErrorMessage);
      }
    });
  }
}
