import { Controller, Get, Patch, Body, Param, UseGuards, Request } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { JwtGuard } from "../auth/guards/jwt.guard.js";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@Request() req) {
        return this.userService.findById(req.user.id);
    }

    @UseGuards(JwtGuard)
    @Patch('me')
    updateMe(@Request() req, @Body() dto: UpdateProfileDto) {
        return this.userService.update(req.user.id, dto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findById(id);
    }
}