import * as winston from "winston";

import { DEFAULT_LOG_LEVEL, logLevels, setTheseusLogLevel } from "@Shared/Log/set-theseus-log-level";
import { stringifier } from "@Shared/Log/stringifier";

const { format, addColors } = winston;
const { combine, colorize, timestamp, printf, errors, splat, prettyPrint, json } = format;

const skipToJsonLogs = format((info) => 
{
	if (info.message.includes("toSJ"))
	{
		return false;
	}
	
	return info;
});

export const theseusLogFormat = () =>
	combine(
		errors({ stack: true }),
		colorize({ all: true }),
		splat(),
		json({ space: 2, circularValue: undefined }),
		prettyPrint(),
		timestamp({ format: "HH:MM:SS:ss.sss" }),
		skipToJsonLogs(),
		printf((info) => 
		{
			const { label, level, timestamp, message, ...args } = info;
			const argsAsString = stringifier(args)
				.split("\n")
				.map((line) => `|  ${line}`)
				.join("\n");
			const rest = Object.keys(args).length ? `\n${argsAsString}` : "";
			return `${timestamp} ${level} :: ${message} ⸨${label}⸩${rest}`;
		}),
	);

addColors({
	info: "gray", // fontStyle color
	major: "bold white",
	warn: "italic yellow",
	error: "bold red",
	debug: "blue",
	silly: "magenta",
});

export const allTransports: winston.transports.ConsoleTransportInstance[] = [];

const makeTransport = () => 
{
	const transport = new winston.transports.Console();
	transport.level = DEFAULT_LOG_LEVEL;

	allTransports.push(transport);

	setTheseusLogLevel();

	return transport;
};

const devMode = process.env.NODE_ENV === "development";
export default () => ({
	config: {
		levels: logLevels,
		format: theseusLogFormat(),
		exitOnError: false,
		transports: [makeTransport()],
		level: devMode ? "info" : "major",
	} as winston.LoggerOptions,
});
