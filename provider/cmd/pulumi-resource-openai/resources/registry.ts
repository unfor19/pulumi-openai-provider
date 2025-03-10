import { OpenAIResource } from "./base";
import { AssistantResource } from "./assistant/index";
import { VectorStoreResource } from "./vectorstore/index";
import { ProjectResource } from "./project/index";

/**
 * Registry of all OpenAI resources
 */
export class ResourceRegistry {
    private static readonly resources: { [key: string]: OpenAIResource } = {
        "openai:index:Assistant": new AssistantResource(),
        "openai:index:VectorStore": new VectorStoreResource(),
        "openai:index:Project": new ProjectResource(),
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