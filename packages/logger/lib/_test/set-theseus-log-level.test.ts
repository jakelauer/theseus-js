import {
	expect, afterEach, describe, it, vi,
} from "vitest";
import { setTheseusLogLevel } from "../set-theseus-log-level.js";
import type { logLevels } from "../log-levels.js";

describe("Set Theseus Log Level", function () 
{
	afterEach(function () 
	{
		// Restore all mocks
		vi.restoreAllMocks();
	});

	it("should not throw an error for an unrecognized log level", function () 
	{
		const invalidLevel = "notALogLevel";
		expect(() => setTheseusLogLevel(invalidLevel as keyof typeof logLevels)).not.to.throw();
		// Since the invalid level is not set, the last valid level should remain
		// This assertion depends on the behavior of the logger when an invalid level is set
		// Adjust the expected outcome based on your logger's behavior
	});
});
