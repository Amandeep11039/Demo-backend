import { Injectable, Logger, OnModuleInit, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { GenerateTextDto } from './dto/generate-text.dto';
import { AskStylistDto } from './dto/ask-stylist.dto';
import { FASHION_STYLIST_SYSTEM_INSTRUCTION } from './constants/stylist-persona';
import type { Response } from 'express';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private ai: GoogleGenAI;
  private defaultModel: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('gemini.apiKey');

    if (!apiKey) {
      this.logger.error(
        'GEMINI_API_KEY is not defined. Please set GEMINI_API_KEY in your .env file.',
      );
      throw new Error(
        'GEMINI_API_KEY is not defined. Please set GEMINI_API_KEY in your .env file.',
      );
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.defaultModel =
      this.configService.get<string>('gemini.model') || 'gemini-3.5-flash';
  }

  /**
   * Generates text using Gemini model
   */
  async generateText(
    dto: GenerateTextDto,
  ): Promise<{ text: string; model: string }> {
    const model = dto.model || this.defaultModel;

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: dto.prompt,
        config: {
          systemInstruction: dto.systemInstruction,
          temperature: dto.temperature,
          maxOutputTokens: dto.maxOutputTokens,
        },
      });

      return {
        text: response.text ?? '',
        model,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate content with model ${model}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Specialized fashion stylist query with curated Indian luxury handloom context
   */
  async askStylist(
    dto: AskStylistDto,
  ): Promise<{ text: string; model: string; timestamp: string }> {
    let contextualPrompt = dto.prompt;

    if (dto.occasion || dto.city) {
      const contextParts: string[] = [];

      if (dto.occasion) contextParts.push(`Occasion: ${dto.occasion}`);
      if (dto.city) contextParts.push(`Location: ${dto.city}`);

      contextualPrompt = `[Context: ${contextParts.join(', ')}]\nUser Question: ${dto.prompt}`;
    }

    console.log(contextualPrompt);

    const result = await this.generateText({
      prompt: contextualPrompt,
      model: dto.model || this.defaultModel,
      systemInstruction: FASHION_STYLIST_SYSTEM_INSTRUCTION,
      temperature: dto.temperature ?? 0.7,
    });

    return {
      text: result.text,
      model: result.model,
      timestamp: new Date().toISOString(),
    };
  }

  async stream(@Res() res: Response) {
    const message = 'Hello I am sending this response word by word from NestJS';

    const words = message.split(' ');

    for (const word of words) {
      res.write(word + ' ');

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    res.end();
  }

  getClient(): GoogleGenAI {
    return this.ai;
  }

  /**
   * Returns the configured default model
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }
}
