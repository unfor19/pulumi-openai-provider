import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { ResourceRegistry } from "./resources/registry";
import { debugLog } from "./utils";

export class Provider implements provider.Provider {
    private openaiClient: OpenAI;
    readonly version: string = "0.0.1";

    constructor() {
        // Get API key from environment or config
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is required");
        }
        
        debugLog("PROVIDER", "Initializing OpenAI provider");
        
        // Initialize OpenAI client
        this.openaiClient = new OpenAI({
            apiKey: apiKey,
        });
    }

    async construct(name: string, type: string, inputs: pulumi.Inputs, options: pulumi.ComponentResourceOptions): Promise<provider.ConstructResult> {
        // Add debug logging
        debugLog("PROVIDER", `Constructing resource: ${name} of type: ${type}`);
        debugLog("PROVIDER", `Inputs: ${JSON.stringify(inputs)}`);
        debugLog("PROVIDER", `Options: ${JSON.stringify(options)}`);
        
        // Validate resource type exists
        if (!ResourceRegistry.hasHandler(type)) {
            const errorMsg = `Unsupported resource type: ${type}`;
            debugLog("PROVIDER", `ERROR: ${errorMsg}`);
            throw new Error(errorMsg);
        }

        const handler = ResourceRegistry.getHandler(type);
        const urn = pulumi.createUrn(name, type);

        // In preview mode, return a placeholder state
        if (pulumi.runtime.isDryRun()) {
            debugLog("PROVIDER", `Preview mode detected, returning placeholder state for ${name}`);
            try {
                const previewResult = await handler.preview(inputs);
                debugLog("PROVIDER", `Preview result: ${JSON.stringify(previewResult)}`);
                
                // Ensure the ID is properly set in the output
                const state = previewResult.outs || inputs;
                if (!state.id && previewResult.id) {
                    state.id = previewResult.id;
                }
                
                return {
                    urn,
                    state,
                };
            } catch (error) {
                debugLog("PROVIDER", `Error in preview: ${error}`);
                throw error;
            }
        }

        // Create the resource
        try {
            debugLog("PROVIDER", `Creating resource: ${name}`);
            const resourceClient = handler.getClient(this.openaiClient, inputs);
            const result = await handler.create(resourceClient, inputs);
            debugLog("PROVIDER", `Resource created successfully: ${result.id}`);
            return {
                urn,
                state: result.outs,
            };
        } catch (error) {
            debugLog("PROVIDER", `Error creating resource: ${error}`);
            throw error;
        }
    }

    async invoke(token: string, inputs: any): Promise<provider.InvokeResult> {
        debugLog("PROVIDER", `Invoke called with token: ${token}`);
        debugLog("PROVIDER", `Inputs: ${JSON.stringify(inputs)}`);
        
        // TODO: Implement invocations...
        throw new Error(`Invoke not implemented for ${token}`);
    }

    async check(urn: pulumi.URN, olds: any, news: any): Promise<provider.CheckResult> {
        debugLog("PROVIDER", `Checking resource: ${urn}`);
        debugLog("PROVIDER", `Olds: ${JSON.stringify(olds)}`);
        debugLog("PROVIDER", `News: ${JSON.stringify(news)}`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            // This will validate the inputs and return any failures
            const inputs = handler.check(news);
            return {
                inputs,
            };
        } catch (error) {
            debugLog("PROVIDER", `Error checking resource: ${error}`);
            throw error;
        }
    }

    async diff(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.DiffResult> {
        debugLog("PROVIDER", `Diffing resource: ${id} (${urn})`);
        debugLog("PROVIDER", `Olds: ${JSON.stringify(olds)}`);
        debugLog("PROVIDER", `News: ${JSON.stringify(news)}`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            // In preview mode, perform a read operation to validate the API key and detect drift
            if (pulumi.runtime.isDryRun() && id) {
                debugLog("PROVIDER", `Preview mode detected, performing read operation for ${id}`);
                try {
                    // Get the client with the provided API key
                    const resourceClient = handler.getClient(this.openaiClient, news);
                    
                    // Use the existing read function to validate the API key and detect drift
                    await handler.read(resourceClient, id);
                    
                    // If we get here, the API key is valid and the resource exists
                    debugLog("PROVIDER", `Successfully read resource with ID: ${id}`);
                } catch (error: any) {
                    // If we get an authentication error, the API key is invalid
                    if (error.status === 401) {
                        throw new Error(`Invalid API key: ${error.message}`);
                    }
                    
                    // If we get a not found error, the resource doesn't exist (drift)
                    if (error.status === 404) {
                        throw new Error(`Resource with ID ${id} not found. This indicates drift between your Pulumi state and the actual resources.`);
                    }
                    
                    // For other errors, log and continue
                    debugLog("PROVIDER", `Error reading resource: ${error}`);
                }
            }
            
            const result = handler.diff(olds, news);
            debugLog("PROVIDER", `Diff result: ${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            debugLog("PROVIDER", `Error diffing resource: ${error}`);
            throw error;
        }
    }

    async create(urn: pulumi.URN, inputs: any): Promise<provider.CreateResult> {
        debugLog("PROVIDER", `Creating resource: ${urn}`);
        debugLog("PROVIDER", `Inputs: ${JSON.stringify(inputs)}`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            const resourceClient = handler.getClient(this.openaiClient, inputs);
            const result = await handler.create(resourceClient, inputs);
            debugLog("PROVIDER", `Resource created successfully: ${result.id}`);
            return result;
        } catch (error) {
            debugLog("PROVIDER", `Error creating resource: ${error}`);
            throw error;
        }
    }

    async read(id: pulumi.ID, urn: pulumi.URN): Promise<provider.ReadResult> {
        debugLog("PROVIDER", `Reading resource: ${id} (${urn})`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            // For read operations, we need to retrieve the current state first
            // to get the API key if specified
            const currentState = await handler.read(this.openaiClient, id);
            
            // Now create a client with the possibly resource-specific API key
            const resourceClient = handler.getClient(this.openaiClient, currentState.props);
            
            // And re-read with the appropriate client
            const result = await handler.read(resourceClient, id);
            
            debugLog("PROVIDER", `Resource read successfully: ${id}`);
            return result;
        } catch (error) {
            debugLog("PROVIDER", `Error reading resource: ${error}`);
            throw error;
        }
    }

    async update(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.UpdateResult> {
        debugLog("PROVIDER", `Updating resource: ${id} (${urn})`);
        debugLog("PROVIDER", `Olds: ${JSON.stringify(olds)}`);
        debugLog("PROVIDER", `News: ${JSON.stringify(news)}`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            const resourceClient = handler.getClient(this.openaiClient, news);
            const result = await handler.update(resourceClient, id, olds, news);
            debugLog("PROVIDER", `Resource updated successfully: ${id}`);
            return result;
        } catch (error) {
            debugLog("PROVIDER", `Error updating resource: ${error}`);
            throw error;
        }
    }

    async delete(id: pulumi.ID, urn: pulumi.URN): Promise<void> {
        debugLog("PROVIDER", `Deleting resource: ${id} (${urn})`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            // For delete operations, we need to retrieve the current state first
            // to get the API key if specified
            const currentState = await handler.read(this.openaiClient, id);
            
            // Now create a client with the possibly resource-specific API key
            const resourceClient = handler.getClient(this.openaiClient, currentState.props);
            
            await handler.delete(resourceClient, id);
            debugLog("PROVIDER", `Resource deleted successfully: ${id}`);
        } catch (error) {
            debugLog("PROVIDER", `Error deleting resource: ${error}`);
            throw error;
        }
    }

    private getResourceTypeFromURN(urn: pulumi.URN): string {
        const parts = urn.split("::");
        return parts[2];
    }
} 