import { ApiProperty } from "@nestjs/swagger";

export class ObjectResponseCreate<k>{

  @ApiProperty({ type: Number, description: 'Status Code', example: 201 })
  private statusCode: number;
  @ApiProperty({ type: Object, description: 'Message', example: 'The Object has been created successfully' })
  private message: string;
  @ApiProperty({ type: Object, description: 'Record created', example: {} })
  private record: k;

  constructor(record: k, message: string) {
    this.statusCode = 201;
    this.message = message;
    this.record = record;
  }
}