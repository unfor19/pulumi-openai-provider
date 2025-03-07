#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node generate-sdk-readme.js <language> <output-path>');
  process.exit(1);
}

const language = args[0].toLowerCase();
const outputPath = args[1];

// Read the main README.md
const mainReadmePath = path.join(process.cwd(), 'README.md');
let mainReadme = fs.readFileSync(mainReadmePath, 'utf8');

// Language-specific examples
const examples = {
  nodejs: `
\`\`\`typescript
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
\`\`\`
`,
  python: `
\`\`\`python
import pulumi
import pulumi_openai as openai

# Create an OpenAI Assistant
assistant = openai.Assistant("my-assistant",
    name="My Helpful Assistant",
    instructions="You are a helpful assistant that provides concise answers.",
    model="gpt-4",
    tools=[{"type": "code_interpreter"}]
)

# Export the assistant ID
pulumi.export("assistant_id", assistant.id)
\`\`\`
`,
  go: `
\`\`\`go
package main

import (
	"github.com/pulumi/pulumi-openai/sdk/go/openai"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create an OpenAI Assistant
		assistant, err := openai.NewAssistant(ctx, "my-assistant", &openai.AssistantArgs{
			Name:         pulumi.String("My Helpful Assistant"),
			Instructions: pulumi.String("You are a helpful assistant that provides concise answers."),
			Model:        pulumi.String("gpt-4"),
			Tools: pulumi.MapArray{
				pulumi.StringMap{
					"type": pulumi.String("code_interpreter"),
				},
			},
		})
		if err != nil {
			return err
		}

		// Export the assistant ID
		ctx.Export("assistantId", assistant.ID())
		return nil
	})
}
\`\`\`
`,
  dotnet: `
\`\`\`csharp
using Pulumi;
using Pulumi.Openai;

class MyStack : Stack
{
    public MyStack()
    {
        // Create an OpenAI Assistant
        var assistant = new Assistant("my-assistant", new AssistantArgs
        {
            Name = "My Helpful Assistant",
            Instructions = "You are a helpful assistant that provides concise answers.",
            Model = "gpt-4",
            Tools = new[]
            {
                new Dictionary<string, object>
                {
                    { "type", "code_interpreter" }
                }
            }
        });

        // Export the assistant ID
        this.AssistantId = assistant.Id;
    }

    [Output]
    public Output<string> AssistantId { get; set; }
}
\`\`\`
`
};

// Add language-specific title to the README
const languageTitles = {
  nodejs: '# Pulumi OpenAI Provider - Node.js SDK',
  python: '# Pulumi OpenAI Provider - Python SDK',
  go: '# Pulumi OpenAI Provider - Go SDK',
  dotnet: '# Pulumi OpenAI Provider - .NET SDK'
};

// Try to find the example section using regex to be more robust
const exampleRegex = /## Example Usage[\s\S]*?(?=## )/;
const match = mainReadme.match(exampleRegex);

if (match) {
  // Get everything up to the example section
  const beforeExample = mainReadme.substring(0, match.index + '## Example Usage'.length);
  
  // Get everything after the example section
  const afterExampleStart = match.index + match[0].length;
  const afterExample = mainReadme.substring(afterExampleStart);
  
  // Get the language-specific example
  const example = examples[language] || examples.nodejs; // Default to Node.js if language not found
  
  // Replace the title with a language-specific one
  let newReadme = beforeExample + '\n\n' + example + '\n' + afterExample;
  const titleRegex = /# Pulumi OpenAI Provider/;
  const languageTitle = languageTitles[language] || languageTitles.nodejs;
  newReadme = newReadme.replace(titleRegex, languageTitle);
  
  // Write the new README to the output path
  fs.writeFileSync(outputPath, newReadme);
  console.log(`Generated ${language} README at ${outputPath}`);
} else {
  console.error('Could not find example section in README.md, using regex approach');
  
  // Try a different approach - just insert our example after the first heading
  const lines = mainReadme.split('\n');
  let inExampleSection = false;
  let newLines = [];
  
  // Replace the title with a language-specific one
  const languageTitle = languageTitles[language] || languageTitles.nodejs;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Replace the title
    if (i === 0 && line.startsWith('# Pulumi OpenAI Provider')) {
      newLines.push(languageTitle);
      continue;
    }
    
    // Skip the existing example section
    if (line.trim() === '## Example Usage') {
      inExampleSection = true;
      newLines.push(line);
      newLines.push('');
      newLines.push(examples[language] || examples.nodejs);
      continue;
    }
    
    // Skip lines in the example section until we hit the next section
    if (inExampleSection) {
      if (line.startsWith('## ')) {
        inExampleSection = false;
        newLines.push(line);
      }
      // Skip the line if we're still in the example section
      continue;
    }
    
    // Add all other lines
    newLines.push(line);
  }
  
  // Write the new README to the output path
  fs.writeFileSync(outputPath, newLines.join('\n'));
  console.log(`Generated ${language} README at ${outputPath} using line-by-line approach`);
} 