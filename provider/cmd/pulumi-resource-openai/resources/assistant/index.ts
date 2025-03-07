import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { type AssistantCreateParams, type AssistantUpdateParams } from "openai/resources/beta/assistants";
import { OpenAIResource } from "../base";
import { debugLog } from "../../utils";

/**
 * AssistantResource implements the OpenAI Assistant resource type
 */
export class AssistantResource implements OpenAIResource {
    async create(client: OpenAI, inputs: any): Promise<provider.CreateResult> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return this.preview(inputs);
        }

        debugLog("ASSISTANT", "Creating assistant with inputs:", inputs);
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
        debugLog("ASSISTANT", "Created assistant:", assistant.id);
        
        return {
            id: assistant.id,
            outs: this.mapAssistantToOutputs(assistant),
        };
    }

    async read(client: OpenAI, id: string): Promise<provider.ReadResult> {
        debugLog("ASSISTANT", "Reading assistant:", id);
        const assistant = await client.beta.assistants.retrieve(id);
        return {
            id: assistant.id,
            props: this.mapAssistantToOutputs(assistant),
        };
    }

    async update(client: OpenAI, id: string, olds: any, news: any): Promise<provider.UpdateResult> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return { outs: news };
        }

        debugLog("ASSISTANT", "Updating assistant:", id);
        debugLog("ASSISTANT", "Old values:", olds);
        debugLog("ASSISTANT", "New values:", news);
        
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
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return;
        }

        debugLog("ASSISTANT", "Deleting assistant:", id);
        await client.beta.assistants.del(id);
    }

    diff(olds: any, news: any): provider.DiffResult {
        const changes: string[] = [];
        
        // Debug logging
        debugLog("DIFF", "Comparing old and new states:");
        debugLog("DIFF", "Old state:", JSON.stringify(olds, null, 2));
        debugLog("DIFF", "New state:", JSON.stringify(news, null, 2));
        
        // Helper function for deep equality comparison
        const isEqual = (a: any, b: any, propName: string): boolean => {
            // Debug logging
            debugLog("DIFF", `Comparing ${propName}: Old: ${JSON.stringify(a)}, New: ${JSON.stringify(b)}`);
            
            // If both are null or undefined, they're equal
            if (a == null && b == null) return true;
            
            // If only one is null/undefined, they're not equal
            if (a == null || b == null) {
                debugLog("DIFF", `${propName} - One value is null/undefined`);
                return false;
            }
            
            // For arrays, compare length and each element
            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) {
                    debugLog("DIFF", `${propName} - Array lengths differ: ${a.length} vs ${b.length}`);
                    return false;
                }
                
                // For simple arrays (like fileIds), sort and compare
                if (a.length > 0 && typeof a[0] !== 'object') {
                    const sortedA = [...a].sort();
                    const sortedB = [...b].sort();
                    const result = JSON.stringify(sortedA) === JSON.stringify(sortedB);
                    if (!result) {
                        debugLog("DIFF", `${propName} - Simple arrays differ after sorting`);
                    }
                    return result;
                }
                
                // For arrays of objects (like tools), compare each object
                for (let i = 0; i < a.length; i++) {
                    // Find matching object in b
                    const aObj = a[i];
                    const matchingBObj = b.find((bObj: any) => 
                        Object.keys(aObj).every(key => isEqual(aObj[key], bObj[key], `${propName}[${i}].${key}`))
                    );
                    
                    if (!matchingBObj) {
                        debugLog("DIFF", `${propName} - No matching object found for index ${i}`);
                        return false;
                    }
                }
                return true;
            }
            
            // For objects, compare keys and values
            if (typeof a === 'object' && typeof b === 'object') {
                const keysA = Object.keys(a);
                const keysB = Object.keys(b);
                
                // If they have different number of keys, they're not equal
                if (keysA.length !== keysB.length) {
                    debugLog("DIFF", `${propName} - Object key counts differ: ${keysA.length} vs ${keysB.length}`);
                    debugLog("DIFF", `${propName} - Keys A: ${keysA.join(', ')}`);
                    debugLog("DIFF", `${propName} - Keys B: ${keysB.join(', ')}`);
                    return false;
                }
                
                // Check if all keys in a exist in b with the same values
                const result = keysA.every(key => {
                    const keyExists = keysB.includes(key);
                    if (!keyExists) {
                        debugLog("DIFF", `${propName} - Key '${key}' missing in new object`);
                        return false;
                    }
                    
                    const valuesEqual = isEqual(a[key], b[key], `${propName}.${key}`);
                    if (!valuesEqual) {
                        debugLog("DIFF", `${propName} - Values differ for key '${key}'`);
                    }
                    return valuesEqual;
                });
                
                return result;
            }
            
            // For primitive values, use strict equality
            const result = a === b;
            if (!result) {
                debugLog("DIFF", `${propName} - Primitive values differ: '${a}' vs '${b}'`);
            }
            return result;
        };
        
        // Check for changes in properties
        if (!isEqual(olds.name, news.name, "name")) changes.push("name");
        if (!isEqual(olds.instructions, news.instructions, "instructions")) changes.push("instructions");
        if (!isEqual(olds.model, news.model, "model")) changes.push("model");
        if (!isEqual(olds.tools || [], news.tools || [], "tools")) changes.push("tools");
        if (!isEqual(olds.fileIds || [], news.fileIds || [], "fileIds")) changes.push("fileIds");
        if (!isEqual(olds.metadata || {}, news.metadata || {}, "metadata")) changes.push("metadata");
        if (!isEqual(olds.temperature, news.temperature, "temperature")) changes.push("temperature");
        if (!isEqual(olds.topP, news.topP, "topP")) changes.push("topP");
        if (!isEqual(olds.responseFormat, news.responseFormat, "responseFormat")) changes.push("responseFormat");
        
        debugLog("DIFF", "Changes detected:", changes);
        
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