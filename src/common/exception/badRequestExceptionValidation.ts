import { BadRequestException, ValidationError } from '@nestjs/common';
import { ValidationErrorMessage } from '../object/validationErrorMessage.object';

export class BadRequestExceptionValidation extends BadRequestException {
  validationErrorsMessage: ValidationErrorMessage[];
  constructor(ValidationErrors: ValidationError[]) {
    super('Bad Request - Validation failed');
    this.validationErrorsMessage = [];
    console.log(ValidationErrors);
    ValidationErrors.forEach((val) => {
      let validationErrorMessage = new ValidationErrorMessage();
      /*if (val.children.length > 0) {
        validationErrorMessage.fieldName = val.children.;
      }
      else{
        validationErrorMessage.fieldName = val.property;
      }*/
      validationErrorMessage.fieldName = val.property;

      validationErrorMessage.propertyErrors = Object.values(val.constraints);
      this.validationErrorsMessage.push(validationErrorMessage);
    });
  }
}
