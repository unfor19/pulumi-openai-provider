import { Assistant } from "@pulumi/openai";
// Create an OpenAI Assistant
const assistant = new Assistant("test-assistant", {
    name: "Test Assistant",
    model: "gpt-4-turbo-preview",
    instructions: "You are a helpful assistant that specializes in testing Pulumi providers.",
    tools: [{ type: "code_interpreter" }],
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
