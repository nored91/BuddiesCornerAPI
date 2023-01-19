export class ObjectResponse<k>{
  count: number
  records: k[]

  constructor(response: [k[], number]) {
    this.count = response[1]
    this.records = response[0]
  }
}