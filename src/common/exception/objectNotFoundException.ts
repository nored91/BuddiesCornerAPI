import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { BadRequestExceptionValidation } from './badRequestExceptionValidation';

@Catch(ObjectNotFoundException)
export class ObjectNotFoundException extends HttpException {

  catch(exception: ObjectNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message,
        path: request.url,
      });
  }
}