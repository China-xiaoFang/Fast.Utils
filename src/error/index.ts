export class FastError extends Error {
	constructor(m: string) {
		super(m);
		this.name = "FastError";
	}
}
