import * as pulumi from "@pulumi/pulumi";

/**
 * Arguments for creating an OpenAI Vector Store
 */
export interface VectorStoreArgs {
    /**
     * The name of the vector store
     */
    name: pulumi.Input<string>;

    /**
     * Metadata associated with the vector store
     */
    metadata?: pulumi.Input<{[key: string]: string}>;

    /**
     * The file IDs to include in this vector store
     */
    fileIds?: pulumi.Input<string[]>;

    /**
     * Expiration configuration for the vector store
     */
    expiresAfter?: pulumi.Input<{
        /**
         * The anchor point for expiration calculation
         */
        anchor: pulumi.Input<string>;
        
        /**
         * Number of days after which the vector store expires
         */
        days: pulumi.Input<number>;
    }>;

    /**
     * Chunking strategy for the vector store
     */
    chunkingStrategy?: pulumi.Input<any>;

    /**
     * Optional OpenAI API key to use for this specific resource
     */
    apiKey?: pulumi.Input<string>;
}

/**
 * VectorStore represents an OpenAI Vector Store resource
 */
export class VectorStore extends pulumi.CustomResource {
    /**
     * The unique identifier of the vector store
     */
    public declare readonly id: pulumi.Output<string>;

    /**
     * The name of the vector store
     */
    public readonly name!: pulumi.Output<string>;

    /**
     * Metadata associated with the vector store
     */
    public readonly metadata!: pulumi.Output<{[key: string]: string} | undefined>;

    /**
     * The file IDs included in this vector store
     */
    public readonly fileIds!: pulumi.Output<string[] | undefined>;

    /**
     * Expiration configuration for the vector store
     */
    public readonly expiresAfter!: pulumi.Output<{
        anchor: string;
        days: number;
    } | undefined>;

    /**
     * The Unix timestamp when the vector store expires
     */
    public readonly expiresAt!: pulumi.Output<number | undefined>;

    /**
     * The Unix timestamp when the vector store was created
     */
    public readonly createdAt!: pulumi.Output<number>;

    /**
     * The Unix timestamp when the vector store was last active
     */
    public readonly lastActiveAt!: pulumi.Output<number | undefined>;

    /**
     * The status of the vector store
     */
    public readonly status!: pulumi.Output<string>;

    /**
     * The object type (always "vector_store")
     */
    public readonly object!: pulumi.Output<string>;

    /**
     * The usage in bytes
     */
    public readonly usageBytes!: pulumi.Output<number>;

    /**
     * Total number of files in the vector store
     */
    public readonly fileCountTotal!: pulumi.Output<number>;

    /**
     * Number of completed files in the vector store
     */
    public readonly fileCountCompleted!: pulumi.Output<number>;

    /**
     * Number of in-progress files in the vector store
     */
    public readonly fileCountInProgress!: pulumi.Output<number>;

    /**
     * Number of failed files in the vector store
     */
    public readonly fileCountFailed!: pulumi.Output<number>;

    /**
     * Number of cancelled files in the vector store
     */
    public readonly fileCountCancelled!: pulumi.Output<number>;

    /**
     * Optional OpenAI API key to use for this specific resource
     */
    public readonly apiKey?: pulumi.Output<string | undefined>;

    constructor(name: string, args: VectorStoreArgs, opts?: pulumi.CustomResourceOptions) {
        super("openai:index:VectorStore", name, {
            ...args,
            id: undefined,
        }, opts);
    }
} 