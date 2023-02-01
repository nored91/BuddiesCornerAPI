import { ApiProperty } from '@nestjs/swagger';

export class ObjectResponse<k> {
  @ApiProperty({ type: Number, description: 'Count of records', example: 12 })
  private count: number;
  @ApiProperty({ type: Array<k>, description: 'Array of Records', example: [] })
  private records: k[];

  constructor(response: [k[], number]) {
    this.count = response[1];
    this.records = response[0];
  }

  public getCount(): number {
    return this.count;
  }

  public getRecords(): k[] {
    return this.records;
  }
}
