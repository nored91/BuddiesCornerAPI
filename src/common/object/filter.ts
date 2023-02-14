import { FindOptionsWhere, ILike } from 'typeorm';

export interface NestedFilter {
  relation: string;
  fields: string[];
}
export class Filter<k> {
  renderFilterOptionWhere(eqColumns: string[], ilikeColumns: string[], relationColumns: NestedFilter[]) {
    const optionsWhere: FindOptionsWhere<k> = {};
    eqColumns.forEach((val) => {
      if (this[val] != undefined) {
        optionsWhere[val] = this[val];
      }
    });
    ilikeColumns.forEach((val) => {
      if (this[val]) {
        optionsWhere[val] = ILike('%' + this[val] + '%');
      }
    });
    relationColumns.forEach((nestedFilter: NestedFilter) => {
      nestedFilter.fields.forEach((fieldname) => {
        if (this[nestedFilter.relation][fieldname]) {
          optionsWhere[nestedFilter.relation] = {};
          //optionsWhere[nestedFilter.relation][fieldname] = ILike('%' + this[nestedFilter.relation][fieldname] + '%');
          optionsWhere[nestedFilter.relation][fieldname] = this[nestedFilter.relation][fieldname];
        }
      });
    });

    return optionsWhere;
  }
}
