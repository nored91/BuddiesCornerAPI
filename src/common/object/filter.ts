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
export class Filter<k> {
  private optionsWhere: FindOptionsWhere<k> = {};
  private entityFilter: EntityFilter;

  renderFilterOptionWhere(entityFilter: EntityFilter) {
    this.entityFilter = entityFilter;
    Object.keys(this).forEach((propertyName: string) => {
      let relation = null;
      if (typeof this[propertyName] === 'object') {
        relation = propertyName;
        Object.keys(this[propertyName]).forEach((propertyNameRelation: string) => {
          this.optionsWhere = this.constructOptionWhere(propertyNameRelation, relation);
        });
      } else {
        this.optionsWhere = this.constructOptionWhere(propertyName);
      }
    });

    return this.optionsWhere;
  }
  constructOptionWhere(propertyName: string, relation?: string): FindOptionsWhere<k> {
    const entityTypeFilter: EntityTypeFilter = this.entityFilter.entityTypeFilter
      .filter((entityTypeFilter: EntityTypeFilter) => {
        if (entityTypeFilter.fields.includes(propertyName) && entityTypeFilter.relation === relation) {
          return true;
        }
      })
      .pop();

    switch (entityTypeFilter.typeRelation) {
      case TypeRelation.Eq:
        if (relation) {
          if (!this.optionsWhere[relation]) this.optionsWhere[relation] = {};
          this.optionsWhere[relation][propertyName] = this[relation][propertyName];
        } else {
          this.optionsWhere[propertyName] = this[propertyName];
        }
        break;
      case TypeRelation.Ilike:
        if (relation) {
          if (!this.optionsWhere[relation]) this.optionsWhere[relation] = {};
          this.optionsWhere[relation][propertyName] = ILike('%' + this[relation][propertyName] + '%');
        } else {
          this.optionsWhere[propertyName] = ILike('%' + this[propertyName] + '%');
        }
        break;
    }
    return this.optionsWhere;
  }
}
