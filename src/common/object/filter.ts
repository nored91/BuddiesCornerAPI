import { FindOptionsWhere, ILike } from 'typeorm';

export enum TypeRelation {
  Ilike,
  Eq
}

export interface EntityTypeFilter {
  relation?: string;
  fields: string[];
  typeRelation: TypeRelation;
}

export interface EntityFilter {
  entityTypeFilter: EntityTypeFilter[];
}
export class GenericFilter<k> {}

export class Filter<k> {
  bodyFilter: GenericFilter<k>;
  constructor(bodyFilter: GenericFilter<k>, entityFilter: EntityFilter) {
    this.entityFilter = entityFilter;
    this.bodyFilter = bodyFilter;
    this.optionsWhere = {};
  }
  optionsWhere: FindOptionsWhere<k>;
  entityFilter: EntityFilter;

  renderFilterOptionWhere() {
    Object.keys(this.bodyFilter).forEach((propertyName: string) => {
      if (typeof this.bodyFilter[propertyName] === 'object') {
        Object.keys(this.bodyFilter[propertyName]).forEach((propertyNameRelation: string) => {
          this.constructOptionWhere(propertyNameRelation, propertyName);
        });
      } else {
        this.constructOptionWhere(propertyName);
      }
    });

    return this.optionsWhere;
  }
  constructOptionWhere(propertyName: string, relation?: string) {
    const entityTypeFilter: EntityTypeFilter = this.entityFilter.entityTypeFilter
      .filter((entityTypeFilter: EntityTypeFilter) => {
        if (entityTypeFilter.fields.includes(propertyName) && (!entityTypeFilter.relation || entityTypeFilter.relation === relation)) {
          return true;
        }
      })
      .pop();
    console.log(entityTypeFilter);

    switch (entityTypeFilter.typeRelation) {
      case TypeRelation.Eq:
        if (relation) {
          if (!this.optionsWhere[relation]) this.optionsWhere[relation] = {};
          this.optionsWhere[relation][propertyName] = this.bodyFilter[relation][propertyName];
        } else {
          this.optionsWhere[propertyName] = this.bodyFilter[propertyName];
        }
        break;
      case TypeRelation.Ilike:
        if (relation) {
          if (!this.optionsWhere[relation]) this.optionsWhere[relation] = {};
          this.optionsWhere[relation][propertyName] = ILike('%' + this.bodyFilter[relation][propertyName] + '%');
        } else {
          this.optionsWhere[propertyName] = ILike('%' + this.bodyFilter[propertyName] + '%');
        }
        break;
    }
  }
}
