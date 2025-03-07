import * as pulumi from "@pulumi/pulumi";
import OpenAI from "openai";
import { type AssistantCreateParams } from "openai/resources/beta/assistants";

export interface AssistantArgs {
    name: pulumi.Input<string>;
    instructions?: pulumi.Input<string>;
    model: pulumi.Input<string>;
    tools?: pulumi.Input<AssistantCreateParams['tools']>;
    fileIds?: pulumi.Input<string[]>;
    metadata?: pulumi.Input<{[key: string]: string}>;
    temperature?: pulumi.Input<number>;
    topP?: pulumi.Input<number>;
    responseFormat?: pulumi.Input<AssistantCreateParams['response_format']>;
}

export class Assistant extends pulumi.ComponentResource {
    public readonly id: pulumi.Output<string>;
    public readonly createdAt: pulumi.Output<number>;
    public readonly object: pulumi.Output<string>;
    public readonly name: pulumi.Output<string>;
    public readonly instructions: pulumi.Output<string | undefined>;
    public readonly model: pulumi.Output<string>;
    public readonly tools: pulumi.Output<AssistantCreateParams['tools'] | undefined>;
    public readonly fileIds: pulumi.Output<string[] | undefined>;
    public readonly metadata: pulumi.Output<{[key: string]: string} | undefined>;
    public readonly temperature: pulumi.Output<number | undefined>;
    public readonly topP: pulumi.Output<number | undefined>;
    public readonly responseFormat: pulumi.Output<AssistantCreateParams['response_format'] | undefined>;

    constructor(name: string, args: AssistantArgs, opts?: pulumi.ComponentResourceOptions) {
        super("openai:index:Assistant", name, args, opts);

        // Get the OpenAI client from the provider
        const openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Create the assistant
        const createAssistantPromise = pulumi.output(args).apply(async resolvedArgs => {
            try {
                const createParams: AssistantCreateParams = {
                    name: resolvedArgs.name,
                    instructions: resolvedArgs.instructions ?? undefined,
                    model: resolvedArgs.model,
                    tools: resolvedArgs.tools || [],
                    tool_resources: resolvedArgs.fileIds ? {
                        code_interpreter: {
                            file_ids: resolvedArgs.fileIds
                        }
                    } : undefined,
                    metadata: resolvedArgs.metadata || {},
                    temperature: resolvedArgs.temperature ?? undefined,
                    top_p: resolvedArgs.topP ?? undefined,
                    response_format: resolvedArgs.responseFormat ?? undefined,
                };

                const assistant = await openaiClient.beta.assistants.create(createParams);
                
                return {
                    id: assistant.id,
                    createdAt: assistant.created_at,
                    object: assistant.object,
                    name: assistant.name ?? "",
                    instructions: assistant.instructions ?? undefined,
                    model: assistant.model,
                    tools: assistant.tools,
                    fileIds: assistant.tool_resources?.code_interpreter?.file_ids ?? undefined,
                    metadata: assistant.metadata ?? {},
                    temperature: assistant.temperature ?? undefined,
                    topP: assistant.top_p ?? undefined,
                    responseFormat: assistant.response_format ?? undefined,
                };
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error creating OpenAI Assistant: ${error.message}`);
                }
                throw new Error("Unknown error creating OpenAI Assistant");
            }
        });

        // Register outputs
        this.id = createAssistantPromise.id;
        this.createdAt = createAssistantPromise.createdAt;
        this.object = createAssistantPromise.object;
        this.name = createAssistantPromise.name;
        this.instructions = createAssistantPromise.instructions;
        this.model = createAssistantPromise.model;
        this.tools = createAssistantPromise.tools;
        this.fileIds = createAssistantPromise.fileIds;
        this.metadata = createAssistantPromise.metadata;
        this.temperature = createAssistantPromise.temperature;
        this.topP = createAssistantPromise.topP;
        this.responseFormat = createAssistantPromise.responseFormat;

        // Register the resource
        this.registerOutputs({
            id: this.id,
            createdAt: this.createdAt,
            object: this.object,
            name: this.name,
            instructions: this.instructions,
            model: this.model,
            tools: this.tools,
            fileIds: this.fileIds,
            metadata: this.metadata,
            temperature: this.temperature,
            topP: this.topP,
            responseFormat: this.responseFormat,
        });
    }

    // Add a method to handle resource deletion
    public static async delete(id: string): Promise<void> {
        const openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        
        await openaiClient.beta.assistants.del(id);
    }
} 