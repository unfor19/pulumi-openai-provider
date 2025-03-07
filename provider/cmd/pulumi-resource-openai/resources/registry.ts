import { OpenAIResource } from "./base";
import { AssistantResource } from "./assistant";

/**
 * Registry of all OpenAI resources
 */
export class ResourceRegistry {
    private static readonly resources: { [key: string]: OpenAIResource } = {
        "openai:index:Assistant": new AssistantResource(),
        // Add more resources here as they are implemented
    };

    /**
     * Get a resource handler by type
     */
    static getHandler(type: string): OpenAIResource {
        const handler = this.resources[type];
        if (!handler) {
            throw new Error(`Unsupported resource type: ${type}`);
        }
        return handler;
    }

    /**
     * Check if a resource type is supported
     */
    static hasHandler(type: string): boolean {
        return type in this.resources;
    }

    /**
     * Get all supported resource types
     */
    static getSupportedTypes(): string[] {
        return Object.keys(this.resources);
    }
} 