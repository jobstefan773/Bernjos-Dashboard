import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, contactNumber, username, password } = createUserDto;
    
    await this.ensureEmailIsUnique(email);
    await this.ensureContactNumberIsUnique(contactNumber);
    await this.ensureUsernameIsUnique(username);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        contactNumber,
        account: {
          create: {
            username,
            password,
          },
        },
      },
      include: {
        account: true,
      },
    });

    return user;
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          account: true,
        },
      });

      if(!users) throw new Error('No accounts found');

      return users;
    } catch (error) {
      throw new ConflictException('Error fetching users: ' + error.message);
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!user) {
      throw new ConflictException(`User with id #${id} not found.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { firstName, lastName, email, contactNumber, username, password, role } = updateUserDto;

    try {
      const user = await this.prisma.user.findUnique({ where: { id }, include: { account: true } });
      if (!user) {
        throw new ConflictException(`User with id #${id} not found.`);
      }

      await this.ensureEmailIsUnique(email, id);
      await this.ensureContactNumberIsUnique(contactNumber, id);
      await this.ensureUsernameIsUnique(username, id);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          contactNumber,
          role,
          account: username || password
            ? {
                update: {
                  ...(username && { username }),
                  ...(password && { password }),
                },
              }
            : undefined,
        },
        include: { account: true },
      });

      return updatedUser;
    } catch (error) {
      throw new ConflictException('Error updating user: ' + error.message);
    }
  }


  async remove(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new ConflictException(`User with id #${id} not found.`);
      }
      await this.prisma.user.delete({ where: { id } });
      return { message: `User with id #${id} has been removed.` };
    } catch (error) {
      throw new ConflictException('Error removing user: ' + error.message);
    }
  }




    private async ensureEmailIsUnique(email?: string, userId?: string) {
    if (!email) return;
    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail && existingEmail.id !== userId) {
      throw new ConflictException('A user with this email already exists.');
    }
  }

  private async ensureContactNumberIsUnique(contactNumber?: string, userId?: string) {
    if (!contactNumber) return;
    const existingContact = await this.prisma.user.findUnique({ where: { contactNumber } });
    if (existingContact && existingContact.id !== userId) {
      throw new ConflictException('A user with this contact number already exists.');
    }
  }

  private async ensureUsernameIsUnique(username?: string, userId?: string) {
    if (!username) return;
    const existingAccount = await this.prisma.account.findUnique({ where: { username } });
    if (existingAccount && existingAccount.userId !== userId) {
      throw new ConflictException('Username already exists.');
    }
  }
}
