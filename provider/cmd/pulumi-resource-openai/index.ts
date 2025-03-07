import { Provider } from "./provider";
import { Assistant } from "./assistantResource";

// Initialize the provider with the configuration
const provider = new Provider();

// Export the provider and resources
export = {
    ...provider,
    Assistant,
    __provider: provider,
    construct: (args: any) => {
        if (args?.construct) {
            return provider.construct(args.name, args.type, args.inputs, args.options);
        } else if (args?.diff) {
            return provider.diff(args.id, args.urn, args.olds, args.news);
        } else if (args?.create) {
            return provider.create(args.urn, args.inputs);
        } else if (args?.update) {
            return provider.update(args.id, args.urn, args.olds, args.news);
        } else if (args?.delete) {
            return provider.delete(args.id, args.urn);
        } else if (args?.read) {
            return provider.read(args.id, args.urn);
        } else if (args?.check) {
            return provider.check(args.urn, args.olds, args.news);
        }
        throw new Error("Unknown method");
    }
}; 