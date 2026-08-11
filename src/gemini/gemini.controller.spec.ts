import { Test, TestingModule } from '@nestjs/testing';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

describe('GeminiController', () => {
  let controller: GeminiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeminiController],
      providers: [
        {
          provide: GeminiService,
          useValue: {
            generateText: jest.fn().mockResolvedValue({
              text: 'Generated text',
              model: 'gemini-3.5-flash',
            }),
            askStylist: jest.fn().mockResolvedValue({
              text: 'Stylist recommendation',
              model: 'gemini-3.5-flash',
              timestamp: '2026-08-11T12:00:00.000Z',
            }),
            getDefaultModel: jest.fn().mockReturnValue('gemini-3.5-flash'),
          },
        },
      ],
    }).compile();

    controller = module.get<GeminiController>(GeminiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call askStylist', async () => {
    const res = await controller.askStylist({
      prompt: 'What to wear in Jaipur?',
    });
    expect(res.text).toBe('Stylist recommendation');
  });
});
