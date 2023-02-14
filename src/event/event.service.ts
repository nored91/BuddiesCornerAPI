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
    const options: FindManyOptions = {
      skip: pagination.offset,
      take: pagination.limit,
      where: eventFilter.renderFilterOptionWhere(['event_id', 'active'], ['mail', 'firstname', 'lastname', 'pseudo'])
    };
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
