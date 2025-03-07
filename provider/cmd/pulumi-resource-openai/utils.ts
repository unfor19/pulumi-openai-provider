/**
 * Utility functions for the OpenAI provider
 */
import * as pulumi from "@pulumi/pulumi";

/**
 * Check if debug mode is enabled via environment variable
 * @returns true if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
    const debugEnv = process.env.PULUMI_OPENAI_PROVIDER_DEBUG || process.env.PULUMI_OPENAI_DEBUG;
    return debugEnv === "1" || debugEnv === "true";
};

/**
 * Log a debug message if debug mode is enabled
 * @param component The component that is logging (e.g., "DIFF", "CREATE", etc.)
 * @param message The message to log
 * @param args Additional arguments to log
 */
export const debugLog = (component: string, message: string, ...args: any[]): void => {
    if (isDebugMode()) {
        // Format the message and arguments
        let logMessage = `[${component}] - ${message}`;
        
        // Use pulumi.log.debug which is designed to work with the Pulumi engine
        // Debug logs are hidden by default and only shown with the -v flag
        try {
            if (args.length > 0) {
                // For objects, we need to stringify them for better readability
                const formattedArgs = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
                );
                pulumi.log.debug(`${logMessage} ${formattedArgs.join(' ')}`);
                
                // Also log to stderr for better visibility
                console.error(`DEBUG: ${logMessage}`, ...args);
            } else {
                pulumi.log.debug(logMessage);
                
                // Also log to stderr for better visibility
                console.error(`DEBUG: ${logMessage}`);
            }
        } catch (e) {
            // If pulumi.log.debug fails, we don't want to break the provider
            // This should never happen in normal operation
            console.error("Failed to log debug message:", e);
        }
    }
}; 