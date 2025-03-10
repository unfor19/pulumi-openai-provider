# Pulumi OpenAI Provider - Node.js SDK

This repo contains a Pulumi provider for managing OpenAI resources. The provider allows you to create, update, and delete OpenAI resources using Pulumi's infrastructure as code approach.

## Features

- Manage OpenAI Assistants with full CRUD operations
- Manage OpenAI Vector Stores with full CRUD operations
- Manage OpenAI Projects with full CRUD operations (requires special permissions)
- Authentication using OpenAI API keys
- Support for all Assistant properties including tools, file attachments, and metadata
- Per-resource API key support allowing different resources to use different API keys

## Background
This repository is based on the [guide for authoring and publishing a Pulumi Package](https://www.pulumi.com/docs/guides/pulumi-packages/how-to-author).

Learn about the concepts behind [Pulumi Packages](https://www.pulumi.com/docs/guides/pulumi-packages/#pulumi-packages) and, more specifically, [Pulumi Components](https://www.pulumi.com/docs/intro/concepts/resources/components/)

## OpenAI Assistant Component Provider

The provider includes an `Assistant` [component resource](https://www.pulumi.com/docs/intro/concepts/resources/#components) that allows you to create and manage OpenAI Assistants. The component maps to the OpenAI API for Assistants and provides a Pulumi-friendly interface for managing these resources.

The component provider makes the Assistant resource available to all Pulumi languages. The implementation is in `provider/cmd/pulumi-resource-openai/provider.ts`. The provider creates an instance of the requested component resource and returns its `URN` and state (outputs).

A code generator is available which generates SDKs in TypeScript, Python, Go and .NET which are also checked in to the `sdk` folder. The SDKs are generated from a schema in `schema.json`. This file defines the component resources supported by the component provider implementation.

An example of using the `Assistant` component in TypeScript is in `examples/simple`.

Note that the provider plugin (`pulumi-resource-openai`) must be on your `PATH` to be used by Pulumi deployments. By default, running `make install` will create the binary specific to your host environment.

After running `make install`, `pulumi-resource-openai` will be available in the `./bin` directory. You can add this to your path in bash with `export PATH=$PATH:$PWD/bin`.

## OpenAI Vector Store Component Provider

The provider includes a `VectorStore` component resource that allows you to create and manage OpenAI Vector Stores. The component maps to the OpenAI API for Vector Stores and provides a Pulumi-friendly interface for managing these resources.

## OpenAI Project Component Provider

The provider includes a `Project` component resource that allows you to create and manage OpenAI Projects. The component maps to the OpenAI API for Projects and provides a Pulumi-friendly interface for managing these resources.

**Note:** The OpenAI Projects API requires an API key with the `api.management.write` scope, which is typically only available to organization administrators or API keys with specific permissions. If you encounter a 401 Unauthorized error with a message about insufficient permissions, you'll need to use an API key with the appropriate permissions.

## Prerequisites

- Pulumi CLI
- Node.js
- Yarn
- Go 1.17 (to regenerate the SDKs)
- Python 3.6+ (to build the Python SDK)
- .NET Core SDK (to build the .NET SDK)
- OpenAI API Key

## Development Workflow

This section outlines the recommended development workflow for this Pulumi provider.

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/pulumi-openai-provider.git
   cd pulumi-openai-provider
   ```

2. **Install dependencies**:
   ```bash
   make dependencies-install
   ```

3. **Set your OpenAI API key**:
   ```bash
   export OPENAI_API_KEY=your-api-key-here
   # Or create a .env file in the project root
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   ```

### Development Cycle

1. **Make changes to the schema**:
   Edit `schema.json` to define or update resources.

2. **Generate SDKs**:
   ```bash
   make generate
   ```

3. **Build the provider**:
   ```bash
   make build
   ```

4. **Install the provider locally**:
   ```bash
   make install
   ```

5. **Generate Build and Install** in a single command:
   ```bash
   make generate-build-install
   ```

6. **Test your changes**:
   ```bash
   make pulumi-preview  # Preview changes
   make pulumi-up       # Apply changes
   ```

7. **Clean up resources when done**:
   ```bash
   make pulumi-destroy
   ```

### Distribution

To build distribution packages for all supported platforms:

```bash
make dist
```

This will create tarballs in the `dist` directory for Linux, macOS, and Windows.

### Common Tasks

- **List OpenAI assistants**:
  ```bash
  make list-assistants
  ```

- **Regenerate a specific SDK**:
  ```bash
  make gen_nodejs_sdk  # For Node.js
  make gen_python_sdk  # For Python
  make gen_go_sdk      # For Go
  make gen_dotnet_sdk  # For .NET
  ```

- **Build a specific SDK**:
  ```bash
  make build_nodejs_sdk  # For Node.js
  make build_python_sdk  # For Python
  make build_dotnet_sdk  # For .NET
  ```

## Configuration

The provider requires an OpenAI API key for authentication. You can provide this in one of three ways:

1. Set the `OPENAI_API_KEY` environment variable (global for all resources)
2. Configure it in your Pulumi stack (global for all resources):

```typescript
const config = new pulumi.Config("openai");
const apiKey = config.requireSecret("apiKey");
```

3. Specify a per-resource API key (overrides the global key):

```typescript
// Create a resource with a specific API key
const assistant = new openai.Assistant("my-assistant", {
    name: "My Assistant",
    model: "gpt-4o",
    instructions: "You are a helpful assistant.",
    // Use a specific API key for this resource
    apiKey: "sk-resource-specific-key"
});
```

### Per-Resource API Key Support

The provider supports using different API keys for different resources, which enables several advanced scenarios:

- **Multi-Account Management**: Manage resources across multiple OpenAI accounts from a single Pulumi program
- **Billing Isolation**: Separate billing for different projects, departments, or clients
- **Access Control**: Implement fine-grained access control by using different API keys with different permissions
- **Environment Separation**: Use different API keys for development, staging, and production environments

During preview and update operations, the provider validates each resource's API key to ensure it's valid and has the necessary permissions. This helps catch authentication issues early in the deployment process.

Example of using different API keys for different resources:

```typescript
// Get API keys from environment variables or other secure sources
const teamAKey = process.env.TEAM_A_API_KEY || "";
const teamBKey = process.env.TEAM_B_API_KEY || "";

// Create resources for Team A
const teamAAssistant = new openai.Assistant("team-a-assistant", {
    name: "Team A Assistant",
    model: "gpt-4o",
    instructions: "You are Team A's assistant.",
    apiKey: teamAKey,
});

// Create resources for Team B
const teamBAssistant = new openai.Assistant("team-b-assistant", {
    name: "Team B Assistant",
    model: "gpt-4o",
    instructions: "You are Team B's assistant.",
    apiKey: teamBKey,
});
```

For debugging API key issues, you can enable debug logging by setting the `PULUMI_OPENAI_DEBUG` environment variable:

```bash
PULUMI_OPENAI_DEBUG=1 pulumi preview
```

This will output detailed logs about API key handling and authentication attempts during the preview and update processes.

## Example Usage


```typescript
import * as pulumi from "@pulumi/pulumi";
import * as openai from "@pulumi/openai";

// Create an OpenAI Assistant
const assistant = new openai.Assistant("my-assistant", {
    name: "My Helpful Assistant",
    instructions: "You are a helpful assistant that provides concise answers.",
    model: "gpt-4",
    tools: [{ type: "code_interpreter" }],
});

// Export the assistant ID
export const assistantId = assistant.id;
```

## Assistant

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as openai from "@pulumi/openai";

// Create an OpenAI Assistant
const assistant = new openai.Assistant("my-assistant", {
    name: "My Helpful Assistant",
    instructions: "You are a helpful assistant that provides concise answers.",
    model: "gpt-4",
    tools: [{ type: "code_interpreter" }],
});

// Export the assistant ID
export const assistantId = assistant.id;
```

### Vector Store

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as openai from "@pulumi/openai";

// Create an OpenAI Vector Store
const vectorStore = new openai.VectorStore("my-vector-store", {
    name: "My Vector Store",
    expiresAfter: {
        anchor: "last_active_at",
        days: 30
    },
    metadata: {
        environment: "development",
        purpose: "testing"
    }
});

// Export the vector store ID
export const vectorStoreId = vectorStore.id;
```

### Project

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as openai from "@pulumi/openai";

// Create an OpenAI Project
// Note: Requires an API key with api.management.write scope
const project = new openai.Project("my-project", {
    name: "My Project",
    description: "A project created via Pulumi",
    metadata: {
        environment: "development",
        createdBy: "pulumi"
    }
});

// Export the project ID
export const projectId = project.id;
```

## Packaging

The provider plugin can be packaged into a tarball and hosted at a custom server URL to make it easier to distribute to users.

Currently, five tarball files are necessary for Linux, macOS, and Windows (`pulumi-resource-openai-v0.0.1-linux-amd64.tar.gz`, `pulumi-resource-openai-v0.0.1-linux-arm64.tar.gz` `pulumi-resource-openai-v0.0.1-darwin-amd64.tar.gz`, `pulumi-resource-openai-v0.0.1-darwin-arm64.tar.gz`, `pulumi-resource-openai-v0.0.1-windows-amd64.tar.gz`) each containing the same files: the platform-specific binary `pulumi-resource-openai`, README and LICENSE. The full set of binaries can be automatically generated using the command `make dist`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Configuring CI and releases

1. Follow the instructions laid out in the [deployment templates](./deployment-templates/README-DEPLOYMENT.md).

