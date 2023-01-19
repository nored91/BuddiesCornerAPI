import { ApiProperty } from "@nestjs/swagger";

export class ObjectResponseUpdate {

  @ApiProperty({ type: Number, description: 'Status Code', example: 200 })
  private statusCode: number;
  @ApiProperty({ type: Object, description: 'Message', example: 'The object has been updated successfully' })
  private message: string;
  @ApiProperty({ type: String, description: 'Object id', example: '6f8390ac-1ef2-4d3e-801a-27ae3072f3f5' })
  private id: string;

  constructor(id: string, message: string) {
    this.statusCode = 200;
    this.message = message;
    this.id = id;
  }
}