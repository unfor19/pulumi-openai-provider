import { Assistant, VectorStore } from "@pulumi/openai";

const sharedMetadata = {
    purpose: "testing",
    environment: "development",
}

// Create an OpenAI Vector Store
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
});

// Create an OpenAI Assistant
const assistant = new Assistant("test-assistant", {
    name: "Test Assistant",
    model: "gpt-4-turbo-preview",
    instructions: "You are a helpful assistant that specializes in testing Pulumi providers.",
    tools: [{ type: "code_interpreter" }, { type: "file_search" }],
    // Include fileIds for backward compatibility
    fileIds: [],
    // Add metadata without vectorStoreId
    metadata: sharedMetadata,
    // Use toolResources with the flattened structure that the SDK expects
    toolResources: {
        "codeInterpreter.fileIds": "",
        "fileSearch.vectorStoreIds": vectorStore.id
    },
    temperature: 1,
    topP: 1,
    responseFormat: "auto",
});


// Export the assistant properties
export const assistantName = assistant.name;
export const assistantModel = assistant.model;
export const assistantInstructions = assistant.instructions;

// Export the assistant ID
export const assistantId = assistant.id;

// Export the vector store properties
export const vectorStoreName = vectorStore.name;

// Export the vector store ID
export const vectorStoreId = vectorStore.id;
