import * as openai from "@pulumi/openai";
import { Assistant, VectorStore } from "@pulumi/openai";

const sharedMetadata = {
    purpose: "testing",
    environment: "development",
}

// Get the second API key from environment variable
// This will be used specifically for the Vector Store
// const vectorStoreApiKey = "invalid-key"; // process.env.OPENAI_API_KEY;

// Create an OpenAI Vector Store with a specific API key
const vectorStore = new VectorStore("test-vector-store", {
    name: "Test Vector Store",
    metadata: sharedMetadata,

    // Optional: Set an expiration policy for the vector store
    expiresAfter: {
        anchor: "last_active_at",
        days: 30
    },

    // Optional: Set a chunking strategy for the vector store
    // chunkingStrategy: {
    //     type: "auto"
    // }

    // Use an invalid API key to test our enhanced preview functionality
    // apiKey: vectorStoreApiKey,
    apiKey: process.env.OPENAI_API_KEY_PROJECT,
});

// Create an OpenAI Assistant
// This will use the default API key from the provider configuration
const assistant = new Assistant("test-assistant", {
    name: "Test Assistant",
    model: "gpt-4-turbo-preview",
    instructions: "You are a helpful",
    tools: [{ type: "code_interpreter" }, { type: "file_search" }],
    metadata: sharedMetadata,
    // Use toolResources with the flattened structure that the SDK expects
    toolResources: {
        "fileSearch.vectorStoreIds": vectorStore.id
    },
    temperature: 1,
    topP: 1,
    responseFormat: "auto",
    apiKey: process.env.OPENAI_API_KEY_PROJECT,
});

const project = new openai.Project("example-project", {
    name: "Example Project1",
    apiKey: process.env.OPENAI_API_KEY,
});


// Export the assistant properties
export const assistantId = assistant.id;
export const assistantName = assistant.name;
export const assistantModel = assistant.model;
export const assistantInstructions = assistant.instructions;

// Export the vector store ID
export const vectorStoreId = vectorStore.id;
export const vectorStoreName = vectorStore.name;

// Export the project ID and name (uncomment if using the Project resource)
export const projectId = project.id;
export const projectName = project.name;
