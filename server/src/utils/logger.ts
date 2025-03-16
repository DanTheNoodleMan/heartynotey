// server/src/utils/logger.ts
const logLevels = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	DEBUG: 3,
};

// Get log level from environment or default to INFO
const currentLogLevel = process.env.LOG_LEVEL
	? logLevels[process.env.LOG_LEVEL as keyof typeof logLevels] || logLevels.INFO
	: logLevels.INFO;

export const logger = {
	error: (message: string, ...args: any[]) => {
		if (currentLogLevel >= logLevels.ERROR) {
			console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
		}
	},

	warn: (message: string, ...args: any[]) => {
		if (currentLogLevel >= logLevels.WARN) {
			console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
		}
	},

	info: (message: string, ...args: any[]) => {
		if (currentLogLevel >= logLevels.INFO) {
			console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
		}
	},

	debug: (message: string, ...args: any[]) => {
		if (currentLogLevel >= logLevels.DEBUG) {
			console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
		}
	},
};
