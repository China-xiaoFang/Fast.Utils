/**
 * 构建预依赖的包
 */
const peerDependencies = {
	vue: "Vue",
};

/**
 * 构建删除包
 */
const removedDevDependencies = [
	"@rollup/plugin-terser",
	"@typescript-eslint/eslint-plugin",
	"@typescript-eslint/parser",
	"@vue/tsconfig",
	"eslint",
	"eslint-config-prettier",
	"eslint-define-config",
	"eslint-plugin-import",
	"eslint-plugin-prettier",
	"eslint-plugin-vue",
	"prettier",
	"terser",
	"tsx",
	"typescript",
	"vite",
	"vite-plugin-dts",
	"vue-tsc",
];

/**
 * 构建全局包
 */
const globalDependenciesMapping = {
	"crypto-js": "CryptoJS",
	lodash: "_",
	"lodash-es": "_",
	"lodash-unified": "_",
};

export { peerDependencies, removedDevDependencies, globalDependenciesMapping };
