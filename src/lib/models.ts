import { createAzure } from '@ai-sdk/azure';

const {
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_API_VERSION,
  AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_GPT41_DEPLOYMENT,
  AZURE_OPENAI_GPT41_MINI_DEPLOYMENT,
  AZURE_OPENAI_GPT41_NANO_DEPLOYMENT,
  AZURE_OPENAI_GPT4O_DEPLOYMENT,
  AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT,
  AZURE_OPENAI_O1_DEPLOYMENT,
  AZURE_OPENAI_O1_MINI_DEPLOYMENT,
  AZURE_OPENAI_O3_DEPLOYMENT,
  AZURE_OPENAI_O3_MINI_DEPLOYMENT,
  AZURE_OPENAI_O4_MINI_DEPLOYMENT,
  AZURE_OPENAI_TEXT_EMBEDDING_3_LARGE_DEPLOYMENT,
  AZURE_OPENAI_TEXT_EMBEDDING_3_SMALL_DEPLOYMENT,
} = process.env;

const azure = createAzure({
  resourceName: AZURE_OPENAI_DEPLOYMENT_NAME,
  apiKey: AZURE_OPENAI_API_KEY,
  apiVersion: AZURE_OPENAI_API_VERSION,
});

export const gpt41 = azure.responses(AZURE_OPENAI_GPT41_DEPLOYMENT);
export const gpt41Mini = azure.responses(AZURE_OPENAI_GPT41_MINI_DEPLOYMENT);
export const gpt41Nano = azure.responses(AZURE_OPENAI_GPT41_NANO_DEPLOYMENT);
export const gpt4o = azure.responses(AZURE_OPENAI_GPT4O_DEPLOYMENT);
export const gpt4oMini = azure.responses(AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT);
export const o1 = azure.responses(AZURE_OPENAI_O1_DEPLOYMENT);
export const o1Mini = azure.responses(AZURE_OPENAI_O1_MINI_DEPLOYMENT);
export const o3 = azure.responses(AZURE_OPENAI_O3_DEPLOYMENT);
export const o3Mini = azure.responses(AZURE_OPENAI_O3_MINI_DEPLOYMENT);
export const o4Mini = azure.responses(AZURE_OPENAI_O4_MINI_DEPLOYMENT);
export const textEmbedding3Large = azure.textEmbeddingModel(
  AZURE_OPENAI_TEXT_EMBEDDING_3_LARGE_DEPLOYMENT
);
export const textEmbedding3Small = azure.textEmbeddingModel(
  AZURE_OPENAI_TEXT_EMBEDDING_3_SMALL_DEPLOYMENT
);
