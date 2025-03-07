import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { debugLog } from "../../utils";
import { OpenAIResource } from "../base";

/**
 * VectorStoreResource implements the OpenAI Vector Store resource type
 */
export class VectorStoreResource implements OpenAIResource {
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
            
            if (metadata) {
                params.metadata = metadata;
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
        debugLog("VectorStoreResource", "diff called with olds: %o, news: %o", olds, news);

        const replaces: string[] = [];
        const stables: string[] = ["id", "expiresAt", "lastActiveAt", "createdAt"];
        let changes = false;

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
            deleteBeforeReplace: false,
        };
    }

    check(inputs: any): any {
        debugLog("VectorStoreResource", "check called with inputs: %o", inputs);
        // Validate inputs
        return inputs;
    }

    preview(inputs: any): provider.CreateResult {
        debugLog("VectorStoreResource", "preview called with inputs: %o", inputs);
        
        // For preview, we'll just return a placeholder ID and the inputs as outputs
        return {
            id: "preview-vector-store-id",
            outs: {
                id: "preview-vector-store-id",
                name: inputs.name,
                metadata: inputs.metadata,
                fileIds: inputs.fileIds,
                expiresAfter: inputs.expiresAfter,
                status: "completed",
                object: "vector_store",
                createdAt: new Date().getTime() / 1000,
                lastActiveAt: new Date().getTime() / 1000,
                usageBytes: 0,
                fileCounts: {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    failed: 0,
                    cancelled: 0
                }
            },
        };
    }

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
} 