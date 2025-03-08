// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

export class Assistant extends pulumi.CustomResource {
    /**
     * Get an existing Assistant resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): Assistant {
        return new Assistant(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'openai:index:Assistant';

    /**
     * Returns true if the given object is an instance of Assistant.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is Assistant {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === Assistant.__pulumiType;
    }

    /**
     * The Unix timestamp (in seconds) for when the assistant was created.
     */
    public /*out*/ readonly createdAt!: pulumi.Output<number>;
    /**
     * A list of file IDs attached to this assistant.
     */
    public readonly fileIds!: pulumi.Output<string[] | undefined>;
    /**
     * The unique identifier for the assistant.
     */
    public /*out*/ readonly id!: pulumi.Output<string>;
    /**
     * The system instructions that the assistant uses.
     */
    public readonly instructions!: pulumi.Output<string | undefined>;
    /**
     * Set of key-value pairs that can be used to store additional information about the assistant.
     */
    public readonly metadata!: pulumi.Output<{[key: string]: string} | undefined>;
    /**
     * The model that the assistant uses.
     */
    public readonly model!: pulumi.Output<string>;
    /**
     * The name of the assistant.
     */
    public readonly name!: pulumi.Output<string>;
    /**
     * The object type, which is always 'assistant'.
     */
    public /*out*/ readonly object!: pulumi.Output<string>;
    /**
     * The format of the response. Can be 'auto' or 'json_object'.
     */
    public readonly responseFormat!: pulumi.Output<string | undefined>;
    /**
     * What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
     */
    public readonly temperature!: pulumi.Output<number | undefined>;
    /**
     * Tool resources for the assistant
     */
    public readonly toolResources!: pulumi.Output<{[key: string]: string} | undefined>;
    /**
     * A list of tools enabled on the assistant.
     */
    public readonly tools!: pulumi.Output<{[key: string]: string}[] | undefined>;
    /**
     * An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.
     */
    public readonly topP!: pulumi.Output<number | undefined>;

    /**
     * Create a Assistant resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args: AssistantArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            if ((!args || args.model === undefined) && !opts.urn) {
                throw new Error("Missing required property 'model'");
            }
            if ((!args || args.name === undefined) && !opts.urn) {
                throw new Error("Missing required property 'name'");
            }
            resourceInputs["fileIds"] = args ? args.fileIds : undefined;
            resourceInputs["instructions"] = args ? args.instructions : undefined;
            resourceInputs["metadata"] = args ? args.metadata : undefined;
            resourceInputs["model"] = args ? args.model : undefined;
            resourceInputs["name"] = args ? args.name : undefined;
            resourceInputs["responseFormat"] = args ? args.responseFormat : undefined;
            resourceInputs["temperature"] = args ? args.temperature : undefined;
            resourceInputs["toolResources"] = args ? args.toolResources : undefined;
            resourceInputs["tools"] = args ? args.tools : undefined;
            resourceInputs["topP"] = args ? args.topP : undefined;
            resourceInputs["createdAt"] = undefined /*out*/;
            resourceInputs["id"] = undefined /*out*/;
            resourceInputs["object"] = undefined /*out*/;
        } else {
            resourceInputs["createdAt"] = undefined /*out*/;
            resourceInputs["fileIds"] = undefined /*out*/;
            resourceInputs["id"] = undefined /*out*/;
            resourceInputs["instructions"] = undefined /*out*/;
            resourceInputs["metadata"] = undefined /*out*/;
            resourceInputs["model"] = undefined /*out*/;
            resourceInputs["name"] = undefined /*out*/;
            resourceInputs["object"] = undefined /*out*/;
            resourceInputs["responseFormat"] = undefined /*out*/;
            resourceInputs["temperature"] = undefined /*out*/;
            resourceInputs["toolResources"] = undefined /*out*/;
            resourceInputs["tools"] = undefined /*out*/;
            resourceInputs["topP"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(Assistant.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a Assistant resource.
 */
export interface AssistantArgs {
    /**
     * A list of file IDs attached to this assistant.
     */
    fileIds?: pulumi.Input<pulumi.Input<string>[]>;
    /**
     * The system instructions that the assistant uses.
     */
    instructions?: pulumi.Input<string>;
    /**
     * Set of key-value pairs that can be used to store additional information about the assistant.
     */
    metadata?: pulumi.Input<{[key: string]: pulumi.Input<string>}>;
    /**
     * The model that the assistant will use (e.g., gpt-4, gpt-3.5-turbo).
     */
    model: pulumi.Input<string>;
    /**
     * The name of the assistant.
     */
    name: pulumi.Input<string>;
    /**
     * The format of the response. Can be 'auto' or 'json_object'.
     */
    responseFormat?: pulumi.Input<string>;
    /**
     * What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
     */
    temperature?: pulumi.Input<number>;
    /**
     * Tool resources for the assistant
     */
    toolResources?: pulumi.Input<{[key: string]: pulumi.Input<string>}>;
    /**
     * A list of tools enabled on the assistant.
     */
    tools?: pulumi.Input<pulumi.Input<{[key: string]: pulumi.Input<string>}>[]>;
    /**
     * An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.
     */
    topP?: pulumi.Input<number>;
}
