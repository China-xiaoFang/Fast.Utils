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
	"@fast-china/eslint-config",
	"@rollup/plugin-terser",
	"@vue/tsconfig",
	"eslint",
	"prettier",
	"terser",
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
