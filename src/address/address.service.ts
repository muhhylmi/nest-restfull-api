import { HttpException, Injectable } from '@nestjs/common';
import { Address, User } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  UpdateAddressRequest,
} from '../model/address.model';
import { AddressValidation } from './address.validation';
import { ContactService } from '../contact/contact.service';

@Injectable()
export class AddressService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
  ) {}

  async create(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    const createRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );
    await this.contactService.checkContactExists(
      user.username,
      request.contact_id,
    );

    const address = await this.prismaService.address.create({
      data: createRequest,
    });

    return this.toAddressResponse(address);
  }

  toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postal_code: address.postal_code,
    };
  }

  async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    const getRequest: GetAddressRequest = this.validationService.validate(
      AddressValidation.GET,
      request,
    );

    await this.contactService.checkContactExists(
      user.username,
      getRequest.contact_id,
    );

    const address = await this.checkAddress(getRequest.contact_id, getRequest.address_id);

    return this.toAddressResponse(address);
  }

  async checkAddress(contactId: number, addressId: number): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
      },
    });
    if (!address) {
      throw new HttpException('Address is not found', 404);
    }

    return address
  }

  async update(user: User, request: UpdateAddressRequest): Promise<AddressResponse> {
    const updateRequest: UpdateAddressRequest = this.validationService.validate(AddressValidation.UPDATE, request);

    await this.contactService.checkContactExists(
      user.username,
      updateRequest.contact_id,
    );

    let address = await this.checkAddress(updateRequest.contact_id, updateRequest.id);

    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        contact_id: address.contact_id
      },
      data: updateRequest
    })

    return address;
  }

}
