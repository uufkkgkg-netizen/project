import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Return JWT token and user info.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new Tenant (Clinic)' })
  @ApiResponse({ status: 201, description: 'Tenant successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerTenant(registerDto);
  }
}
