interface SummarizerConfig {
  apiKey: string;
  model: 'gpt-4o' | 'gpt-3.5-turbo';
}

interface SummarizerResponse {
  success: boolean;
  summary: string[];
  error?: string;
}

export class Summarizer {
  private config: SummarizerConfig;

  constructor(config: SummarizerConfig) {
    this.config = config;
  }

  async generateSummary(text: string): Promise<SummarizerResponse> {
    if (!text.trim()) {
      return {
        success: false,
        summary: [],
        error: "No text provided"
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional text summarizer. Create exactly 3 concise bullet points that capture the main ideas of the given text. Each bullet point should be clear, informative, and well-structured. Return only the bullet points, each starting with "•" and separated by newlines.'
            },
            {
              role: 'user',
              content: `Please summarize this text in exactly 3 bullet points:\n\n${text}`
            }
          ],
          max_tokens: 400,
          temperature: 0.3,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      const summaryText = data.choices[0]?.message?.content || "";
      
      // Parse the summary into bullet points
      const bulletPoints = summaryText
        .split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.trim().substring(1).trim())
        .filter(point => point.length > 0);

      // Ensure we have exactly 3 bullet points
      if (bulletPoints.length === 0) {
        // Fallback: split by sentences and take first 3
        const sentences = summaryText
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .slice(0, 3);
        
        return {
          success: true,
          summary: sentences.length > 0 ? sentences : ["Summary could not be generated properly."]
        };
      }

      return {
        success: true,
        summary: bulletPoints.slice(0, 3) // Ensure max 3 points
      };

    } catch (error) {
      console.error('Summarizer error:', error);
      return {
        success: false,
        summary: [],
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  updateConfig(newConfig: Partial<SummarizerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}