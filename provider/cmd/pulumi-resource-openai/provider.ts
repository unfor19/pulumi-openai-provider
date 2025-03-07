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
            const previewResult = handler.preview(inputs);
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
        }

        // Create the resource
        try {
            debugLog("PROVIDER", `Creating resource: ${name}`);
            const result = await handler.create(this.openaiClient, inputs);
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

    async check(urn: pulumi.URN, olds: any, news: any): Promise<provider.CheckResult> {
        debugLog("PROVIDER", `Checking resource: ${urn}`);
        debugLog("PROVIDER", `Old inputs: ${JSON.stringify(olds)}`);
        debugLog("PROVIDER", `New inputs: ${JSON.stringify(news)}`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            const inputs = handler.check(news);
            debugLog("PROVIDER", `Check completed successfully`);
            return { inputs };
        } catch (error) {
            debugLog("PROVIDER", `Check failed: ${error}`);
            throw error;
        }
    }

    async create(urn: pulumi.URN, inputs: any): Promise<provider.CreateResult> {
        debugLog("PROVIDER", `Creating resource: ${urn}`);
        debugLog("PROVIDER", `Inputs: ${JSON.stringify(inputs)}`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            const result = await handler.create(this.openaiClient, inputs);
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
            const result = await handler.read(this.openaiClient, id);
            debugLog("PROVIDER", `Resource read successfully: ${id}`);
            return result;
        } catch (error) {
            debugLog("PROVIDER", `Error reading resource: ${error}`);
            throw error;
        }
    }

    async update(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.UpdateResult> {
        debugLog("PROVIDER", `Updating resource: ${id} (${urn})`);
        debugLog("PROVIDER", `Old inputs: ${JSON.stringify(olds)}`);
        debugLog("PROVIDER", `New inputs: ${JSON.stringify(news)}`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            const result = await handler.update(this.openaiClient, id, olds, news);
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
            await handler.delete(this.openaiClient, id);
            debugLog("PROVIDER", `Resource deleted successfully: ${id}`);
        } catch (error) {
            debugLog("PROVIDER", `Error deleting resource: ${error}`);
            throw error;
        }
    }

    async diff(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.DiffResult> {
        debugLog("PROVIDER", `Diffing resource: ${id} (${urn})`);
        
        const resourceType = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(resourceType);
        
        try {
            const result = handler.diff(olds, news);
            debugLog("PROVIDER", `Diff completed: changes=${result.changes}, replaces=${result.replaces?.join(', ') || 'none'}`);
            return result;
        } catch (error) {
            debugLog("PROVIDER", `Error diffing resource: ${error}`);
            throw error;
        }
    }

    private getResourceTypeFromURN(urn: pulumi.URN): string {
        const parts = urn.split('::');
        if (parts.length >= 3) {
            return parts[2];
        }
        throw new Error(`Invalid URN format: ${urn}`);
    }
} 