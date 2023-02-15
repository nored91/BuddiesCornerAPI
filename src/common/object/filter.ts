import { FindOptionsWhere, ILike } from 'typeorm';

export enum TypeRelation {
  Ilike,
  Eq
}

export interface OptionFilter {
  fields: string[];
  typeRelation: TypeRelation;
}

export interface ColumnFilter {
  relation?: string;
  optionFilter: OptionFilter[];
}
export class Filter<k> {
  constructOptionWhere(
    optionsWhere: FindOptionsWhere<k>,
    columns: ColumnFilter[],
    propertyName: string,
    relation?: string
  ): FindOptionsWhere<k> {
    const columnFilter: ColumnFilter = columns
      .filter((columnFilter: ColumnFilter) => {
        if (relation == columnFilter.relation) {
          return true;
        }
      })
      .pop();

    const optionFilter: OptionFilter = columnFilter.optionFilter
      .filter((optionFilter: OptionFilter) => {
        if (optionFilter.fields.includes(propertyName)) {
          return true;
        }
      })
      .pop();
    const typeRelation = optionFilter.typeRelation;

    switch (typeRelation) {
      case TypeRelation.Eq:
        if (columnFilter.relation) {
          if (!optionsWhere[columnFilter.relation]) optionsWhere[columnFilter.relation] = {};
          optionsWhere[columnFilter.relation][propertyName] = this[columnFilter.relation][propertyName];
        } else {
          optionsWhere[propertyName] = this[propertyName];
        }
        break;
      case TypeRelation.Ilike:
        if (columnFilter.relation) {
          if (!optionsWhere[columnFilter.relation]) optionsWhere[columnFilter.relation] = {};
          optionsWhere[columnFilter.relation][propertyName] = ILike('%' + this[columnFilter.relation][propertyName] + '%');
        } else {
          optionsWhere[propertyName] = ILike('%' + this[propertyName] + '%');
        }
        break;
    }
    return optionsWhere;
  }
  renderFilterOptionWhere(columns: ColumnFilter[]) {
    let optionsWhere: FindOptionsWhere<k> = {};

    Object.keys(this).forEach((propertyName: string) => {
      const val = this[propertyName];
      let relation = null;
      if (typeof this[propertyName] === 'object') {
        relation = propertyName;
        Object.keys(this[propertyName]).forEach((propertyNameRelation: string) => {
          let val = this[relation][propertyNameRelation];
          optionsWhere = this.constructOptionWhere(optionsWhere, columns, propertyNameRelation, relation);
        });
      } else {
        let val = this[propertyName];
        optionsWhere = this.constructOptionWhere(optionsWhere, columns, propertyName);
      }
    });

    return optionsWhere;
  }
}
