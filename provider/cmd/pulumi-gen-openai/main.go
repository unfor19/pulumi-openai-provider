package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/pulumi/pulumi/pkg/v3/codegen/dotnet"
	gogen "github.com/pulumi/pulumi/pkg/v3/codegen/go"
	"github.com/pulumi/pulumi/pkg/v3/codegen/nodejs"
	"github.com/pulumi/pulumi/pkg/v3/codegen/python"
	"github.com/pulumi/pulumi/pkg/v3/codegen/schema"
)

func main() {
	if len(os.Args) < 4 {
		fmt.Printf("Usage: %s <language> <out-dir> <schema-file>\n", os.Args[0])
		os.Exit(1)
	}

	language := os.Args[1]
	outdir := os.Args[2]
	schemaPath := os.Args[3]

	// Read the schema file
	schemaBytes, err := os.ReadFile(schemaPath)
	if err != nil {
		fmt.Printf("Failed to read schema file: %v\n", err)
		os.Exit(1)
	}

	// Parse the schema
	var spec schema.PackageSpec
	if err := json.Unmarshal(schemaBytes, &spec); err != nil {
		fmt.Printf("Failed to parse schema: %v\n", err)
		os.Exit(1)
	}

	// Load the schema
	pkg, err := schema.ImportSpec(spec, nil)
	if err != nil {
		fmt.Printf("Failed to load schema: %v\n", err)
		os.Exit(1)
	}

	// Generate the code based on the language
	var files map[string][]byte
	tool := "Pulumi SDK Generator"
	extraFiles := map[string][]byte{}
	langOptions := map[string]string{}

	switch language {
	case "nodejs":
		langOptions["dependencies"] = `{"openai":"^4.0.0"}`
		langOptions["devDependencies"] = `{"typescript":"^4.6.3"}`
		langOptions["packagejsontemplate"] = `{
			"name": "${PKG}",
			"version": "${VERSION}",
			"type": "module",
			"exports": {
				".": {
					"types": "./index.d.ts",
					"import": "./index.js",
					"require": "./index.js"
				}
			},
			"keywords": [
				"pulumi",
				"openai",
				"ai",
				"assistant",
				"category/ai"
			],
			"scripts": {
				"build": "tsc",
				"postinstall": "node ./scripts/postinstall.js"
			},
			"dependencies": {
				"@pulumi/pulumi": "^3.142.0",
				"openai": "^4.0.0"
			},
			"devDependencies": {
				"@types/node": "^14",
				"typescript": "^4.6.3"
			},
			"pulumi": {
				"resource": true,
				"name": "openai"
			}
		}`
		files, err = nodejs.GeneratePackage(tool, pkg, extraFiles, langOptions, true)
	case "python":
		files, err = python.GeneratePackage(tool, pkg, extraFiles)
	case "go":
		langOptions["generateResourceContainerTypes"] = "true"
		langOptions["importBasePath"] = "github.com/pulumi/pulumi-openai/sdk/go/openai"
		files, err = gogen.GeneratePackage(tool, pkg, langOptions)
	case "dotnet":
		langOptions["packageReferences"] = `{"Pulumi":"3.*"}`
		files, err = dotnet.GeneratePackage(tool, pkg, extraFiles, langOptions)
	default:
		fmt.Printf("Unsupported language: %s\n", language)
		os.Exit(1)
	}

	if err != nil {
		fmt.Printf("Failed to generate code: %v\n", err)
		os.Exit(1)
	}

	// Write the files
	for f, contents := range files {
		if err := emitFile(outdir, f, contents); err != nil {
			fmt.Printf("Failed to write file %s: %v\n", f, err)
			os.Exit(1)
		}
	}
}

func emitFile(rootDir, filename string, contents []byte) error {
	outPath := filepath.Join(rootDir, filename)
	if err := os.MkdirAll(filepath.Dir(outPath), 0755); err != nil {
		return err
	}
	return os.WriteFile(outPath, contents, 0600)
} 