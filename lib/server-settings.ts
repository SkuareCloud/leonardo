import { logger } from "./logger"

export type OperatorSettings = {
    operatorSlot: number
    maxSlots: number
}

// Use a global variable to persist across hot reloads in Next.js
declare global {
    var __serverSettings: ServerSettings | undefined
}

export class ServerSettings {
    private operatorSettings: OperatorSettings
    private instanceId: string

    private constructor() {
        this.instanceId = Math.random().toString(36).substr(2, 9)
        logger.info("Creating new ServerSettings instance with ID:", this.instanceId)
        this.operatorSettings = {
            operatorSlot: 1,
            maxSlots: 1,
        }
    }

    public static getInstance(): ServerSettings {
        // In development, use global variable to persist across hot reloads
        if (process.env.NODE_ENV === "development") {
            if (!global.__serverSettings) {
                logger.info("Initializing ServerSettings singleton (development)")
                global.__serverSettings = new ServerSettings()
            }
            return global.__serverSettings
        }

        // In production, use static instance
        if (!ServerSettings.instance) {
            logger.info("Initializing ServerSettings singleton (production)")
            ServerSettings.instance = new ServerSettings()
        }
        return ServerSettings.instance
    }

    public getOperatorSettings(): OperatorSettings {
        logger.info(
            "Getting operator settings from instance",
            this.instanceId + ":",
            this.operatorSettings,
        )
        return this.operatorSettings
    }

    public setOperatorSettings(settings: OperatorSettings): void {
        logger.info(
            "Setting operator settings in instance",
            this.instanceId + " from:",
            this.operatorSettings,
            "to:",
            settings,
        )
        this.operatorSettings = { ...this.operatorSettings, ...settings }
    }

    public getInstanceId(): string {
        return this.instanceId
    }

    // Static method to reset the singleton (for testing)
    public static reset(): void {
        if (process.env.NODE_ENV === "development") {
            global.__serverSettings = undefined
        } else {
            ServerSettings.instance = undefined
        }
        logger.info("ServerSettings singleton reset")
    }

    // Static instance for production
    private static instance: ServerSettings | undefined
}
