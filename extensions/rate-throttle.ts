import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Smooth provider requests so they are evenly spaced rather than sent in bursts.
 *
 * The default is 12 requests per minute, or one request every five seconds.
 * Set PI_MAX_RPM to a positive number to override it.
 */
const DEFAULT_MAX_RPM = 12;
const WINDOW_MS = 60_000;

function readMaxRequestsPerMinute(value: string | undefined): number {
	if (value === undefined) return DEFAULT_MAX_RPM;

	const requestsPerMinute = Number(value);
	if (!Number.isFinite(requestsPerMinute) || requestsPerMinute <= 0) {
		throw new Error(
			`PI_MAX_RPM must be a positive number; received ${JSON.stringify(value)}`,
		);
	}

	return requestsPerMinute;
}

const maxRequestsPerMinute = readMaxRequestsPerMinute(process.env.PI_MAX_RPM);
const intervalMs = WINDOW_MS / maxRequestsPerMinute;

let nextSlot = 0;
let queue: Promise<void> = Promise.resolve();

function sleep(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function acquireSlot(): Promise<void> {
	const reservation = queue.then(async () => {
		const now = Date.now();
		const slot = Math.max(now, nextSlot);
		nextSlot = slot + intervalMs;

		const waitMs = slot - now;
		if (waitMs > 0) await sleep(waitMs);
	});

	queue = reservation.then(
		() => undefined,
		() => undefined,
	);

	return reservation;
}

export default function rateThrottle(pi: ExtensionAPI): void {
	pi.on("before_provider_request", async () => {
		await acquireSlot();
	});
}
