import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GenerateTextDto } from './dto/generate-text.dto';
import { AskStylistDto } from './dto/ask-stylist.dto';
import type { Response } from 'express';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('stream')
  async stream(@Res() res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const stream = this.geminiService.stream(res);

    for await (const chunk of stream) {
      res.write(`data: ${chunk}\n\n`);
    }

    res.end();
  }

  @Post('generate')
  async generate(@Body() dto: GenerateTextDto) {
    return this.geminiService.generateText(dto);
  }

  @Post('ask-stylist')
  async askStylist(@Body() dto: AskStylistDto) {
    return this.geminiService.askStylist(dto);
  }

  @Get('status')
  getStatus() {
    return {
      status: 'ok',
      defaultModel: this.geminiService.getDefaultModel(),
    };
  }
}
