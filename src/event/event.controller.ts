/* eslint-disable prettier/prettier */
import { Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectResponseRecord } from '../common/response/objectResponseRecord';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { ObjectNotFoundException } from '../common/exception/objectNotFoundException';
import { ApiFilterQuery } from '../common/object/api-filter-query';
import { Pagination } from '../common/object/pagination.object';
import { ObjectResponseCreate } from '../common/response/objectResponseCreate';
import { ObjectResponseUpdate } from '../common/response/objectResponseUpdate';
import { CreateEventDTO, UpdateEventDTO } from './event.dto';
import { Event } from './event.entity';
import { EventFilter } from './event.filter';
import { EventService } from './event.service';

@Controller('event')
@ApiTags('Event')
@UseFilters(ObjectNotFoundException)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiFilterQuery('filter', EventFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<Event>, description: 'A list of event' })
  @Get()
  async findAll(@Query('page') pagination: Pagination, @Query('filter') eventFilter: EventFilter): Promise<ObjectResponseRecord<Event>> {
    return new ObjectResponseRecord<Event>(await this.eventService.findAll(pagination, eventFilter));
  }

  @ApiResponse({ status: 200, type: Event, description: 'Requested event' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No event found' })
  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) eventId: string) {
    const event: Event = await this.eventService.findOne(eventId);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + eventId, 404);
    }
    return event;
  }

  @ApiResponse({ status: 201, type: ObjectResponseCreate<Event>, description: 'The event has been created successfully' })
  @ApiResponse({ status: 400, type: BadRequestExceptionValidation, description: 'Bad Request - Validation failed' })
  @Post()
  async create(@Body() createEventDTO: CreateEventDTO): Promise<ObjectResponseCreate<Event>> {
    return new ObjectResponseCreate(await this.eventService.create(createEventDTO), 'The event has been created successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The event has been updated successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No event found' })
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) eventId: string, @Body() updateEventDTO: UpdateEventDTO) {
    updateEventDTO.event_id = eventId;
    let event: Event = await this.eventService.findOne(eventId);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + eventId, 404);
    }
    event = await this.eventService.patch(updateEventDTO);
    return new ObjectResponseUpdate(event.event_id, 'The event has been updated successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The event has been deleted successfully' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No event found' })
  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) eventId: string) {
    const event: Event = await this.eventService.findOne(eventId);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + eventId, 404);
    }
    await this.eventService.delete({ event_id: eventId });
    return new ObjectResponseUpdate(eventId, 'The event has been deleted successfully');
  }
}
