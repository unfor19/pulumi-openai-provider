import * as pulumi from "@pulumi/pulumi";
import { Provider } from "./provider";

/**
 * Create and register a new provider instance
 */
const provider = new Provider();
pulumi.provider.main(provider, ["."]);

// Export types for SDK generation
export * from "./resources/assistant/types"; 