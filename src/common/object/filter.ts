import { FindOptionsWhere, ILike } from "typeorm";

export class Filter<k> {

  renderFilterOptionWhere(eqColumns: string[], ilikeColumns: string[]) {
    let optionsWhere: FindOptionsWhere<k> = {};
    eqColumns.forEach((val) => {
      if (this[val]) {
        optionsWhere[val] = this[val]
      }
    });
    ilikeColumns.forEach((val) => {
      if (this[val]) {
        optionsWhere[val] = ILike('%' + this[val] + '%')
      }
    });
    return optionsWhere;
  }
}