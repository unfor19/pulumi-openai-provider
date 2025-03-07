import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { type AssistantCreateParams, type AssistantUpdateParams } from "openai/resources/beta/assistants";
import { Assistant, AssistantArgs } from "./assistantResource";

export class Provider implements provider.Provider {
    private openaiClient: OpenAI;
    readonly version: string = "0.0.1";

    constructor() {
        // Get API key from environment or config
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is required");
        }
        
        // Initialize OpenAI client
        this.openaiClient = new OpenAI({
            apiKey: apiKey,
        });
    }

    async construct(name: string, type: string, inputs: pulumi.Inputs, options: pulumi.ComponentResourceOptions): Promise<provider.ConstructResult> {
        switch (type) {
            case "openai:index:Assistant":
                return await constructAssistant(this.openaiClient, name, inputs, options);
            default:
                throw new Error(`Unknown resource type ${type}`);
        }
    }

    async check(urn: pulumi.URN, olds: any, news: any): Promise<provider.CheckResult> {
        // Implement resource validation logic
        return {
            inputs: news,
        };
    }

    async diff(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.DiffResult> {
        // Implement resource diff logic
        const changes = [];
        
        if (olds.name !== news.name) changes.push("name");
        if (olds.instructions !== news.instructions) changes.push("instructions");
        if (olds.model !== news.model) changes.push("model");
        // Add other property comparisons
        
        return {
            changes: changes.length > 0,
            replaces: ["model"], // Properties that require replacement
            deleteBeforeReplace: true,
        };
    }

    async create(urn: pulumi.URN, inputs: any): Promise<provider.CreateResult> {
        // Implement resource creation logic
        try {
            const createParams: AssistantCreateParams = {
                name: inputs.name,
                instructions: inputs.instructions,
                model: inputs.model,
                tools: inputs.tools || [],
                tool_resources: inputs.fileIds ? {
                    code_interpreter: {
                        file_ids: inputs.fileIds
                    }
                } : undefined,
                metadata: inputs.metadata || {},
                temperature: inputs.temperature,
                top_p: inputs.topP,
                response_format: inputs.responseFormat,
            };

            const assistant = await this.openaiClient.beta.assistants.create(createParams);
            
            return {
                id: assistant.id,
                outs: {
                    id: assistant.id,
                    createdAt: assistant.created_at,
                    object: assistant.object,
                    name: assistant.name || "",
                    instructions: assistant.instructions,
                    model: assistant.model,
                    tools: assistant.tools,
                    fileIds: assistant.tool_resources?.code_interpreter?.file_ids,
                    metadata: assistant.metadata || {},
                    temperature: assistant.temperature,
                    topP: assistant.top_p,
                    responseFormat: assistant.response_format,
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating OpenAI Assistant: ${error.message}`);
            }
            throw new Error("Unknown error creating OpenAI Assistant");
        }
    }

    async read(id: pulumi.ID, urn: pulumi.URN): Promise<provider.ReadResult> {
        // Implement resource read logic
        try {
            const assistant = await this.openaiClient.beta.assistants.retrieve(id);
            
            return {
                id: assistant.id,
                props: {
                    id: assistant.id,
                    createdAt: assistant.created_at,
                    object: assistant.object,
                    name: assistant.name || "",
                    instructions: assistant.instructions,
                    model: assistant.model,
                    tools: assistant.tools,
                    fileIds: assistant.tool_resources?.code_interpreter?.file_ids,
                    metadata: assistant.metadata || {},
                    temperature: assistant.temperature,
                    topP: assistant.top_p,
                    responseFormat: assistant.response_format,
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error reading OpenAI Assistant: ${error.message}`);
            }
            throw new Error("Unknown error reading OpenAI Assistant");
        }
    }

    async update(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.UpdateResult> {
        // Implement resource update logic
        try {
            const updateParams: AssistantUpdateParams = {
                name: news.name,
                instructions: news.instructions,
                model: news.model,
                tools: news.tools || [],
                tool_resources: news.fileIds ? {
                    code_interpreter: {
                        file_ids: news.fileIds
                    }
                } : undefined,
                metadata: news.metadata || {},
                temperature: news.temperature,
                top_p: news.topP,
                response_format: news.responseFormat,
            };

            const assistant = await this.openaiClient.beta.assistants.update(id, updateParams);
            
            return {
                outs: {
                    id: assistant.id,
                    createdAt: assistant.created_at,
                    object: assistant.object,
                    name: assistant.name || "",
                    instructions: assistant.instructions,
                    model: assistant.model,
                    tools: assistant.tools,
                    fileIds: assistant.tool_resources?.code_interpreter?.file_ids,
                    metadata: assistant.metadata || {},
                    temperature: assistant.temperature,
                    topP: assistant.top_p,
                    responseFormat: assistant.response_format,
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating OpenAI Assistant: ${error.message}`);
            }
            throw new Error("Unknown error updating OpenAI Assistant");
        }
    }

    async delete(id: pulumi.ID, urn: pulumi.URN): Promise<void> {
        // Implement resource deletion logic
        try {
            await this.openaiClient.beta.assistants.del(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error deleting OpenAI Assistant: ${error.message}`);
            }
            throw new Error("Unknown error deleting OpenAI Assistant");
        }
    }
}

async function constructAssistant(client: OpenAI, name: string, inputs: pulumi.Inputs, options: pulumi.ComponentResourceOptions): Promise<provider.ConstructResult> {
    // Create the Assistant resource
    const assistant = new Assistant(name, inputs as AssistantArgs, options);
    
    // Return the URN and state
    return {
        urn: assistant.urn,
        state: {
            id: assistant.id,
            createdAt: assistant.createdAt,
            object: assistant.object,
            name: assistant.name,
            instructions: assistant.instructions,
            model: assistant.model,
            tools: assistant.tools,
            fileIds: assistant.fileIds,
            metadata: assistant.metadata,
            temperature: assistant.temperature,
            topP: assistant.topP,
            responseFormat: assistant.responseFormat,
        },
    };
} 