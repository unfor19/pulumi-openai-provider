import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";

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
    preview(inputs: any): provider.CreateResult;
} 