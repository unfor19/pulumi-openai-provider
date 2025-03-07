import * as pulumi from "@pulumi/pulumi";
import { Assistant } from "@pulumi/openai";

// Create an OpenAI Assistant
const assistant = new Assistant("test-assistant", {
    name: "Test Assistant",
    model: "gpt-4-turbo-preview",
    instructions: "You are a helpful assistant that specializes in testing Pulumi providers.",
    tools: [{ type: "code_interpreter" }],
});

// Export the assistant properties
export const assistantName = assistant.name;
export const assistantModel = assistant.model;
export const assistantInstructions = assistant.instructions;

// Export the assistant ID
export const assistantId = assistant.id;
