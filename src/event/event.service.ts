import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from '../common/object/pagination.object';
import { DeleteResult, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateEventDTO, UpdateEventDTO } from './event.dto';
import { Event } from './event.entity';
import { EventFilter } from './event.filter';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>
  ) {}

  // eslint-disable-next-line prettier/prettier
  async findAll(pagination: Pagination, eventFilter: EventFilter): Promise<[Event[], number]> {
    let options: FindManyOptions = {
      select: [
        'event_id',
        'type',
        'title',
        'description',
        'location',
        'creation_date',
        'event_date',
        'creator_user.user_id',
        'creator_user.firstname',
        'creator_user.lastname'
      ],
      skip: pagination.offset,
      relations: ['creator_user'],
      relationLoadStrategy: 'query',
      take: pagination.limit
    };

    if (Object.keys(eventFilter).length > 0) {
      options.where = eventFilter.renderFilterOptionWhere(
        ['event_id', 'group_id', 'type'],
        ['title', 'description', 'creation_date', 'event_date'],
        [{ relation: 'creator_user', fields: ['user_id', 'firstname', 'lastname'] }]
      );
    }
    return await this.eventRepository.findAndCount(options);
  }

  async findOne(id: string): Promise<Event> {
    return await this.eventRepository.findOneBy({ event_id: id });
  }

  async create(createEventDTO: CreateEventDTO): Promise<Event> {
    const event = await this.eventRepository.save(createEventDTO);
    return await this.eventRepository.findOneBy({ event_id: event.event_id });
  }

  async patch(updateEventDTO: UpdateEventDTO): Promise<Event> {
    return await this.eventRepository.save(updateEventDTO);
  }

  async delete(options: FindOptionsWhere<Event>): Promise<DeleteResult> {
    return await this.eventRepository.delete(options);
  }
}
