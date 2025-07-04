import { IsString, IsOptional, IsEnum, IsEmail, IsPhoneNumber, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from 'generated/prisma';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsPhoneNumber()
  @IsNotEmpty()
  contactNumber: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role;

  //ACCOUNT FIELDS
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
