import { BadRequestException, ValidationError } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorMessage } from '../object/validationErrorMessage.object';

export class BadRequestExceptionValidation extends BadRequestException {
  validationErrorsMessage: ValidationErrorMessage[];
  @ApiProperty({ type: String, description: 'Message', example: 'Bad Request - Validation failed' })
  message: string;
  @ApiProperty({ type: Number, description: 'Status code', example: 400 })
  statusCode: number;
  @ApiProperty({
    type: Array,
    description: 'Validation error message',
    example: [
      {
        fieldName: 'achieve',
        propertyErrors: ['achieve must be a boolean value']
      }
    ]
  })
  data: ValidationErrorMessage[];

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
