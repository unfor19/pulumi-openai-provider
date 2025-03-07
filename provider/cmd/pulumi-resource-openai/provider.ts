import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { ResourceRegistry } from "./resources/registry";

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
        // Add debug logging
        console.log(`Constructing resource: ${name} of type: ${type}`);
        console.log(`Inputs: ${JSON.stringify(inputs)}`);
        console.log(`Options: ${JSON.stringify(options)}`);
        
        // Validate resource type exists
        if (!ResourceRegistry.hasHandler(type)) {
            console.error(`Unsupported resource type: ${type}`);
            throw new Error(`Unsupported resource type: ${type}`);
        }

        const handler = ResourceRegistry.getHandler(type);
        const urn = pulumi.createUrn(name, type);

        // In preview mode, return a placeholder state
        if (pulumi.runtime.isDryRun()) {
            console.log(`Preview mode detected, returning placeholder state for ${name}`);
            const previewResult = handler.preview(inputs);
            console.log(`Preview result: ${JSON.stringify(previewResult)}`);
            
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

        // Create the actual resource
        console.log(`Creating actual resource: ${name}`);
        const result = await handler.create(this.openaiClient, inputs);
        console.log(`Create result: ${JSON.stringify(result)}`);
        return {
            urn,
            state: result.outs,
        };
    }

    async check(urn: pulumi.URN, olds: any, news: any): Promise<provider.CheckResult> {
        const type = this.getResourceTypeFromURN(urn);
        const handler = ResourceRegistry.getHandler(type);
        return {
            inputs: handler.check(news),
        };
    }

    async create(urn: pulumi.URN, inputs: any): Promise<provider.CreateResult> {
        try {
            const type = this.getResourceTypeFromURN(urn);
            const handler = ResourceRegistry.getHandler(type);

            pulumi.log.info(`Creating OpenAI ${type}: ${inputs.name}`);
            return await handler.create(this.openaiClient, inputs);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating OpenAI resource: ${error.message}`);
            }
            throw error;
        }
    }

    async read(id: pulumi.ID, urn: pulumi.URN): Promise<provider.ReadResult> {
        try {
            const type = this.getResourceTypeFromURN(urn);
            const handler = ResourceRegistry.getHandler(type);
            return await handler.read(this.openaiClient, id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error reading OpenAI resource: ${error.message}`);
            }
            throw error;
        }
    }

    async update(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.UpdateResult> {
        try {
            const type = this.getResourceTypeFromURN(urn);
            const handler = ResourceRegistry.getHandler(type);

            if (pulumi.runtime.isDryRun()) {
                pulumi.log.debug(`[Preview] Would update ${type}: ${id}`);
                return { outs: news };
            }

            return await handler.update(this.openaiClient, id, olds, news);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating OpenAI resource: ${error.message}`);
            }
            throw error;
        }
    }

    async delete(id: pulumi.ID, urn: pulumi.URN): Promise<void> {
        try {
            const type = this.getResourceTypeFromURN(urn);
            const handler = ResourceRegistry.getHandler(type);

            if (pulumi.runtime.isDryRun()) {
                pulumi.log.debug(`[Preview] Would delete ${type}: ${id}`);
                return;
            }

            await handler.delete(this.openaiClient, id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error deleting OpenAI resource: ${error.message}`);
            }
            throw error;
        }
    }

    async diff(id: pulumi.ID, urn: pulumi.URN, olds: any, news: any): Promise<provider.DiffResult> {
        try {
            const type = this.getResourceTypeFromURN(urn);
            const handler = ResourceRegistry.getHandler(type);
            return handler.diff(olds, news);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error calculating diff: ${error.message}`);
            }
            throw error;
        }
    }

    private getResourceTypeFromURN(urn: pulumi.URN): string {
        const parts = urn.toString().split('::');
        if (parts.length < 3) {
            throw new Error(`Invalid URN format: ${urn}`);
        }
        return parts[2];
    }
} 