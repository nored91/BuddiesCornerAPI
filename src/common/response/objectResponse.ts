export class ObjectResponse<k>{
  private count: number;
  private records: k[];

  constructor(response: [k[], number]) {
    this.count = response[1];
    this.records = response[0];
  }
}