import * as pulumi from "@pulumi/pulumi";

/**
 * Arguments for creating an OpenAI Project
 */
export interface ProjectArgs {
    /**
     * The name of the project
     */
    name: pulumi.Input<string>;

    /**
     * The description of the project
     */
    description?: pulumi.Input<string>;

    /**
     * Metadata associated with the project
     */
    metadata?: pulumi.Input<{[key: string]: string}>;

    /**
     * Optional OpenAI API key to use for this specific resource
     */
    apiKey?: pulumi.Input<string>;
}

/**
 * Project represents an OpenAI Project resource
 */
export class Project extends pulumi.CustomResource {
    /**
     * The unique identifier of the project
     */
    public declare readonly id: pulumi.Output<string>;

    /**
     * The Unix timestamp (in seconds) for when the project was created
     */
    public readonly createdAt!: pulumi.Output<number>;

    /**
     * The object type (always "organization.project")
     */
    public readonly object!: pulumi.Output<string>;

    /**
     * The name of the project
     */
    public readonly name!: pulumi.Output<string>;

    /**
     * The description of the project
     */
    public readonly description!: pulumi.Output<string | undefined>;

    /**
     * Metadata associated with the project
     */
    public readonly metadata!: pulumi.Output<{[key: string]: string} | undefined>;

    /**
     * The status of the project (e.g., 'active')
     */
    public readonly status!: pulumi.Output<string>;

    /**
     * The Unix timestamp (in seconds) for when the project was archived, or null if not archived
     */
    public readonly archivedAt!: pulumi.Output<number | null | undefined>;

    /**
     * Optional OpenAI API key to use for this specific resource
     */
    public readonly apiKey?: pulumi.Output<string | undefined>;

    constructor(name: string, args: ProjectArgs, opts?: pulumi.CustomResourceOptions) {
        super("openai:index:Project", name, {
            ...args,
            id: undefined,
        }, opts);
    }
} 