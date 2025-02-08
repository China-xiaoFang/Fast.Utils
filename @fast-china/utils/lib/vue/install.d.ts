import { Directive, Plugin } from 'vue';
export type TSXWithInstall<T> = T & Plugin;
export declare const withInstall: <T, E extends Record<string, any>>(main: T, extra?: E) => TSXWithInstall<T> & E;
export declare const withNoopInstall: <T>(component: T) => TSXWithInstall<T>;
export declare const withInstallDirective: <T extends Directive>(directive: T, name: string) => TSXWithInstall<T>;
