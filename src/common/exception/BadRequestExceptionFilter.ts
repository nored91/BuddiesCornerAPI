import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, HttpException } from '@nestjs/common';
import { BadRequestExceptionValidation } from './BadRequestExceptionValidation';

@Catch(BadRequestExceptionValidation)
export class BadRequestExceptionFilter implements ExceptionFilter<BadRequestExceptionValidation> {

  catch(exception: BadRequestExceptionValidation, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message,
        data: exception.validationErrorsMessage,
        path: request.url,
      });
  }
}