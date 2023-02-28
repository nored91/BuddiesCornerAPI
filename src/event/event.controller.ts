/* eslint-disable prettier/prettier */
import { BadRequestException, Delete, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
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
import { Group } from '../group/group.entity';
import { GroupService } from '../group/group.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Controller('event')
@ApiTags('Event')
@UseFilters(ObjectNotFoundException)
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly groupService: GroupService,
    private readonly userService: UserService
  ) {}

  @ApiFilterQuery('filter', EventFilter)
  @ApiFilterQuery('page', Pagination)
  @ApiResponse({ status: 200, type: ObjectResponseRecord<Event>, description: 'A list of event' })
  @Get()
  async findAll(@Query('page') pagination: Pagination, @Query('filter') eventFilter: EventFilter): Promise<ObjectResponseRecord<Event>> {
    return new ObjectResponseRecord<Event>(await this.eventService.findAll(pagination, eventFilter));
  }

  @ApiResponse({ status: 200, type: Event, description: 'Requested event' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No event found' })
  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) eventId: string): Promise<Event> {
    const event: Event = await this.eventService.findOne(eventId);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + eventId, 404);
    }
    return event;
  }

  @ApiResponse({ status: 201, type: ObjectResponseCreate<Event>, description: 'The event has been created successfully' })
  @ApiResponse({ status: 400, type: BadRequestExceptionValidation, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'Group/User not found' })
  @Post()
  async create(@Body() createEventDTO: CreateEventDTO): Promise<ObjectResponseCreate<Event>> {
    let group: Group = await this.groupService.findOne(createEventDTO.group_id);
    if (group === null) {
      throw new ObjectNotFoundException('Group not found with id : ' + createEventDTO.group_id, 404);
    }
    let user: User = await this.userService.findOne(createEventDTO.creator_user_id);
    if (user === null) {
      throw new ObjectNotFoundException('User not found with id : ' + createEventDTO.creator_user_id, 404);
    }
    return new ObjectResponseCreate(await this.eventService.create(createEventDTO), 'The event has been created successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The event has been updated successfully' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No event found' })
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) eventId: string, @Body() updateEventDTO: UpdateEventDTO): Promise<ObjectResponseUpdate> {
    updateEventDTO.event_id = eventId;
    let event: Event = await this.eventService.findOne(eventId);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + eventId, 404);
    }
    event = await this.eventService.patch(updateEventDTO);
    return new ObjectResponseUpdate(event.event_id, 'The event has been updated successfully');
  }

  @ApiResponse({ status: 200, type: ObjectResponseUpdate, description: 'The event has been deleted successfully' })
  @ApiResponse({ status: 400, type: BadRequestException, description: 'Validation failed (uuid is expected)' })
  @ApiResponse({ status: 404, type: ObjectNotFoundException, description: 'No event found' })
  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) eventId: string): Promise<ObjectResponseUpdate> {
    const event: Event = await this.eventService.findOne(eventId);
    if (event === null) {
      throw new ObjectNotFoundException('Event not found with id : ' + eventId, 404);
    }
    await this.eventService.delete({ event_id: eventId });
    return new ObjectResponseUpdate(eventId, 'The event has been deleted successfully');
  }
}
