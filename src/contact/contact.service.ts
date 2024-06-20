import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';
import { Contact, User } from '@prisma/client';
import { WebResponse } from 'src/model/web.model';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    req: CreateContactRequest,
  ): Promise<ContactResponse> {
    const createRequest: CreateContactRequest =
      await this.validationService.validate(ContactValidation.CREATE, req);

    const contact = await this.prismaService.contact.create({
      data: {
        ...createRequest,
        ...{ username: user.username },
      },
    });

    return this.toContactResponse(contact);
  }

  async get(user: User, contactId: number): Promise<ContactResponse> {
    const contact = await this.checkContactExists(user.username, contactId);
    return this.toContactResponse(contact);
  }

  async update(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    const updateRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    let contact = await this.checkContactExists(user.username, request.id);
    contact = await this.prismaService.contact.update({
      where: {
        username: contact.username,
        id: contact.id,
      },
      data: updateRequest,
    });

    return this.toContactResponse(contact);
  }

  async remove(user: User, contactId: number): Promise<ContactResponse> {
    await this.checkContactExists(user.username, contactId);
    const contact = await this.prismaService.contact.delete({
      where: {
        username: user.username,
        id: contactId,
      },
    });
    return this.toContactResponse(contact);
  }

  toContactResponse(contact: Contact): ContactResponse {
    return {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      id: contact.id,
    };
  }

  async checkContactExists(
    username: string,
    contactId: number,
  ): Promise<Contact> {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        username: username,
        id: contactId,
      },
    });
    if (!contact) {
      throw new HttpException('Contact Not Found', 404);
    }

    return contact;
  }

  async search(
    user: User,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const searchRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filter = [];

    if (searchRequest.name) {
      filter.push({
        OR: [
          {
            first_name: {
              contains: searchRequest.name,
            },
          },
          {
            last_name: {
              contains: searchRequest.name,
            },
          },
        ],
      });
    }

    if (searchRequest.phone) {
      filter.push({
        phone: {
          contains: searchRequest.phone,
        },
      });
    }

    if (searchRequest.email) {
      filter.push({
        email: {
          contains: searchRequest.email,
        },
      });
    }
    const skip = (searchRequest.page - 1) * searchRequest.size;

    const contacts = await this.prismaService.contact.findMany({
      where: {
        username: user.username,
        AND: filter,
      },
      take: searchRequest.size,
      skip: skip,
    });

    const count = await this.prismaService.contact.count({
      where: {
        username: user.username,
        AND: filter,
      },
    });

    return {
      data: contacts.map((contact) => this.toContactResponse(contact)),
      paging: {
        size: searchRequest.size,
        current_page: searchRequest.page,
        total_page: Math.ceil(count / searchRequest.size),
      },
    };
  }
}
