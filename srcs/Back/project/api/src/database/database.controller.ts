import { Controller, Put, Post, Get, Body } from '@nestjs/common';
import { DataService } from './database.service';

@Controller()
export class DataController{
    constructor(private dataService: DataService){}

    // @Post()
    // create_data(){}

    // @Get()
    // find_data(){}

    // @Put()
    // update_data(){}
}