import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';

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