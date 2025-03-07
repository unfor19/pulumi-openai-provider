import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { type AssistantCreateParams, type AssistantUpdateParams } from "openai/resources/beta/assistants";
import { OpenAIResource } from "./base";

export class AssistantResource implements OpenAIResource {
    async create(client: OpenAI, inputs: any): Promise<provider.CreateResult> {
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

        const assistant = await client.beta.assistants.create(createParams);
        
        return {
            id: assistant.id,
            outs: this.mapAssistantToOutputs(assistant),
        };
    }

    async read(client: OpenAI, id: string): Promise<provider.ReadResult> {
        const assistant = await client.beta.assistants.retrieve(id);
        return {
            id: assistant.id,
            props: this.mapAssistantToOutputs(assistant),
        };
    }

    async update(client: OpenAI, id: string, olds: any, news: any): Promise<provider.UpdateResult> {
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

        const assistant = await client.beta.assistants.update(id, updateParams);
        return {
            outs: this.mapAssistantToOutputs(assistant),
        };
    }

    async delete(client: OpenAI, id: string): Promise<void> {
        await client.beta.assistants.del(id);
    }

    diff(olds: any, news: any): provider.DiffResult {
        const changes: string[] = [];
        
        // Check for changes in properties
        if (olds.name !== news.name) changes.push("name");
        if (olds.instructions !== news.instructions) changes.push("instructions");
        if (olds.model !== news.model) changes.push("model");
        
        // Compare tools arrays
        const oldTools = JSON.stringify(olds.tools || []);
        const newTools = JSON.stringify(news.tools || []);
        if (oldTools !== newTools) changes.push("tools");
        
        // Compare fileIds arrays
        const oldFileIds = JSON.stringify(olds.fileIds || []);
        const newFileIds = JSON.stringify(news.fileIds || []);
        if (oldFileIds !== newFileIds) changes.push("fileIds");
        
        // Compare metadata objects
        const oldMetadata = JSON.stringify(olds.metadata || {});
        const newMetadata = JSON.stringify(news.metadata || {});
        if (oldMetadata !== newMetadata) changes.push("metadata");
        
        // Check scalar properties
        if (olds.temperature !== news.temperature) changes.push("temperature");
        if (olds.topP !== news.topP) changes.push("topP");
        
        // Compare responseFormat objects
        const oldResponseFormat = JSON.stringify(olds.responseFormat || null);
        const newResponseFormat = JSON.stringify(news.responseFormat || null);
        if (oldResponseFormat !== newResponseFormat) changes.push("responseFormat");
        
        return {
            changes: changes.length > 0,
            replaces: olds.model !== news.model ? ["model"] : [],
            deleteBeforeReplace: true,
            stables: ["id"],
        };
    }

    check(inputs: any): any {
        if (!inputs.model) {
            throw new Error("model is required for Assistant resources");
        }
        return inputs;
    }

    preview(inputs: any): provider.CreateResult {
        const previewId = `preview-assistant-${inputs.name}-${inputs.model}`.replace(/\s+/g, '-');
        return {
            id: previewId,
            outs: {
                id: previewId,
                createdAt: Date.now(),
                object: "assistant",
                name: inputs.name,
                instructions: inputs.instructions,
                model: inputs.model,
                tools: inputs.tools || [],
                fileIds: inputs.fileIds || [],
                metadata: inputs.metadata || {},
                temperature: inputs.temperature,
                topP: inputs.topP,
                responseFormat: inputs.responseFormat,
            },
        };
    }

    private mapAssistantToOutputs(assistant: any) {
        return {
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
        };
    }
} 