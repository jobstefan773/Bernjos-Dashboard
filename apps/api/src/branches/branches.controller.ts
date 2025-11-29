import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true
  })
)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    const include =
      typeof includeInactive === 'string' &&
      (includeInactive.toLowerCase() === 'true' || includeInactive === '1');
    return this.branchesService.findAll(include);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBranchDto: UpdateBranchDto
  ) {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchesService.remove(id);
  }
}
