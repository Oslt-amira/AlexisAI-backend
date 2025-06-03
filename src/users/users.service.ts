import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  create(email: string) {
    return this.prismaService.user.create({
      data: {
        email,
      },
    });
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  findOneById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
