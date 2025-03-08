import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { type AssistantCreateParams, type AssistantUpdateParams } from "openai/resources/beta/assistants";
import { debugLog } from "../../utils";
import { BaseResource } from "../base";

/**
 * Resource implementation for OpenAI Assistants
 */
export class AssistantResource extends BaseResource {
    protected resourceType = "ASSISTANT";

    async create(client: OpenAI, inputs: any): Promise<provider.CreateResult> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return this.preview(inputs);
        }

        debugLog("ASSISTANT", "Creating assistant with inputs:", JSON.stringify(inputs, null, 2));
        const createParams: AssistantCreateParams = {
            name: inputs.name,
            instructions: inputs.instructions,
            model: inputs.model,
            tools: inputs.tools || [],
            tool_resources: inputs.toolResources ? {
                code_interpreter: inputs.toolResources["codeInterpreter.fileIds"] ? {
                    file_ids: typeof inputs.toolResources["codeInterpreter.fileIds"] === "string" ? (inputs.toolResources["codeInterpreter.fileIds"].startsWith("[") ? JSON.parse(inputs.toolResources["codeInterpreter.fileIds"]) : [inputs.toolResources["codeInterpreter.fileIds"]]) : inputs.toolResources["codeInterpreter.fileIds"]
                } : undefined,
                file_search: inputs.toolResources["fileSearch.vectorStoreIds"] ? {
                    vector_store_ids: typeof inputs.toolResources["fileSearch.vectorStoreIds"] === "string" ? (inputs.toolResources["fileSearch.vectorStoreIds"].startsWith("[") ? JSON.parse(inputs.toolResources["fileSearch.vectorStoreIds"]) : [inputs.toolResources["fileSearch.vectorStoreIds"]]) : inputs.toolResources["fileSearch.vectorStoreIds"]
                } : undefined
            } : inputs.fileIds ? {
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
        
        // Handle metadata changes
        let metadata = news.metadata || {};
        
        // If a property exists in olds.metadata but not in news.metadata, set it to null
        if (olds.metadata) {
            debugLog("ASSISTANT", "Old metadata:", olds.metadata);
            debugLog("ASSISTANT", "New metadata before:", metadata);
            for (const key of Object.keys(olds.metadata)) {
                if (!(key in metadata)) {
                    debugLog("ASSISTANT", `Setting ${key} to null`);
                    metadata[key] = null;
                }
            }
            debugLog("ASSISTANT", "New metadata after:", metadata);
        }
        
        const updateParams: AssistantUpdateParams = {
            name: news.name,
            instructions: news.instructions,
            model: news.model,
            tools: news.tools || [],
            tool_resources: news.toolResources ? {
                code_interpreter: news.toolResources["codeInterpreter.fileIds"] ? {
                    file_ids: typeof news.toolResources["codeInterpreter.fileIds"] === "string" ? (news.toolResources["codeInterpreter.fileIds"].startsWith("[") ? JSON.parse(news.toolResources["codeInterpreter.fileIds"]) : [news.toolResources["codeInterpreter.fileIds"]]) : news.toolResources["codeInterpreter.fileIds"]
                } : undefined,
                file_search: news.toolResources["fileSearch.vectorStoreIds"] ? {
                    vector_store_ids: typeof news.toolResources["fileSearch.vectorStoreIds"] === "string" ? (news.toolResources["fileSearch.vectorStoreIds"].startsWith("[") ? JSON.parse(news.toolResources["fileSearch.vectorStoreIds"]) : [news.toolResources["fileSearch.vectorStoreIds"]]) : news.toolResources["fileSearch.vectorStoreIds"]
                } : undefined
            } : news.fileIds ? {
                code_interpreter: {
                    file_ids: news.fileIds
                }
            } : undefined,
            metadata: metadata,
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
        debugLog("DIFF", "Comparing old and new states:");
        debugLog("DIFF", "Old state:", JSON.stringify(olds, null, 2));
        debugLog("DIFF", "New state:", JSON.stringify(news, null, 2));

        // Detect drift in critical properties
        if (olds.id && olds.object !== "assistant") {
            throw new Error(`Assistant ${olds.id} has an unexpected object type: ${olds.object}. Expected: assistant`);
        }

        // Check if the assistant has been deleted outside of Pulumi
        if (olds.id && !olds.object) {
            throw new Error(`Assistant ${olds.id} appears to have been deleted outside of Pulumi. Please remove it from your Pulumi state.`);
        }

        const changes: string[] = [];
        
        // Helper function for deep equality comparison
        const isEqual = (a: any, b: any, propName: string): boolean => {
            // Debug logging
            debugLog("DIFF", `Comparing ${propName}: Old: ${JSON.stringify(a)}, New: ${JSON.stringify(b)}`);
            
            // Special handling for toolResources
            if (propName === "toolResources") {
                debugLog("DIFF", "Special handling for toolResources");
                
                // If both are empty or undefined, they're equal
                if ((!a || Object.keys(a).length === 0) && (!b || Object.keys(b).length === 0)) {
                    debugLog("DIFF", "Both toolResources are empty or undefined");
                    return true;
                }
                
                // If one is empty and the other isn't, they're not equal
                if (!a || !b || Object.keys(a).length === 0 || Object.keys(b).length === 0) {
                    debugLog("DIFF", "One toolResources is empty and the other isn't");
                    return false;
                }
                
                // Compare codeInterpreter.fileIds
                const aCodeInterpreterFileIds = a["codeInterpreter.fileIds"] || "";
                const bCodeInterpreterFileIds = b["codeInterpreter.fileIds"] || "";
                
                // Compare fileSearch.vectorStoreIds
                const aFileSearchVectorStoreIds = a["fileSearch.vectorStoreIds"] || "";
                const bFileSearchVectorStoreIds = b["fileSearch.vectorStoreIds"] || "";
                
                // For string values, compare directly
                // For array values or JSON strings, normalize and compare
                const normalizeValue = (value: any): string => {
                    if (Array.isArray(value)) {
                        return JSON.stringify(value.sort());
                    }
                    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
                        try {
                            const parsed = JSON.parse(value);
                            if (Array.isArray(parsed)) {
                                return JSON.stringify(parsed.sort());
                            }
                        } catch (e) {
                            // Not valid JSON, treat as string
                        }
                    }
                    return String(value);
                };
                
                const normalizedACodeInterpreter = normalizeValue(aCodeInterpreterFileIds);
                const normalizedBCodeInterpreter = normalizeValue(bCodeInterpreterFileIds);
                const normalizedAFileSearch = normalizeValue(aFileSearchVectorStoreIds);
                const normalizedBFileSearch = normalizeValue(bFileSearchVectorStoreIds);
                
                const codeInterpreterEqual = normalizedACodeInterpreter === normalizedBCodeInterpreter;
                const fileSearchEqual = normalizedAFileSearch === normalizedBFileSearch;
                
                if (!codeInterpreterEqual) {
                    debugLog("DIFF", `codeInterpreter.fileIds differ: ${normalizedACodeInterpreter} vs ${normalizedBCodeInterpreter}`);
                }
                
                if (!fileSearchEqual) {
                    debugLog("DIFF", `fileSearch.vectorStoreIds differ: ${normalizedAFileSearch} vs ${normalizedBFileSearch}`);
                }
                
                return codeInterpreterEqual && fileSearchEqual;
            }
            
            // Special handling for tools
            if (propName === "tools") {
                debugLog("DIFF", "Special handling for tools");
                
                // If both are arrays, compare only the type property
                if (Array.isArray(a) && Array.isArray(b)) {
                    if (a.length !== b.length) {
                        debugLog("DIFF", `${propName} - Array lengths differ: ${a.length} vs ${b.length}`);
                        return false;
                    }
                    
                    // Compare only the type property
                    for (let i = 0; i < a.length; i++) {
                        const aType = a[i].type;
                        const bType = b[i].type;
                        
                        if (aType !== bType) {
                            debugLog("DIFF", `${propName} - Types differ at index ${i}: ${aType} vs ${bType}`);
                            return false;
                        }
                    }
                    
                    debugLog("DIFF", `${propName} - All types match`);
                    return true;
                }
            }
            
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
        
        // Check for changes in toolResources
        if (!isEqual(olds.toolResources || {}, news.toolResources || {}, "toolResources")) {
            debugLog("DIFF", "Removing toolResources from changes array");
            // Don't add to changes array - we'll handle this specially
        }
        
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
        debugLog("AssistantResource", "check called with inputs:", inputs);
        
        // Validate required inputs
        if (!inputs.name) {
            throw new Error("Assistant name is required");
        }
        
        if (!inputs.model) {
            throw new Error("Assistant model is required");
        }
        
        // Validate API key if provided
        if (inputs.apiKey && !this.validateApiKey(inputs.apiKey)) {
            throw new Error("Invalid API key format or length");
        }
        
        // Validate tools if provided
        if (inputs.tools && !Array.isArray(inputs.tools)) {
            throw new Error("Tools must be an array");
        }
        
        // Validate temperature if provided
        if (inputs.temperature !== undefined && 
            (typeof inputs.temperature !== 'number' || 
             inputs.temperature < 0 || 
             inputs.temperature > 2)) {
            throw new Error("Temperature must be a number between 0 and 2");
        }
        
        return inputs;
    }

    private mapAssistantToOutputs(assistant: any) {
        // Prepare toolResources if tool_resources exists
        let toolResources: any = undefined;
        
        if (assistant.tool_resources) {
            toolResources = {};
            
            // Handle code_interpreter
            if (assistant.tool_resources.code_interpreter?.file_ids) {
                toolResources["codeInterpreter.fileIds"] = assistant.tool_resources.code_interpreter.file_ids;
            }
            
            // Handle file_search
            if (assistant.tool_resources.file_search?.vector_store_ids) {
                toolResources["fileSearch.vectorStoreIds"] = assistant.tool_resources.file_search.vector_store_ids;
            }
        }
        
        return {
            id: assistant.id,
            createdAt: assistant.created_at,
            object: assistant.object,
            name: assistant.name || "",
            instructions: assistant.instructions,
            model: assistant.model,
            tools: assistant.tools,
            fileIds: assistant.tool_resources?.code_interpreter?.file_ids,
            toolResources: toolResources,
            metadata: assistant.metadata || {},
            temperature: assistant.temperature,
            topP: assistant.top_p,
            responseFormat: assistant.response_format,
        };
    }

    /**
     * Check for drift between the actual resource and the desired state
     */
    protected checkForDrift(actual: any, desired: any): void {
        debugLog("AssistantResource", "Checking for drift between actual and desired state");
        
        // Check for name drift
        if (actual.name !== desired.name) {
            debugLog("AssistantResource", `Name drift detected: ${actual.name} (actual) vs ${desired.name} (desired)`);
            console.warn(`WARNING: Assistant name has drifted: ${actual.name} (actual) vs ${desired.name} (desired)`);
        }
        
        // Check for model drift
        if (actual.model !== desired.model) {
            debugLog("AssistantResource", `Model drift detected: ${actual.model} (actual) vs ${desired.model} (desired)`);
            console.warn(`WARNING: Assistant model has drifted: ${actual.model} (actual) vs ${desired.model} (desired)`);
        }
        
        // Check for instructions drift
        if (actual.instructions !== desired.instructions) {
            debugLog("AssistantResource", `Instructions drift detected`);
            console.warn(`WARNING: Assistant instructions have drifted`);
        }
        
        // Check for metadata drift
        if (actual.metadata && desired.metadata) {
            const actualMetadataKeys = Object.keys(actual.metadata);
            const desiredMetadataKeys = Object.keys(desired.metadata);
            
            // Check for missing keys
            for (const key of actualMetadataKeys) {
                if (!desiredMetadataKeys.includes(key)) {
                    debugLog("AssistantResource", `Metadata key drift detected: ${key} exists in actual but not in desired`);
                    console.warn(`WARNING: Assistant metadata key '${key}' exists in actual resource but not in desired state`);
                }
            }
            
            // Check for added keys
            for (const key of desiredMetadataKeys) {
                if (!actualMetadataKeys.includes(key)) {
                    debugLog("AssistantResource", `Metadata key drift detected: ${key} exists in desired but not in actual`);
                    console.warn(`WARNING: Assistant metadata key '${key}' exists in desired state but not in actual resource`);
                }
            }
            
            // Check for value changes
            for (const key of actualMetadataKeys) {
                if (desiredMetadataKeys.includes(key) && actual.metadata[key] !== desired.metadata[key]) {
                    debugLog("AssistantResource", `Metadata value drift detected for key ${key}: ${actual.metadata[key]} (actual) vs ${desired.metadata[key]} (desired)`);
                    console.warn(`WARNING: Assistant metadata value for '${key}' has drifted: ${actual.metadata[key]} (actual) vs ${desired.metadata[key]} (desired)`);
                }
            }
        }
        
        // Check for tools drift
        if (actual.tools && desired.tools) {
            if (actual.tools.length !== desired.tools.length) {
                debugLog("AssistantResource", `Tools count drift detected: ${actual.tools.length} (actual) vs ${desired.tools.length} (desired)`);
                console.warn(`WARNING: Assistant tools count has drifted: ${actual.tools.length} (actual) vs ${desired.tools.length} (desired)`);
            } else {
                // Check if all tool types match
                const actualToolTypes = actual.tools.map((tool: any) => tool.type);
                const desiredToolTypes = desired.tools.map((tool: any) => tool.type);
                
                for (let i = 0; i < actualToolTypes.length; i++) {
                    if (actualToolTypes[i] !== desiredToolTypes[i]) {
                        debugLog("AssistantResource", `Tool type drift detected at index ${i}: ${actualToolTypes[i]} (actual) vs ${desiredToolTypes[i]} (desired)`);
                        console.warn(`WARNING: Assistant tool type has drifted at index ${i}: ${actualToolTypes[i]} (actual) vs ${desiredToolTypes[i]} (desired)`);
                    }
                }
            }
        }
    }

    /**
     * Check if a resource with the same name already exists
     */
    protected async checkForExistingResource(inputs: any): Promise<void> {
        if (!inputs.name) {
            return;
        }
        
        try {
            debugLog("AssistantResource", `Checking if an assistant with name '${inputs.name}' already exists`);
            
            // Get the client with the provided API key
            const defaultClient = new OpenAI();
            const resourceClient = this.getClient(defaultClient, inputs);
            
            // List assistants to check if one with the same name exists
            const response = await resourceClient.beta.assistants.list();
            
            if (response.data) {
                const existingAssistant = response.data.find(assistant => assistant.name === inputs.name);
                
                if (existingAssistant) {
                    debugLog("AssistantResource", `Found existing assistant with name '${inputs.name}' and ID '${existingAssistant.id}'`);
                    console.warn(`WARNING: An assistant with name '${inputs.name}' already exists (ID: ${existingAssistant.id}). Creating a new resource will result in a duplicate.`);
                } else {
                    debugLog("AssistantResource", `No existing assistant found with name '${inputs.name}'`);
                }
            }
        } catch (error: any) {
            // If we get an authentication error, the API key is invalid
            if (error.status === 401) {
                throw new Error(`Invalid API key: ${error.message}`);
            }
            
            // For other errors, log and continue
            debugLog("AssistantResource", `Error checking for existing assistant: ${error}`);
        }
    }
} 