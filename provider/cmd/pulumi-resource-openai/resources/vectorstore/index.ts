import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { debugLog } from "../../utils";
import { BaseResource } from "../base";

/**
 * VectorStoreResource implements the OpenAI Vector Store resource type
 */
export class VectorStoreResource extends BaseResource {
    protected resourceType = "VECTORSTORE";

    async create(client: OpenAI, inputs: any): Promise<provider.CreateResult> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return this.preview(inputs);
        }

        debugLog("VectorStoreResource", "create called with inputs: %o", inputs);
        debugLog("VectorStoreResource", "expiresAfter type: %s, value: %o", 
            typeof inputs.expiresAfter, inputs.expiresAfter);

        try {
            // Based on the OpenAI API documentation, the beta.vectorStores API supports:
            // - name: string
            // - metadata: Record<string, string>
            // - file_ids: string[] (optional)
            // - expires_after: { anchor: 'last_active_at', days: number } (optional)
            // - chunking_strategy: object (optional)
            const { name, metadata, fileIds, expiresAfter, chunkingStrategy } = inputs;
            
            // Prepare the request parameters
            const params: any = {
                name: name,
            };
            
            if (metadata) {
                params.metadata = metadata;
            }
            
            if (fileIds && fileIds.length > 0) {
                params.file_ids = fileIds;
            }
            
            if (expiresAfter) {
                params.expires_after = {
                    anchor: expiresAfter.anchor || 'last_active_at',
                };
                
                // Handle days property - ensure it's a number
                if (expiresAfter.days !== undefined) {
                    let daysValue;
                    if (typeof expiresAfter.days === 'string') {
                        daysValue = parseInt(expiresAfter.days, 10);
                        debugLog("VectorStoreResource", "Converting days from string '%s' to number %d", 
                            expiresAfter.days, daysValue);
                    } else {
                        daysValue = expiresAfter.days;
                        debugLog("VectorStoreResource", "Days is already a number: %d", daysValue);
                    }
                    
                    params.expires_after.days = daysValue;
                }
            }
            
            if (chunkingStrategy) {
                params.chunking_strategy = chunkingStrategy;
            }
            
            debugLog("VectorStoreResource", "Creating vector store with params: %o", params);
            const vectorStore = await client.beta.vectorStores.create(params);
            debugLog("VectorStoreResource", "Vector store created: %o", vectorStore);

            return {
                id: vectorStore.id,
                outs: this.mapVectorStoreToOutputs(vectorStore),
            };
        } catch (error) {
            debugLog("VectorStoreResource", "Error creating vector store: %o", error);
            throw error;
        }
    }

    async read(client: OpenAI, id: string): Promise<provider.ReadResult> {
        debugLog("VectorStoreResource", "read called with id: %s", id);

        try {
            const vectorStore = await client.beta.vectorStores.retrieve(id);
            return {
                id: vectorStore.id,
                props: this.mapVectorStoreToOutputs(vectorStore),
            };
        } catch (error) {
            debugLog("VectorStoreResource", "Error reading vector store: %o", error);
            throw error;
        }
    }

    async update(client: OpenAI, id: string, olds: any, news: any): Promise<provider.UpdateResult> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return { outs: news };
        }

        debugLog("VectorStoreResource", "update called with id: %s, olds: %o, news: %o", id, olds, news);
        debugLog("VectorStoreResource", "update expiresAfter type: %s, value: %o", 
            typeof news.expiresAfter, news.expiresAfter);

        try {
            // Based on the OpenAI API documentation, the update method supports:
            // - name: string
            // - metadata: Record<string, string>
            // - expires_after: { anchor: 'last_active_at', days: number } | null
            const { name, metadata, expiresAfter } = news;
            
            // Prepare the update parameters
            const params: any = {};
            
            if (name) {
                params.name = name;
            }
            
            // Handle metadata updates, including property removals
            if (metadata) {
                // Start with the new metadata
                params.metadata = { ...metadata };
                
                // Check for properties that need to be explicitly set to null
                if (olds.metadata) {
                    debugLog("VectorStoreResource", "Old metadata: %o", olds.metadata);
                    debugLog("VectorStoreResource", "New metadata before: %o", params.metadata);
                    
                    // For each property in the old metadata that's not in the new metadata,
                    // explicitly set it to null to remove it
                    for (const key of Object.keys(olds.metadata)) {
                        if (!(key in params.metadata)) {
                            debugLog("VectorStoreResource", "Setting %s to null", key);
                            params.metadata[key] = null;
                        }
                    }
                    
                    debugLog("VectorStoreResource", "New metadata after: %o", params.metadata);
                }
            }
            
            if (expiresAfter !== undefined) {
                if (expiresAfter === null) {
                    params.expires_after = null;
                } else {
                    params.expires_after = {
                        anchor: expiresAfter.anchor || 'last_active_at',
                    };
                    
                    // Handle days property - ensure it's a number
                    if (expiresAfter.days !== undefined) {
                        let daysValue;
                        if (typeof expiresAfter.days === 'string') {
                            daysValue = parseInt(expiresAfter.days, 10);
                            debugLog("VectorStoreResource", "update: Converting days from string '%s' to number %d", 
                                expiresAfter.days, daysValue);
                        } else {
                            daysValue = expiresAfter.days;
                            debugLog("VectorStoreResource", "update: Days is already a number: %d", daysValue);
                        }
                        
                        params.expires_after.days = daysValue;
                    }
                }
            }
            
            debugLog("VectorStoreResource", "Updating vector store with params: %o", params);
            const vectorStore = await client.beta.vectorStores.update(id, params);
            debugLog("VectorStoreResource", "Vector store updated: %o", vectorStore);

            return {
                outs: this.mapVectorStoreToOutputs(vectorStore),
            };
        } catch (error) {
            debugLog("VectorStoreResource", "Error updating vector store: %o", error);
            throw error;
        }
    }

    async delete(client: OpenAI, id: string): Promise<void> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return;
        }

        debugLog("VectorStoreResource", "delete called with id: %s", id);
        await client.beta.vectorStores.del(id);
    }

    diff(olds: any, news: any): provider.DiffResult {
        debugLog("VectorStoreResource", "diff called with olds:", olds, "news:", news);

        let changes: boolean = false;
        const replaces: string[] = [];
        const stables: string[] = ["id", "expiresAt", "lastActiveAt", "createdAt"];
        const deleteBeforeReplace = false;

        // Check for name changes
        if (olds.name !== news.name) {
            debugLog("VectorStoreResource", `Name changed: ${olds.name} -> ${news.name}`);
            changes = true;
        }

        // Detect drift in critical properties
        if (olds.id && olds.status !== "completed") {
            // If the vector store is not in a completed state, this indicates a drift
            throw new Error(`Vector store ${olds.id} is in an unexpected state: ${olds.status}. Expected: completed`);
        }

        // Check if the vector store has been deleted outside of Pulumi
        if (olds.id && olds.status === "deleted") {
            throw new Error(`Vector store ${olds.id} has been deleted outside of Pulumi. Please remove it from your Pulumi state.`);
        }

        // Handle fileIds comparison - empty array is equivalent to undefined/null
        if (Array.isArray(olds.fileIds) && olds.fileIds.length === 0) {
            debugLog("VectorStoreResource", "Empty fileIds array is equivalent to undefined/null");
        }

        // Ignore timestamp fields that change frequently
        const ignoredFields = ["expiresAt", "lastActiveAt", "createdAt"];

        const isEqual = (a: any, b: any, propName: string): boolean => {
            // Ignore timestamp fields that change frequently
            if (ignoredFields.includes(propName)) {
                debugLog("VectorStoreResource", "Ignoring timestamp field: %s", propName);
                return true;
            }
            
            if (a === b) return true;
            
            // Handle undefined/null cases
            if (a === undefined && b === null) return true;
            if (a === null && b === undefined) return true;
            if (a === undefined || a === null || b === undefined || b === null) {
                // Special case for fileIds: empty array is equivalent to undefined/null
                if (propName === "fileIds") {
                    const aIsEmpty = Array.isArray(a) && a.length === 0;
                    const bIsEmpty = Array.isArray(b) && b.length === 0;
                    
                    if ((aIsEmpty && (b === undefined || b === null)) || 
                        (bIsEmpty && (a === undefined || a === null))) {
                        debugLog("VectorStoreResource", "Empty fileIds array is equivalent to undefined/null");
                        return true;
                    }
                }
                return false;
            }
            
            // Handle arrays
            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!isEqual(a[i], b[i], `${propName}[${i}]`)) return false;
                }
                return true;
            }
            
            // Handle objects
            if (typeof a === 'object' && typeof b === 'object') {
                const aKeys = Object.keys(a);
                const bKeys = Object.keys(b);
                
                if (aKeys.length !== bKeys.length) return false;
                
                for (const key of aKeys) {
                    if (!isEqual(a[key], b[key], `${propName}.${key}`)) return false;
                }
                
                return true;
            }
            
            // Special case for comparing string and number values (for days)
            if ((typeof a === 'string' && typeof b === 'number') || 
                (typeof a === 'number' && typeof b === 'string')) {
                return a.toString() === b.toString();
            }
            
            return false;
        };

        // Check for differences in properties
        let nameEqual = isEqual(olds.name, news.name, "name");
        if (!nameEqual) {
            debugLog("VectorStoreResource", "Name changed: %s -> %s", olds.name, news.name);
            changes = true;
        }

        let metadataEqual = isEqual(olds.metadata, news.metadata, "metadata");
        if (!metadataEqual) {
            debugLog("VectorStoreResource", "Metadata changed: %o -> %o", olds.metadata, news.metadata);
            changes = true;
        }
        
        let fileIdsEqual = isEqual(olds.fileIds, news.fileIds, "fileIds");
        if (!fileIdsEqual) {
            debugLog("VectorStoreResource", "FileIds changed: %o -> %o", olds.fileIds, news.fileIds);
            changes = true;
        }
        
        let expiresAfterEqual = isEqual(olds.expiresAfter, news.expiresAfter, "expiresAfter");
        if (!expiresAfterEqual) {
            debugLog("VectorStoreResource", "ExpiresAfter changed: %o -> %o", olds.expiresAfter, news.expiresAfter);
            changes = true;
        }
        
        let chunkingStrategyEqual = isEqual(olds.chunkingStrategy, news.chunkingStrategy, "chunkingStrategy");
        if (!chunkingStrategyEqual) {
            debugLog("VectorStoreResource", "ChunkingStrategy changed: %o -> %o", olds.chunkingStrategy, news.chunkingStrategy);
            changes = true;
        }

        // Force changes to false if only timestamp fields have changed
        if (changes === false || (
            nameEqual && 
            metadataEqual && 
            fileIdsEqual && 
            expiresAfterEqual && 
            chunkingStrategyEqual
        )) {
            debugLog("VectorStoreResource", "No meaningful changes detected, forcing changes=false");
            changes = false;
        }

        debugLog("VectorStoreResource", "Diff result: changes=%s, replaces=%o, stables=%o", 
            changes, replaces, stables);

        return {
            changes,
            replaces,
            stables,
            deleteBeforeReplace,
        };
    }

    check(inputs: any): any {
        debugLog("VectorStoreResource", "check called with inputs:", inputs);
        
        // Validate required inputs
        if (!inputs.name) {
            throw new Error("Vector store name is required");
        }
        
        // Validate API key if provided
        if (inputs.apiKey && !this.validateApiKey(inputs.apiKey)) {
            throw new Error("Invalid API key format or length");
        }
        
        // Validate expiresAfter if provided
        if (inputs.expiresAfter) {
            if (!inputs.expiresAfter.anchor || !inputs.expiresAfter.days) {
                throw new Error("expiresAfter must include both anchor and days properties");
            }
            
            if (!['created_at', 'last_active_at'].includes(inputs.expiresAfter.anchor.replace('_', '_'))) {
                throw new Error("expiresAfter.anchor must be either 'created_at' or 'last_active_at'");
            }
            
            if (typeof inputs.expiresAfter.days !== 'number' || inputs.expiresAfter.days <= 0) {
                throw new Error("expiresAfter.days must be a positive number");
            }
        }
        
        return inputs;
    }

    /**
     * Map vector store API response to resource outputs
     */
    private mapVectorStoreToOutputs(vectorStore: any) {
        debugLog("VectorStoreResource", "mapVectorStoreToOutputs called with: %o", vectorStore);
        
        // Create a simplified output structure
        const outputs: any = {
            id: vectorStore.id,
            name: vectorStore.name,
            metadata: vectorStore.metadata || {},
            fileIds: vectorStore.file_ids || [],
            expiresAt: vectorStore.expires_at,
            createdAt: vectorStore.created_at,
            lastActiveAt: vectorStore.last_active_at,
            status: vectorStore.status,
            object: vectorStore.object,
            usageBytes: vectorStore.usage_bytes
        };
        
        // Only add expiresAfter if it exists
        if (vectorStore.expires_after) {
            outputs.expiresAfter = {
                anchor: vectorStore.expires_after.anchor,
                days: vectorStore.expires_after.days
            };
        }
        
        // Add fileCounts as separate properties
        if (vectorStore.file_counts) {
            outputs.fileCountTotal = vectorStore.file_counts.total || 0;
            outputs.fileCountCompleted = vectorStore.file_counts.completed || 0;
            outputs.fileCountInProgress = vectorStore.file_counts.in_progress || 0;
            outputs.fileCountFailed = vectorStore.file_counts.failed || 0;
            outputs.fileCountCancelled = vectorStore.file_counts.cancelled || 0;
        }
        
        debugLog("VectorStoreResource", "mapVectorStoreToOutputs returning: %o", outputs);
        return outputs;
    }

    /**
     * Check for drift between the actual resource and the desired state
     */
    protected checkForDrift(actual: any, desired: any): void {
        debugLog("VectorStoreResource", "Checking for drift between actual and desired state");
        
        // Check for name drift
        if (actual.name !== desired.name) {
            debugLog("VectorStoreResource", `Name drift detected: ${actual.name} (actual) vs ${desired.name} (desired)`);
            console.warn(`WARNING: Vector store name has drifted: ${actual.name} (actual) vs ${desired.name} (desired)`);
        }
        
        // Check for metadata drift
        if (actual.metadata && desired.metadata) {
            const actualMetadataKeys = Object.keys(actual.metadata);
            const desiredMetadataKeys = Object.keys(desired.metadata);
            
            // Check for missing keys
            for (const key of actualMetadataKeys) {
                if (!desiredMetadataKeys.includes(key)) {
                    debugLog("VectorStoreResource", `Metadata key drift detected: ${key} exists in actual but not in desired`);
                    console.warn(`WARNING: Vector store metadata key '${key}' exists in actual resource but not in desired state`);
                }
            }
            
            // Check for added keys
            for (const key of desiredMetadataKeys) {
                if (!actualMetadataKeys.includes(key)) {
                    debugLog("VectorStoreResource", `Metadata key drift detected: ${key} exists in desired but not in actual`);
                    console.warn(`WARNING: Vector store metadata key '${key}' exists in desired state but not in actual resource`);
                }
            }
            
            // Check for value changes
            for (const key of actualMetadataKeys) {
                if (desiredMetadataKeys.includes(key) && actual.metadata[key] !== desired.metadata[key]) {
                    debugLog("VectorStoreResource", `Metadata value drift detected for key ${key}: ${actual.metadata[key]} (actual) vs ${desired.metadata[key]} (desired)`);
                    console.warn(`WARNING: Vector store metadata value for '${key}' has drifted: ${actual.metadata[key]} (actual) vs ${desired.metadata[key]} (desired)`);
                }
            }
        }
        
        // Check for expiresAfter drift
        if (actual.expiresAfter && desired.expiresAfter) {
            if (actual.expiresAfter.anchor !== desired.expiresAfter.anchor) {
                debugLog("VectorStoreResource", `ExpiresAfter anchor drift detected: ${actual.expiresAfter.anchor} (actual) vs ${desired.expiresAfter.anchor} (desired)`);
                console.warn(`WARNING: Vector store expiresAfter.anchor has drifted: ${actual.expiresAfter.anchor} (actual) vs ${desired.expiresAfter.anchor} (desired)`);
            }
            
            if (actual.expiresAfter.days !== desired.expiresAfter.days) {
                debugLog("VectorStoreResource", `ExpiresAfter days drift detected: ${actual.expiresAfter.days} (actual) vs ${desired.expiresAfter.days} (desired)`);
                console.warn(`WARNING: Vector store expiresAfter.days has drifted: ${actual.expiresAfter.days} (actual) vs ${desired.expiresAfter.days} (desired)`);
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
            debugLog("VectorStoreResource", `Checking if a vector store with name '${inputs.name}' already exists`);
            
            // Get the client with the provided API key
            const defaultClient = new OpenAI();
            const resourceClient = this.getClient(defaultClient, inputs);
            
            // List vector stores to check if one with the same name exists
            const response = await resourceClient.beta.vectorStores.list();
            
            if (response.data) {
                const existingVectorStore = response.data.find(vs => vs.name === inputs.name);
                
                if (existingVectorStore) {
                    debugLog("VectorStoreResource", `Found existing vector store with name '${inputs.name}' and ID '${existingVectorStore.id}'`);
                    console.warn(`WARNING: A vector store with name '${inputs.name}' already exists (ID: ${existingVectorStore.id}). Creating a new resource will result in a duplicate.`);
                } else {
                    debugLog("VectorStoreResource", `No existing vector store found with name '${inputs.name}'`);
                }
            }
        } catch (error: any) {
            // If we get an authentication error, the API key is invalid
            if (error.status === 401) {
                throw new Error(`Invalid API key: ${error.message}`);
            }
            
            // For other errors, log and continue
            debugLog("VectorStoreResource", `Error checking for existing vector store: ${error}`);
        }
    }
} 