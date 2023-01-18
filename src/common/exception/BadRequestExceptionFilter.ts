import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, HttpException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter<BadRequestException> {

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    /*console.log('passsse');

    console.log(exception.getResponse());

    let exceptionResponse = exception.message;
    let message = [];

    if (exceptionResponse instanceof Object) {
      let validationErrors: ValidationError[] = exceptionResponse as ValidationError[];
      //console.log(validationErrors);
      validationErrors.map((val: ValidationError, i: number) => {
        return { [val.property]: val.constraints }
      })
      message = validationErrors;
    }*/


    response
      .status(400)
      // you can manipulate the response here
      .json({
        statusCode: status,
        message: exception.message,
        path: request.url,
      });
  }
}