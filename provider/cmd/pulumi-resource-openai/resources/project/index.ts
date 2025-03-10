import * as pulumi from "@pulumi/pulumi";
import * as provider from "@pulumi/pulumi/provider";
import OpenAI from "openai";
import { debugLog } from "../../utils";
import { BaseResource } from "../base";

/**
 * Resource implementation for OpenAI Projects
 * 
 * NOTE: The OpenAI Projects API requires an API key with the 'api.management.write' scope.
 * This scope is typically only available to organization administrators or API keys with specific permissions.
 * If you encounter a 401 Unauthorized error with a message about insufficient permissions or missing scopes,
 * you'll need to use an API key with the appropriate permissions.
 */
export class ProjectResource extends BaseResource {
    protected resourceType = "PROJECT";

    async create(client: OpenAI, inputs: any): Promise<provider.CreateResult> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return this.preview(inputs);
        }

        debugLog("PROJECT", "Creating project with inputs:", JSON.stringify(inputs, null, 2));

        try {
            // First, check if a project with the same name already exists
            await this.checkForExistingResource(inputs);

            // Since the OpenAI SDK doesn't have a dedicated Projects API,
            // we need to implement a custom solution using the REST API
            const inputApiKey = inputs.apiKey ? this.extractApiKeyValue(inputs.apiKey) : undefined;
            const apiKey = inputApiKey || client.apiKey;
            const baseUrl = client.baseURL || "https://api.openai.com/v1";

            // Make a direct API call to create a project
            // The correct endpoint is /organization/projects, not /projects
            const response = await fetch(`${baseUrl}/organization/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "OpenAI-Organization": client.organization || "",
                },
                body: JSON.stringify({
                    name: inputs.name,
                    description: inputs.description,
                    metadata: inputs.metadata || {},
                }),
            });

            // Check if the response is OK
            if (!response.ok) {
                // Try to get the response text for better error reporting
                const responseText = await response.text();

                // Check if the response is JSON
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    // If not JSON, use the raw text
                    errorData = responseText;
                }

                // Log the error details
                debugLog("PROJECT", "Error response:", response.status, response.statusText);
                debugLog("PROJECT", "Error data:", errorData);

                // Check if the error is because the project already exists
                if (response.status === 409 ||
                    (errorData && errorData.error &&
                        (errorData.error.message?.includes("already exists") ||
                            errorData.error.code === "project_already_exists"))) {

                    // Try to extract the existing project ID from the error message
                    let existingId = "";
                    const idMatch = errorData.error?.message?.match(/id: ([a-zA-Z0-9_]+)/);
                    if (idMatch && idMatch[1]) {
                        existingId = idMatch[1];
                    }

                    // If we found an ID, try to read the existing project
                    if (existingId) {
                        debugLog("PROJECT", `Project with name '${inputs.name}' already exists with ID '${existingId}'. Reading existing project.`);

                        try {
                            // Get the existing project
                            const getResponse = await fetch(`${baseUrl}/organization/projects/${existingId}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${apiKey}`,
                                    "OpenAI-Organization": client.organization || "",
                                },
                            });

                            if (!getResponse.ok) {
                                throw new Error(`Failed to get existing project: ${getResponse.status} ${getResponse.statusText}`);
                            }

                            const existingProject = await getResponse.json();
                            debugLog("PROJECT", "Found existing project:", JSON.stringify(existingProject, null, 2));

                            // Map the existing project to outputs
                            const mappedOutputs = this.mapProjectToOutputs({
                                ...existingProject,
                                apiKey: inputs.apiKey, // Preserve the API key from inputs
                            });

                            return {
                                id: existingId,
                                outs: mappedOutputs,
                            };
                        } catch (readError) {
                            debugLog("PROJECT", "Error reading existing project:", readError);
                            throw new Error(`Project with name '${inputs.name}' already exists with ID '${existingId}', but failed to read it: ${readError}`);
                        }
                    }

                    throw new Error(
                        `Project with name '${inputs.name}' already exists.\n` +
                        `To use this existing project, you have two options:\n` +
                        `1. Change the project name to a unique name that doesn't exist yet.\n` +
                        `2. Import the existing project using: pulumi import openai:index:Project <resource-name> <project-id>`
                    );
                }

                // If we get a 404, it means the Projects API endpoint doesn't exist
                if (response.status === 404) {
                    throw new Error(`The OpenAI Projects API endpoint is not available. The Projects API might not be publicly available yet or might require special access. Status: ${response.status} ${response.statusText}`);
                }

                throw new Error(`Failed to create project: ${response.status} ${response.statusText} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
            }

            // Get the response text
            const responseText = await response.text();
            debugLog("PROJECT", "Raw response text:", responseText);

            // Try to parse the response as JSON
            let project;
            try {
                project = JSON.parse(responseText);
                // Log the raw project response for debugging
                debugLog("PROJECT", "Raw project response:", JSON.stringify(project, null, 2));
            } catch (error: any) {
                // If we can't parse the response as JSON, log the raw response
                debugLog("PROJECT", "Non-JSON response:", responseText);
                throw new Error(`Failed to parse response as JSON. The OpenAI Projects API might not be publicly available yet or might require special access. Raw response: ${responseText.substring(0, 100)}...`);
            }

            debugLog("PROJECT", "Created project:", project.id);

            // Map the project to outputs, preserving the API key from inputs
            const mappedOutputs = this.mapProjectToOutputs({
                ...project,
                apiKey: inputs.apiKey, // Preserve the API key from inputs
            });

            return {
                id: project.id,
                outs: mappedOutputs,
            };
        } catch (error: any) {
            debugLog("PROJECT", "Error creating project:", error);

            // Provide a more informative error message
            if (error.message.includes("Unexpected token")) {
                throw new Error("The OpenAI Projects API endpoint returned an invalid response. The Projects API might not be publicly available yet or might require special access.");
            }

            throw error;
        }
    }

    async read(client: OpenAI, id: string): Promise<provider.ReadResult> {
        debugLog("PROJECT", "Reading project:", id);

        try {
            // Since the OpenAI SDK doesn't have a dedicated Projects API,
            // we need to implement a custom solution using the REST API
            const apiKey = client.apiKey;
            const baseUrl = client.baseURL || "https://api.openai.com/v1";

            // Make a direct API call to get a project
            // The correct endpoint is /organization/projects/{id}, not /projects/{id}
            const response = await fetch(`${baseUrl}/organization/projects/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "OpenAI-Organization": client.organization || "",
                },
            });

            // Check if the response is OK
            if (!response.ok) {
                // Try to get the response text for better error reporting
                const responseText = await response.text();

                // Check if the response is JSON
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    // If not JSON, use the raw text
                    errorData = responseText;
                }

                // Log the error details
                debugLog("PROJECT", "Error response:", response.status, response.statusText);
                debugLog("PROJECT", "Error data:", errorData);

                // If we get a 404, it means the Projects API endpoint doesn't exist or the project doesn't exist
                if (response.status === 404) {
                    throw new Error(`The OpenAI Projects API endpoint is not available or the project with ID '${id}' does not exist. Status: ${response.status} ${response.statusText}`);
                }

                throw new Error(`Failed to read project: ${response.status} ${response.statusText} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
            }

            // Get the response text
            const responseText = await response.text();
            debugLog("PROJECT", "Raw response text:", responseText);

            // Try to parse the response as JSON
            let project;
            try {
                project = JSON.parse(responseText);
                // Log the raw project response for debugging
                debugLog("PROJECT", "Raw project response (read):", JSON.stringify(project, null, 2));
            } catch (error: any) {
                // If we can't parse the response as JSON, log the raw response
                debugLog("PROJECT", "Non-JSON response:", responseText);
                throw new Error(`Failed to parse response as JSON. The OpenAI Projects API might not be publicly available yet or might require special access. Raw response: ${responseText.substring(0, 200)}...`);
            }

            // Check if the project has the expected structure
            if (!project || !project.id) {
                debugLog("PROJECT", "Invalid project structure:", JSON.stringify(project, null, 2));
                throw new Error(`Invalid project structure returned from API: ${JSON.stringify(project, null, 2)}`);
            }

            // Map the project to outputs, ensuring we match the input structure exactly
            const outputs = {
                id: project.id,
                name: project.name || "",
                description: project.description || "",
                metadata: project.metadata || {},
                apiKey: project.apiKey,
                // Include computed fields but don't let them affect the diff
                createdAt: project.created_at || project.createdAt || Math.floor(Date.now() / 1000),
                object: project.object || "organization.project",
                status: project.status || "active",
                archivedAt: project.archived_at || project.archivedAt || null,
            };

            debugLog("PROJECT", "Mapped project outputs:", JSON.stringify(outputs, null, 2));

            return {
                id: project.id,
                props: outputs,
            };
        } catch (error: any) {
            debugLog("PROJECT", "Error reading project:", error);
            throw error;
        }
    }

    async update(client: OpenAI, id: string, olds: any, news: any): Promise<provider.UpdateResult> {
        // Check if we're in preview mode
        if (pulumi.runtime.isDryRun()) {
            return { outs: news };
        }

        debugLog("PROJECT", "Updating project:", id);
        debugLog("PROJECT", "Old values:", olds);
        debugLog("PROJECT", "New values:", news);

        try {
            // Since the OpenAI SDK doesn't have a dedicated Projects API,
            // we need to implement a custom solution using the REST API
            const inputApiKey = news.apiKey ? this.extractApiKeyValue(news.apiKey) : undefined;
            const apiKey = inputApiKey || client.apiKey;
            const baseUrl = client.baseURL || "https://api.openai.com/v1";

            // Make a direct API call to update a project
            // The correct endpoint is /organization/projects/{id}, not /projects/{id}
            const response = await fetch(`${baseUrl}/organization/projects/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "OpenAI-Organization": client.organization || "",
                },
                body: JSON.stringify({
                    name: news.name,
                    description: news.description,
                    metadata: news.metadata || {},
                }),
            });

            // Check if the response is OK
            if (!response.ok) {
                // Try to get the response text for better error reporting
                const responseText = await response.text();

                // Check if the response is JSON
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    // If not JSON, use the raw text
                    errorData = responseText;
                }

                // Log the error details
                debugLog("PROJECT", "Error response:", response.status, response.statusText);
                debugLog("PROJECT", "Error data:", errorData);

                // If we get a 404, it means the Projects API endpoint doesn't exist or the project doesn't exist
                if (response.status === 404) {
                    throw new Error(`The OpenAI Projects API endpoint is not available or the project with ID '${id}' does not exist. Status: ${response.status} ${response.statusText}`);
                }

                throw new Error(`Failed to update project: ${response.status} ${response.statusText} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
            }

            // Get the response text
            const responseText = await response.text();
            debugLog("PROJECT", "Raw response text:", responseText);

            // Try to parse the response as JSON
            let project;
            try {
                project = JSON.parse(responseText);
                // Log the raw project response for debugging
                debugLog("PROJECT", "Raw project response (update):", JSON.stringify(project, null, 2));
            } catch (error: any) {
                // If we can't parse the response as JSON, log the raw response
                debugLog("PROJECT", "Non-JSON response:", responseText);
                throw new Error(`Failed to parse response as JSON. The OpenAI Projects API might not be publicly available yet or might require special access. Raw response: ${responseText.substring(0, 100)}...`);
            }

            debugLog("PROJECT", "Updated project:", project.id);

            // Map the project to outputs, preserving the API key from inputs
            const mappedOutputs = this.mapProjectToOutputs({
                ...project,
                apiKey: news.apiKey, // Preserve the API key from inputs
            });

            return {
                outs: mappedOutputs,
            };
        } catch (error: any) {
            debugLog("PROJECT", "Error updating project:", error);

            // Provide a more informative error message
            if (error.message.includes("Unexpected token")) {
                throw new Error("The OpenAI Projects API endpoint returned an invalid response. The Projects API might not be publicly available yet or might require special access.");
            }

            throw error;
        }
    }

    async delete(client: OpenAI, id: string): Promise<void> {
        debugLog("PROJECT", "Deleting project:", id);

        try {
            // Since the OpenAI SDK doesn't have a dedicated Projects API,
            // we need to implement a custom solution using the REST API
            const apiKey = client.apiKey;
            const baseUrl = client.baseURL || "https://api.openai.com/v1";

            // Make a direct API call to delete a project
            // The correct endpoint is /organization/projects/{id}, not /projects/{id}
            const response = await fetch(`${baseUrl}/organization/projects/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "OpenAI-Organization": client.organization || "",
                },
            });

            // Check if the response is OK
            if (!response.ok) {
                // Try to get the response text for better error reporting
                const responseText = await response.text();

                // Check if the response is JSON
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    // If not JSON, use the raw text
                    errorData = responseText;
                }

                // Log the error details
                debugLog("PROJECT", "Error response:", response.status, response.statusText);
                debugLog("PROJECT", "Error data:", errorData);

                // If we get a 404, it means the Projects API endpoint doesn't exist
                if (response.status === 404) {
                    throw new Error(`The OpenAI Projects API endpoint is not available. The Projects API might not be publicly available yet or might require special access. Status: ${response.status} ${response.statusText}`);
                }

                throw new Error(`Failed to delete project: ${response.status} ${response.statusText} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
            }

            debugLog("PROJECT", "Deleted project:", id);
        } catch (error: any) {
            debugLog("PROJECT", "Error deleting project:", error);

            // Provide a more informative error message
            if (error.message.includes("Unexpected token")) {
                throw new Error("The OpenAI Projects API endpoint returned an invalid response. The Projects API might not be publicly available yet or might require special access.");
            }

            throw error;
        }
    }

    diff(olds: any, news: any): provider.DiffResult {
        debugLog("PROJECT", "Diffing project:", {
            olds: JSON.stringify(olds, null, 2),
            news: JSON.stringify(news, null, 2)
        });

        // Only compare fields that are part of the resource's inputs
        const oldInputs = {
            name: olds.name || "",
            description: olds.description || "",
            metadata: olds.metadata || {},
            apiKey: olds.apiKey,
        };

        const newInputs = {
            name: news.name || "",
            description: news.description || "",
            metadata: news.metadata || {},
            apiKey: news.apiKey,
        };

        // Compare the normalized inputs
        const oldStr = JSON.stringify(oldInputs);
        const newStr = JSON.stringify(newInputs);

        debugLog("PROJECT", "Comparing normalized inputs:", {
            oldInputs: oldStr,
            newInputs: newStr
        });

        if (oldStr === newStr) {
            debugLog("PROJECT", "No changes detected in inputs");
            return {
                changes: false,
                replaces: [],
                deleteBeforeReplace: false,
                stables: ["id", "object", "apiKey", "createdAt", "status", "archivedAt"],
            };
        }

        // If we get here, there are changes. Let's identify which fields changed.
        const changes: string[] = [];

        if (oldInputs.name !== newInputs.name) {
            debugLog("PROJECT", "Name changed:", {
                old: oldInputs.name,
                new: newInputs.name
            });
            changes.push("name");
        }

        if (oldInputs.description !== newInputs.description) {
            debugLog("PROJECT", "Description changed:", {
                old: oldInputs.description,
                new: newInputs.description
            });
            changes.push("description");
        }

        // Compare metadata objects
        const metadataChanged = JSON.stringify(oldInputs.metadata) !== JSON.stringify(newInputs.metadata);
        if (metadataChanged) {
            debugLog("PROJECT", "Metadata changed:", {
                old: oldInputs.metadata,
                new: newInputs.metadata
            });
            changes.push("metadata");
        }

        // Compare API keys (if they exist)
        if (oldInputs.apiKey !== newInputs.apiKey) {
            debugLog("PROJECT", "API key changed");
            changes.push("apiKey");
        }

        debugLog("PROJECT", "Changes detected:", changes);

        return {
            changes: changes.length > 0,
            replaces: [],
            deleteBeforeReplace: false,
            stables: ["id", "object", "apiKey", "createdAt", "status", "archivedAt"],
        };
    }

    check(inputs: any): any {
        debugLog("PROJECT", "Checking inputs:", JSON.stringify(inputs, null, 2));

        // Validate required inputs
        if (!inputs.name) {
            throw new Error("Missing required property 'name'");
        }

        // Validate API key if provided
        if (inputs.apiKey && !this.validateApiKey(inputs.apiKey)) {
            throw new Error("Invalid API key format");
        }

        // Normalize inputs to ensure consistent structure
        const normalizedInputs = {
            ...inputs,
            description: inputs.description || "",
            metadata: inputs.metadata || {},
        };

        debugLog("PROJECT", "Normalized inputs:", JSON.stringify(normalizedInputs, null, 2));

        return normalizedInputs;
    }

    protected checkForDrift(actual: any, desired: any): void {
        const drifts: string[] = [];

        if (actual.name !== desired.name) {
            drifts.push(`name: expected '${desired.name}', got '${actual.name}'`);
        }

        if ((actual.description || "") !== (desired.description || "")) {
            drifts.push(`description: expected '${desired.description || ""}', got '${actual.description || ""}'`);
        }

        // Check if metadata has drifted
        const actualMetadata = actual.metadata || {};
        const desiredMetadata = desired.metadata || {};

        for (const key of Object.keys(desiredMetadata)) {
            if (actualMetadata[key] !== desiredMetadata[key]) {
                drifts.push(`metadata.${key}: expected '${desiredMetadata[key]}', got '${actualMetadata[key] || "undefined"}'`);
            }
        }

        for (const key of Object.keys(actualMetadata)) {
            if (!(key in desiredMetadata)) {
                drifts.push(`metadata.${key}: expected 'undefined', got '${actualMetadata[key]}'`);
            }
        }

        if (drifts.length > 0) {
            debugLog("PROJECT", "Detected drift:", drifts.join(", "));
        }
    }

    protected async checkForExistingResource(inputs: any): Promise<void> {
        try {
            // Since the OpenAI SDK doesn't have a dedicated Projects API,
            // we need to implement a custom solution using the REST API
            const client = this.getClient(new OpenAI(), inputs);
            const inputApiKey = inputs.apiKey ? this.extractApiKeyValue(inputs.apiKey) : undefined;
            const apiKey = inputApiKey || client.apiKey;
            const baseUrl = client.baseURL || "https://api.openai.com/v1";

            // Make a direct API call to list projects
            // The correct endpoint is /organization/projects, not /projects
            const response = await fetch(`${baseUrl}/organization/projects`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "OpenAI-Organization": client.organization || "",
                },
            });

            // Check if the response is OK
            if (!response.ok) {
                const status = response.status;
                debugLog("PROJECT", `Failed to list projects: ${status} ${response.statusText}`);

                // If we get a 401 Unauthorized, it means the user doesn't have permission to list projects
                if (status === 401) {
                    debugLog("PROJECT", "User doesn't have permission to list projects. Cannot check for existing projects.");
                    // We'll continue and let the create operation handle any conflicts
                    return;
                }

                // For other errors, just return and let the create operation handle them
                return;
            }

            // Try to parse the response as JSON
            let projects;
            try {
                projects = await response.json();
                // Log the raw projects response for debugging
                debugLog("PROJECT", "Raw projects response:", JSON.stringify(projects, null, 2));
            } catch (error: any) {
                // If we can't parse the response as JSON, log the raw response
                const responseText = await response.text();
                debugLog("PROJECT", "Non-JSON response:", responseText);
                return;
            }

            // Check if a project with the same name already exists
            const existingProject = projects.data?.find((p: any) => p.name === inputs.name);

            if (existingProject) {
                debugLog("PROJECT", `Found existing project with name '${inputs.name}' and ID '${existingProject.id}'`);

                // If we're in preview mode, throw an error to indicate that the project already exists
                if (pulumi.runtime.isDryRun()) {
                    throw new Error(
                        `A project with the name '${inputs.name}' already exists with ID '${existingProject.id}'.\n` +
                        `To use this existing project, you have two options:\n` +
                        `1. Change the project name to a unique name that doesn't exist yet.\n` +
                        `2. Import the existing project using: pulumi import openai:index:Project ${inputs.name} ${existingProject.id}`
                    );
                }

                // If we're not in preview mode, we'll let the create method handle the error
                // This allows for better error messages from the OpenAI API
            }
        } catch (error: any) {
            // If the error is from our own check, rethrow it
            if (error.message && error.message.includes("already exists with ID")) {
                throw error;
            }

            // Otherwise, just log it
            debugLog("PROJECT", "Error checking for existing project:", error);
        }
    }

    private mapProjectToOutputs(project: any): any {
        // Ensure we're working with the actual project data
        // The API might return the project in a 'data' field or directly
        const projectData = project.data || project;

        debugLog("PROJECT", "Mapping project to outputs, input:", JSON.stringify(projectData, null, 2));

        // Create outputs that exactly match the OpenAI API structure
        const outputs = {
            id: projectData.id,
            createdAt: projectData.created_at || projectData.createdAt || Math.floor(Date.now() / 1000),
            object: projectData.object || "organization.project",
            name: projectData.name || "",
            description: projectData.description || "",
            metadata: projectData.metadata || {},
            status: projectData.status || "active",
            archivedAt: projectData.archived_at || projectData.archivedAt || null,
            // Include the apiKey if it was provided in the inputs
            apiKey: projectData.apiKey,
        };

        debugLog("PROJECT", "Mapped outputs:", JSON.stringify(outputs, null, 2));

        return outputs;
    }
} 