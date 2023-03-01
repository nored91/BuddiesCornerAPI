import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

@Catch(ObjectNotFoundException)
export class ObjectNotFoundException extends HttpException {
  @ApiProperty({ type: String, description: 'Message', example: 'Task not found with id : 58869b57-0b16-407c-adc7-d4a28ae66962' })
  message: string;
  @ApiProperty({ type: Number, description: 'Status code', example: 404 })
  statusCode: number;
  @ApiProperty({ type: Number, description: 'Path', example: '/object/58869b57-0b16-407c-adc7-d4a28ae66962' })
  path: string;

  catch(exception: ObjectNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      path: request.url
    });
  }
}
