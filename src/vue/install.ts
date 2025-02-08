import type { App, Directive, Plugin } from "vue";

export type TSXWithInstall<T> = T & Plugin;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = (): void => {};

export const withInstall = <T, E extends Record<string, any>>(main: T, extra?: E): TSXWithInstall<T> & E => {
	(main as TSXWithInstall<T>).install = (app): void => {
		for (const comp of [main, ...Object.values(extra ?? {})]) {
			app.component(comp.name, comp);
		}
	};

	if (extra) {
		for (const [key, comp] of Object.entries(extra)) {
			(main as any)[key] = comp;
		}
	}
	return main as TSXWithInstall<T> & E;
};

export const withNoopInstall = <T>(component: T): TSXWithInstall<T> => {
	(component as TSXWithInstall<T>).install = NOOP;

	return component as TSXWithInstall<T>;
};

export const withInstallDirective = <T extends Directive>(directive: T, name: string): TSXWithInstall<T> => {
	(directive as TSXWithInstall<T>).install = (app: App): void => {
		app.directive(name, directive);
	};

	return directive as TSXWithInstall<T>;
};
