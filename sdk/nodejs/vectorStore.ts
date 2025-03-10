// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

export class VectorStore extends pulumi.CustomResource {
    /**
     * Get an existing VectorStore resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): VectorStore {
        return new VectorStore(name, undefined as any, { ...opts, id: id });
    }

    /** @internal */
    public static readonly __pulumiType = 'openai:index:VectorStore';

    /**
     * Returns true if the given object is an instance of VectorStore.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is VectorStore {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === VectorStore.__pulumiType;
    }

    /**
     * Optional OpenAI API key used for this specific resource.
     */
    public readonly apiKey!: pulumi.Output<string | undefined>;
    /**
     * The Unix timestamp (in seconds) for when the vector store was created.
     */
    public /*out*/ readonly createdAt!: pulumi.Output<number>;
    /**
     * The expiration policy for the vector store.
     */
    public readonly expiresAfter!: pulumi.Output<{ anchor: string; days: number } | undefined>;
    /**
     * The Unix timestamp (in seconds) for when the vector store will expire.
     */
    public /*out*/ readonly expiresAt!: pulumi.Output<number | undefined>;
    /**
     * The number of cancelled files in this vector store.
     */
    public /*out*/ readonly fileCountCancelled!: pulumi.Output<number | undefined>;
    /**
     * Counts of files in the vector store by status.
     */
    public /*out*/ readonly fileCounts!: pulumi.Output<{[key: string]: string} | undefined>;
    /**
     * A list of file IDs used in the vector store.
     */
    public readonly fileIds!: pulumi.Output<string[] | undefined>;
    /**
     * The unique identifier for the vector store.
     */
    public /*out*/ readonly id!: pulumi.Output<string>;
    /**
     * The Unix timestamp (in seconds) for when the vector store was last active.
     */
    public /*out*/ readonly lastActiveAt!: pulumi.Output<number | undefined>;
    /**
     * Set of key-value pairs that can be used to store additional information about the vector store.
     */
    public readonly metadata!: pulumi.Output<{[key: string]: string} | undefined>;
    /**
     * The name of the vector store.
     */
    public readonly name!: pulumi.Output<string>;
    /**
     * The object type, which is always 'vector_store'.
     */
    public /*out*/ readonly object!: pulumi.Output<string>;
    /**
     * The status of the vector store (e.g., 'completed', 'in_progress').
     */
    public /*out*/ readonly status!: pulumi.Output<string>;
    /**
     * The number of bytes used by the vector store.
     */
    public /*out*/ readonly usageBytes!: pulumi.Output<number | undefined>;

    /**
     * Create a VectorStore resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args: VectorStoreArgs, opts?: pulumi.CustomResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            if ((!args || args.name === undefined) && !opts.urn) {
                throw new Error("Missing required property 'name'");
            }
            resourceInputs["apiKey"] = args?.apiKey ? pulumi.secret(args.apiKey) : undefined;
            resourceInputs["chunkingStrategy"] = args ? args.chunkingStrategy : undefined;
            resourceInputs["expiresAfter"] = args ? args.expiresAfter : undefined;
            resourceInputs["fileIds"] = args ? args.fileIds : undefined;
            resourceInputs["metadata"] = args ? args.metadata : undefined;
            resourceInputs["name"] = args ? args.name : undefined;
            resourceInputs["createdAt"] = undefined /*out*/;
            resourceInputs["expiresAt"] = undefined /*out*/;
            resourceInputs["fileCountCancelled"] = undefined /*out*/;
            resourceInputs["fileCounts"] = undefined /*out*/;
            resourceInputs["id"] = undefined /*out*/;
            resourceInputs["lastActiveAt"] = undefined /*out*/;
            resourceInputs["object"] = undefined /*out*/;
            resourceInputs["status"] = undefined /*out*/;
            resourceInputs["usageBytes"] = undefined /*out*/;
        } else {
            resourceInputs["apiKey"] = undefined /*out*/;
            resourceInputs["createdAt"] = undefined /*out*/;
            resourceInputs["expiresAfter"] = undefined /*out*/;
            resourceInputs["expiresAt"] = undefined /*out*/;
            resourceInputs["fileCountCancelled"] = undefined /*out*/;
            resourceInputs["fileCounts"] = undefined /*out*/;
            resourceInputs["fileIds"] = undefined /*out*/;
            resourceInputs["id"] = undefined /*out*/;
            resourceInputs["lastActiveAt"] = undefined /*out*/;
            resourceInputs["metadata"] = undefined /*out*/;
            resourceInputs["name"] = undefined /*out*/;
            resourceInputs["object"] = undefined /*out*/;
            resourceInputs["status"] = undefined /*out*/;
            resourceInputs["usageBytes"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        const secretOpts = { additionalSecretOutputs: ["apiKey"] };
        opts = pulumi.mergeOptions(opts, secretOpts);
        super(VectorStore.__pulumiType, name, resourceInputs, opts);
    }
}

/**
 * The set of arguments for constructing a VectorStore resource.
 */
export interface VectorStoreArgs {
    /**
     * Optional OpenAI API key to use for this specific resource.
     */
    apiKey?: pulumi.Input<string>;
    /**
     * The chunking strategy used to chunk files.
     */
    chunkingStrategy?: pulumi.Input<{[key: string]: pulumi.Input<string>}>;
    /**
     * The expiration policy for the vector store.
     */
    expiresAfter?: pulumi.Input<{ anchor: pulumi.Input<string>; days: pulumi.Input<number> }>;
    /**
     * A list of file IDs to be used in the vector store.
     */
    fileIds?: pulumi.Input<pulumi.Input<string>[]>;
    /**
     * Set of key-value pairs that can be used to store additional information about the vector store.
     */
    metadata?: pulumi.Input<{[key: string]: pulumi.Input<string>}>;
    /**
     * The name of the vector store.
     */
    name: pulumi.Input<string>;
}
