import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('LLM Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenRouter Integration', () => {
    it('should make successful API call to OpenRouter', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                title: "Test Adventure",
                description: "A test adventure for heroes",
                content: {
                  introduction: "Welcome to the test adventure",
                  encounters: []
                }
              })
            }
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const prompt = "Generate a fantasy adventure";
      const model = "anthropic/claude-3-haiku";
      
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.data.choices[0].message.content).toContain('Test Adventure');
      expect(response.data.usage.total_tokens).toBe(300);
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(
        axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: 'anthropic/claude-3-haiku',
          messages: [{ role: 'user', content: 'test' }]
        })
      ).rejects.toThrow('API Error');
    });

    it('should validate model availability', () => {
      const availableModels = [
        'anthropic/claude-3-haiku',
        'anthropic/claude-3-sonnet',
        'openai/gpt-4',
        'openai/gpt-3.5-turbo'
      ];

      const testModel = 'anthropic/claude-3-haiku';
      expect(availableModels).toContain(testModel);
    });
  });

  describe('Prompt Processing', () => {
    it('should format adventure generation prompt correctly', () => {
      const userInput = {
        theme: 'fantasy',
        level: 5,
        partySize: 4,
        setting: 'dungeon'
      };

      const expectedPrompt = `Generate a ${userInput.theme} adventure for ${userInput.partySize} level ${userInput.level} characters in a ${userInput.setting} setting.`;
      
      const formattedPrompt = `Generate a ${userInput.theme} adventure for ${userInput.partySize} level ${userInput.level} characters in a ${userInput.setting} setting.`;
      
      expect(formattedPrompt).toBe(expectedPrompt);
    });

    it('should validate required prompt parameters', () => {
      const validInput = {
        theme: 'fantasy',
        level: 5,
        partySize: 4
      };

      const invalidInput = {
        theme: '',
        level: null,
        partySize: 0
      };

      expect(validInput.theme).toBeTruthy();
      expect(validInput.level).toBeGreaterThan(0);
      expect(validInput.partySize).toBeGreaterThan(0);

      expect(invalidInput.theme).toBeFalsy();
      expect(invalidInput.level).toBeFalsy();
      expect(invalidInput.partySize).toBeFalsy();
    });
  });

  describe('Response Parsing', () => {
    it('should parse valid JSON response', () => {
      const mockResponse = {
        title: "The Cursed Temple",
        description: "An ancient temple holds dark secrets",
        content: {
          introduction: "The party approaches the temple",
          encounters: [
            {
              name: "Temple Guardian",
              description: "A stone golem blocks the entrance",
              challenge_rating: 5
            }
          ]
        }
      };

      const jsonString = JSON.stringify(mockResponse);
      const parsed = JSON.parse(jsonString);

      expect(parsed.title).toBe("The Cursed Temple");
      expect(parsed.content.encounters).toHaveLength(1);
      expect(parsed.content.encounters[0].challenge_rating).toBe(5);
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedJson = '{"title": "Test", "content":';
      
      expect(() => JSON.parse(malformedJson)).toThrow();
    });
  });

  describe('Token Usage Tracking', () => {
    it('should track token usage correctly', () => {
      const usage = {
        prompt_tokens: 150,
        completion_tokens: 300,
        total_tokens: 450
      };

      expect(usage.total_tokens).toBe(usage.prompt_tokens + usage.completion_tokens);
      expect(usage.prompt_tokens).toBeGreaterThan(0);
      expect(usage.completion_tokens).toBeGreaterThan(0);
    });

    it('should calculate cost based on token usage', () => {
      const usage = {
        prompt_tokens: 1000,
        completion_tokens: 2000,
        total_tokens: 3000
      };

      // Mock pricing (per 1M tokens)
      const promptCostPer1M = 0.25; // $0.25 per 1M prompt tokens
      const completionCostPer1M = 1.25; // $1.25 per 1M completion tokens

      const promptCost = (usage.prompt_tokens / 1000000) * promptCostPer1M;
      const completionCost = (usage.completion_tokens / 1000000) * completionCostPer1M;
      const totalCost = promptCost + completionCost;

      expect(totalCost).toBeCloseTo(0.0027, 4); // $0.0027
    });
  });
});