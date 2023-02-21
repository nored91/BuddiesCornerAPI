import { ValidationError } from 'class-validator';
import { FindOperator, FindOptionsWhere, ILike } from 'typeorm';
import { BadRequestExceptionValidation } from '../exception/badRequestExceptionValidation';

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
  optionsWhere: FindOptionsWhere<k>;
  entityFilter: EntityFilter;

  constructor(bodyFilter: GenericFilter<k>, entityFilter: EntityFilter) {
    this.entityFilter = entityFilter;
    this.bodyFilter = bodyFilter;
    this.optionsWhere = {};
  }

  renderFilterOptionWhere(): FindOptionsWhere<k> {
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

  constructOptionWhere(propertyName: string, relation?: string): void {
    const entityTypeFilter: EntityTypeFilter = this.entityFilter.entityTypeFilter
      .filter((entityTypeFilter: EntityTypeFilter) => {
        if (entityTypeFilter.fields.includes(propertyName) && (!entityTypeFilter.relation || entityTypeFilter.relation === relation)) {
          return true;
        }
      })
      .pop();
    if (!entityTypeFilter) {
      throw new BadRequestExceptionValidation([
        { property: propertyName, constraints: { propertyName: propertyName + " fieldName can't be used as a filter" } }
      ]);
    }
    if (relation) {
      if (!this.optionsWhere[relation]) this.optionsWhere[relation] = {};
      this.optionsWhere[relation][propertyName] = this.formatFilterValue(
        entityTypeFilter.typeRelation,
        this.bodyFilter[relation][propertyName]
      );
    } else {
      this.optionsWhere[propertyName] = this.formatFilterValue(entityTypeFilter.typeRelation, this.bodyFilter[propertyName]);
    }
  }

  formatFilterValue(typeRelation: TypeRelation, values: string): string | FindOperator<string> {
    switch (typeRelation) {
      case TypeRelation.Eq:
        return values;
      case TypeRelation.Ilike:
        return ILike('%' + values + '%');
      default:
        return values;
    }
  }
}
