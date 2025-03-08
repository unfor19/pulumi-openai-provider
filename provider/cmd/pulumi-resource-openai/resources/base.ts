import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { debugLog } from "../utils";

/**
 * Base interface for all OpenAI resources
 */
export interface OpenAIResource {
    /**
     * Create a new resource
     */
    create(client: OpenAI, inputs: any): Promise<provider.CreateResult>;

    /**
     * Read an existing resource
     */
    read(client: OpenAI, id: string): Promise<provider.ReadResult>;

    /**
     * Update an existing resource
     */
    update(client: OpenAI, id: string, olds: any, news: any): Promise<provider.UpdateResult>;

    /**
     * Delete an existing resource
     */
    delete(client: OpenAI, id: string): Promise<void>;

    /**
     * Calculate the difference between old and new inputs
     */
    diff(olds: any, news: any): provider.DiffResult;

    /**
     * Validate resource inputs
     */
    check(inputs: any): any;

    /**
     * Get a mock resource for preview mode
     */
    preview(inputs: any): Promise<provider.CreateResult>;

    /**
     * Get a client configured with the resource's API key if provided
     */
    getClient(client: OpenAI, inputs: any): OpenAI;
}

/**
 * Base class for OpenAI resources that implements common functionality
 */
export abstract class BaseResource implements OpenAIResource {
    /**
     * Resource type name for logging
     */
    protected abstract resourceType: string;

    /**
     * Create a new resource
     */
    abstract create(client: OpenAI, inputs: any): Promise<provider.CreateResult>;

    /**
     * Read an existing resource
     */
    abstract read(client: OpenAI, id: string): Promise<provider.ReadResult>;

    /**
     * Update an existing resource
     */
    abstract update(client: OpenAI, id: string, olds: any, news: any): Promise<provider.UpdateResult>;

    /**
     * Delete an existing resource
     */
    abstract delete(client: OpenAI, id: string): Promise<void>;

    /**
     * Calculate the difference between old and new inputs
     */
    abstract diff(olds: any, news: any): provider.DiffResult;

    /**
     * Validate resource inputs
     */
    abstract check(inputs: any): any;

    /**
     * Get a mock resource for preview mode
     * This implementation performs a read operation during preview to validate the API key and detect drift
     */
    async preview(inputs: any): Promise<provider.CreateResult> {
        debugLog(this.resourceType, "preview called with inputs:", JSON.stringify(inputs, (key, value) => 
            key === 'apiKey' ? '[REDACTED]' : value
        ));

        // If we have an ID, try to read the resource to validate the API key and detect drift
        if (inputs.id) {
            try {
                // Get the client with the provided API key
                const defaultClient = new OpenAI();
                const resourceClient = this.getClient(defaultClient, inputs);
                
                // Use the existing read function to validate the API key and detect drift
                debugLog(this.resourceType, `Attempting to read resource with ID: ${inputs.id}`);
                const readResult = await this.read(resourceClient, inputs.id);
                
                // If we get here, the API key is valid and the resource exists
                debugLog(this.resourceType, `Successfully read resource with ID: ${inputs.id}`);
                
                // Check for drift by comparing the read result with the inputs
                this.checkForDrift(readResult.props, inputs);
                
                // Return the preview result
                return {
                    id: inputs.id,
                    outs: readResult.props, // Use the actual properties from the read result
                };
            } catch (error: any) {
                // If we get an authentication error, the API key is invalid
                if (error.status === 401) {
                    throw new Error(`Invalid API key: ${error.message}`);
                }
                
                // If we get a not found error, the resource doesn't exist (drift)
                if (error.status === 404) {
                    throw new Error(`Resource with ID ${inputs.id} not found. This indicates drift between your Pulumi state and the actual resources.`);
                }
                
                // For other errors, log and continue
                debugLog(this.resourceType, `Error reading resource: ${error}`);
            }
        } else {
            // For new resources, check if a resource with the same name already exists
            await this.checkForExistingResource(inputs);
        }

        // For new resources or if read failed, generate a preview ID
        const previewId = `preview-${this.resourceType.toLowerCase()}-${inputs.name}`.replace(/\s+/g, '-');
        
        return {
            id: previewId,
            outs: inputs,
        };
    }

    /**
     * Check for drift between the actual resource and the desired state
     */
    protected abstract checkForDrift(actual: any, desired: any): void;

    /**
     * Check if a resource with the same name already exists
     */
    protected abstract checkForExistingResource(inputs: any): Promise<void>;

    /**
     * Common implementation of API key validation
     */
    protected validateApiKey(apiKey: any): boolean {
        if (typeof apiKey === 'string') {
            return apiKey.length >= 10;
        } else if (typeof apiKey === 'object' && apiKey.value) {
            return typeof apiKey.value === 'string' && apiKey.value.length >= 10;
        }
        return false;
    }

    /**
     * Extract API key value from inputs
     */
    protected extractApiKeyValue(apiKey: any): string | undefined {
        if (typeof apiKey === 'string') {
            return apiKey;
        } else if (typeof apiKey === 'object' && apiKey.value) {
            return apiKey.value;
        }
        return undefined;
    }

    /**
     * Get a client configured with the resource's API key if provided
     */
    getClient(client: OpenAI, inputs: any): OpenAI {
        // Add detailed logging
        debugLog(this.resourceType, "getClient called with inputs:", JSON.stringify(inputs, (key, value) => 
            key === 'apiKey' ? '[REDACTED]' : value
        ));
        
        // If an API key is provided in the inputs, create a new client with that key
        if (inputs.apiKey) {
            debugLog(this.resourceType, "API key found in inputs");
            
            // Extract the actual API key string
            const apiKeyValue = this.extractApiKeyValue(inputs.apiKey);
            
            if (apiKeyValue) {
                debugLog(this.resourceType, "Using resource-specific API key");
                debugLog(this.resourceType, "API key type:", typeof apiKeyValue);
                debugLog(this.resourceType, "API key length:", apiKeyValue.length);
                
                try {
                    const newClient = new OpenAI({
                        apiKey: apiKeyValue,
                    });
                    debugLog(this.resourceType, "Created new OpenAI client with resource-specific API key");
                    return newClient;
                } catch (error) {
                    debugLog(this.resourceType, "Error creating OpenAI client with resource-specific API key:", error);
                    // Fall back to the default client
                    return client;
                }
            }
        }
        
        // If no API key is provided, use the default client
        return client;
    }
} 