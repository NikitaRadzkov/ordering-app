import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  private async validateCreateUserRequest(request: CreateUserRequest) {
    let user: User;
    try {
      user = await this.userRepository.findOne({
        email: request.email,
      });
    } catch (err) {
      throw err;
    }

    if (user) {
      throw new UnprocessableEntityException('Email already exists.');
    }
  }

  async createUser(request: CreateUserRequest) {
    await this.validateCreateUserRequest(request);
    const user = await this.userRepository.create({
      ...request,
      password: await bcrypt.hash(request.password, 10),
    });
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ email });
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async getUser(getUserArgs: Partial<User>) {
    return this.userRepository.findOne(getUserArgs);
  }
}
