import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const validateContentStep = createStep({
  id: 'validate-content',
  description: 'Validates incoming text content',
  inputSchema: z.object({
    content: z.string().min(1, 'Content cannot be empty'),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    isValid: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    const { content, type } = inputData;

    const wordCount = content.trim().split(/\s+/).length;
    const isValid = wordCount >= 5; // Minimum 5 words

    if (!isValid) {
      throw new Error(`Content too short: ${wordCount} words`);
    }

    return {
      content: content.trim(),
      type,
      wordCount,
      isValid,
    };
  },
});

const enhanceContentStep = createStep({
  id: 'enhance-content',
  description: 'Adds metadata to validated content',
  inputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    const { content, type, wordCount } = inputData;

    // Calculate reading time (200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    // Determine difficulty based on word count
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (wordCount > 100) {
      difficulty = 'medium';
    }
    if (wordCount > 300) {
      difficulty = 'hard';
    }

    return {
      content,
      type,
      wordCount,
      metadata: {
        readingTime,
        difficulty,
        processedAt: new Date().toISOString(),
      },
    };
  },
});

const generateSummaryStep = createStep({
  id: 'generate-summary',
  description: 'Creates a summary of the content',
  inputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
    summary: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { content, type, wordCount, metadata } = inputData;

    // Create a simple summary from first sentence
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const firstSentence = `${sentences[0]?.trim()}.`;

    // Generate summary based on content length
    let summary = firstSentence;
    if (wordCount > 50) {
      summary += ` This ${type} contains ${wordCount} words and takes approximately ${metadata.readingTime} minute(s) to read.`;
    }

    console.log(`📝 Generated summary: ${summary.length} characters`);

    return {
      content,
      type,
      wordCount,
      metadata,
      summary,
    };
  },
});

const aiAnalysisStep = createStep({
  id: 'ai-analysis',
  description: 'AI-powered content analysis',
  inputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
    summary: z.string(),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
    summary: z.string(),
    aiAnalysis: z.object({
      score: z.number(),
      feedback: z.string(),
    }),
  }),
  execute: async ({ inputData, mastra }) => {
    const { content, type, wordCount, metadata, summary } = inputData;

    const prompt = `
Analyze this ${type} content:

Content: "${content}"
Word count: ${wordCount}
Reading time: ${metadata.readingTime} minutes
Difficulty: ${metadata.difficulty}

Please provide:
1. A quality score from 1-10
2. Brief feedback on strengths and areas for improvement

Format as JSON: {"score": number, "feedback": "your feedback here"}
    `;

    const contentAgent = mastra.getAgent('contentAgent');
    const { text } = await contentAgent.generate([
      { role: 'user', content: prompt },
    ]);

    let aiAnalysis: { score: number; feedback: string };
    try {
      aiAnalysis = JSON.parse(text);
    } catch {
      aiAnalysis = {
        score: 7,
        feedback: `AI analysis completed. ${text}`,
      };
    }

    console.log(`🤖 AI Score: ${aiAnalysis.score}/10`);

    return {
      content,
      type,
      wordCount,
      metadata,
      summary,
      aiAnalysis,
    };
  },
});

const seoAnalysisStep = createStep({
  id: 'seo-analysis',
  description: 'SEO optimization analysis',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    seoScore: z.number(),
    keywords: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    console.log('🔍 Running SEO analysis...');
    await new Promise((resolve) => setTimeout(resolve, 800));
    const words = inputData.content.toLowerCase().split(/\s+/);
    const keywords = words.filter((word) => word.length > 4).slice(0, 3);
    return {
      seoScore: Math.floor(Math.random() * 40) + 60,
      keywords,
    };
  },
});

const readabilityStep = createStep({
  id: 'readability-analysis',
  description: 'Content readability analysis',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    readabilityScore: z.number(),
    gradeLevel: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log('📖 Running readability analysis...');
    await new Promise((resolve) => setTimeout(resolve, 600));
    const sentences = inputData.content.split(/[.!?]+/).length;
    const words = inputData.content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    const score = Math.max(0, 100 - avgWordsPerSentence * 3);
    const gradeLevel = score > 80 ? 'Easy' : score > 60 ? 'Medium' : 'Hard';
    return {
      readabilityScore: Math.floor(score),
      gradeLevel,
    };
  },
});

const sentimentStep = createStep({
  id: 'sentiment-analysis',
  description: 'Content sentiment analysis',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    sentiment: z.enum(['positive', 'neutral', 'negative']),
    confidence: z.number(),
  }),
  execute: async ({ inputData }) => {
    console.log('😊 Running sentiment analysis...');
    await new Promise((resolve) => setTimeout(resolve, 700));
    const content = inputData.content.toLowerCase();
    const positiveWords = ['good', 'great', 'excellent', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible'];
    const positive = positiveWords.filter((word) =>
      content.includes(word)
    ).length;
    const negative = negativeWords.filter((word) =>
      content.includes(word)
    ).length;
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positive > negative) {
      sentiment = 'positive';
    }
    if (negative > positive) {
      sentiment = 'negative';
    }
    return {
      sentiment,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
    };
  },
});

const assessContentStep = createStep({
  id: 'assess-content',
  description: 'Assesses content to determine processing path',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
    wordCount: z.number(),
    complexity: z.enum(['simple', 'moderate', 'complex']),
    category: z.enum(['short', 'medium', 'long']),
  }),
  execute: async ({ inputData }) => {
    const { content, type } = inputData;
    const words = content.trim().split(/\s+/);
    const wordCount = words.length;
    let category: 'short' | 'medium' | 'long' = 'short';
    if (wordCount >= 50) {
      category = 'medium';
    }
    if (wordCount >= 200) {
      category = 'long';
    }
    const avgWordLength =
      words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (avgWordLength > 5) {
      complexity = 'moderate';
    }
    if (avgWordLength > 7) {
      complexity = 'complex';
    }
    console.log(`📋 Assessment: ${category} content, ${complexity} complexity`);
    return {
      content,
      type,
      wordCount,
      complexity,
      category,
    };
  },
});

const quickProcessingStep = createStep({
  id: 'quick-processing',
  description: 'Quick processing for short and simple content',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
    wordCount: z.number(),
    complexity: z.enum(['simple', 'moderate', 'complex']),
    category: z.enum(['short', 'medium', 'long']),
  }),
  outputSchema: z.object({
    processedContent: z.string(),
    processingType: z.string(),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    console.log('⚡ Quick processing for short and simple content...');
    return {
      processedContent: inputData.content,
      processingType: 'quick',
      recommendations: [
        'Content is concise',
        'Consider expanding for more detail',
      ],
    };
  },
});

const generalProcessingStep = createStep({
  id: 'general-processing',
  description: 'General processing for all other content',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
    wordCount: z.number(),
    complexity: z.enum(['simple', 'moderate', 'complex']),
    category: z.enum(['short', 'medium', 'long']),
  }),
  outputSchema: z.object({
    processedContent: z.string(),
    processingType: z.string(),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    console.log('📝 General processing for non-short/simple content...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      processedContent: inputData.content,
      processingType: 'general',
      recommendations: [
        'Consider simplifying content',
        'Break up long paragraphs',
        'Add examples or explanations if needed',
      ],
    };
  },
});

export const contentWorkflow = createWorkflow({
  id: 'content-processing-workflow',
  description: 'Validates, enhances, and summarizes content',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
    summary: z.string(),
  }),
})
  .then(validateContentStep)
  .then(enhanceContentStep)
  .then(generateSummaryStep)
  .commit();

export const aiContentWorkflow = createWorkflow({
  id: 'ai-content-workflow',
  description: 'AI-enhanced content processing with analysis',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    content: z.string(),
    type: z.string(),
    wordCount: z.number(),
    metadata: z.object({
      readingTime: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      processedAt: z.string(),
    }),
    summary: z.string(),
    aiAnalysis: z.object({
      score: z.number(),
      feedback: z.string(),
    }),
  }),
})
  .then(validateContentStep)
  .then(enhanceContentStep)
  .then(generateSummaryStep)
  .then(aiAnalysisStep)
  .commit();

export const parallelAnalysisWorkflow = createWorkflow({
  id: 'parallel-analysis-workflow',
  description: 'Run multiple content analyses in parallel',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    results: z.object({
      seo: z.object({
        seoScore: z.number(),
        keywords: z.array(z.string()),
      }),
      readability: z.object({
        readabilityScore: z.number(),
        gradeLevel: z.string(),
      }),
      sentiment: z.object({
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        confidence: z.number(),
      }),
    }),
  }),
})
  .parallel([seoAnalysisStep, readabilityStep, sentimentStep])
  .then(
    createStep({
      id: 'combine-results',
      description: 'Combines parallel analysis results',
      inputSchema: z.object({
        'seo-analysis': z.object({
          seoScore: z.number(),
          keywords: z.array(z.string()),
        }),
        'readability-analysis': z.object({
          readabilityScore: z.number(),
          gradeLevel: z.string(),
        }),
        'sentiment-analysis': z.object({
          sentiment: z.enum(['positive', 'neutral', 'negative']),
          confidence: z.number(),
        }),
      }),
      outputSchema: z.object({
        results: z.object({
          seo: z.object({
            seoScore: z.number(),
            keywords: z.array(z.string()),
          }),
          readability: z.object({
            readabilityScore: z.number(),
            gradeLevel: z.string(),
          }),
          sentiment: z.object({
            sentiment: z.enum(['positive', 'neutral', 'negative']),
            confidence: z.number(),
          }),
        }),
      }),
      execute: async ({ inputData }) => {
        console.log('🔄 Combining parallel results...');
        return {
          results: {
            seo: inputData['seo-analysis'],
            readability: inputData['readability-analysis'],
            sentiment: inputData['sentiment-analysis'],
          },
        };
      },
    })
  )
  .commit();

export const conditionalWorkflow = createWorkflow({
  id: 'conditional-workflow',
  description: 'Content processing with conditional branching',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['article', 'blog', 'social']).default('article'),
  }),
  outputSchema: z.object({
    processedContent: z.string(),
    processingType: z.string(),
    recommendations: z.array(z.string()),
  }),
})
  .then(assessContentStep)
  .branch([
    [
      async ({ inputData }) =>
        inputData.category === 'short' && inputData.complexity === 'simple',
      quickProcessingStep,
    ],
    [
      async ({ inputData }) =>
        !(inputData.category === 'short' && inputData.complexity === 'simple'),
      generalProcessingStep,
    ],
  ])
  .commit();

export default {
  aiContentWorkflow,
  conditionalWorkflow,
  contentWorkflow,
  parallelAnalysisWorkflow,
};
