import * as pulumi from "@pulumi/pulumi";
import { type AssistantCreateParams } from "openai/resources/beta/assistants";

/**
 * Tool resources for the assistant
 */
export interface ToolResources {
    /**
     * Code interpreter tool resources
     */
    code_interpreter?: {
        /**
         * File IDs for the code interpreter
         */
        file_ids: string[];
    };

    /**
     * File search tool resources
     */
    file_search?: {
        /**
         * Vector store IDs for the file search
         */
        vector_store_ids: string[];
    };
}

/**
 * Arguments for creating an OpenAI Assistant
 */
export interface AssistantArgs {
    /**
     * The name of the assistant
     */
    name: pulumi.Input<string>;

    /**
     * The system instructions that the assistant uses
     */
    instructions?: pulumi.Input<string>;

    /**
     * The model to be used by the assistant
     */
    model: pulumi.Input<string>;

    /**
     * The tools enabled on the assistant
     */
    tools?: pulumi.Input<AssistantCreateParams['tools']>;

    /**
     * The file IDs attached to this assistant (for code_interpreter)
     * @deprecated Use toolResources instead
     */
    fileIds?: pulumi.Input<string[]>;

    /**
     * Tool resources for the assistant
     */
    toolResources?: pulumi.Input<ToolResources>;

    /**
     * Metadata associated with the assistant
     */
    metadata?: pulumi.Input<{[key: string]: string}>;

    /**
     * The sampling temperature to use
     */
    temperature?: pulumi.Input<number>;

    /**
     * The top-p sampling parameter to use
     */
    topP?: pulumi.Input<number>;

    /**
     * The format of the assistant's responses
     */
    responseFormat?: pulumi.Input<AssistantCreateParams['response_format']>;

    /**
     * Optional OpenAI API key to use for this specific resource
     */
    apiKey?: pulumi.Input<string>;
}

/**
 * Assistant represents an OpenAI Assistant resource
 */
export class Assistant extends pulumi.CustomResource {
    /**
     * The unique identifier of the assistant
     */
    public declare readonly id: pulumi.Output<string>;

    /**
     * The Unix timestamp (in seconds) for when the assistant was created
     */
    public readonly createdAt!: pulumi.Output<number>;

    /**
     * The object type (always "assistant")
     */
    public readonly object!: pulumi.Output<string>;

    /**
     * The name of the assistant
     */
    public readonly name!: pulumi.Output<string>;

    /**
     * The system instructions that the assistant uses
     */
    public readonly instructions!: pulumi.Output<string | undefined>;

    /**
     * The model to be used by the assistant
     */
    public readonly model!: pulumi.Output<string>;

    /**
     * The tools enabled on the assistant
     */
    public readonly tools!: pulumi.Output<AssistantCreateParams['tools'] | undefined>;

    /**
     * The file IDs attached to this assistant (for code_interpreter)
     * @deprecated Use toolResources instead
     */
    public readonly fileIds!: pulumi.Output<string[] | undefined>;

    /**
     * Tool resources for the assistant
     */
    public readonly toolResources!: pulumi.Output<ToolResources | undefined>;

    /**
     * Metadata associated with the assistant
     */
    public readonly metadata!: pulumi.Output<{[key: string]: string} | undefined>;

    /**
     * The sampling temperature to use
     */
    public readonly temperature!: pulumi.Output<number | undefined>;

    /**
     * The top-p sampling parameter to use
     */
    public readonly topP!: pulumi.Output<number | undefined>;

    /**
     * The format of the assistant's responses
     */
    public readonly responseFormat!: pulumi.Output<AssistantCreateParams['response_format'] | undefined>;

    /**
     * Optional OpenAI API key to use for this specific resource
     */
    public readonly apiKey?: pulumi.Output<string | undefined>;

    constructor(name: string, args: AssistantArgs, opts?: pulumi.CustomResourceOptions) {
        super("openai:index:Assistant", name, {
            ...args,
            id: undefined,
        }, opts);
    }
} 