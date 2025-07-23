/**
 * 构建预依赖的包
 */
const peerDependencies = {
	vue: "Vue",
};

/**
 * 构建全局包
 */
const globalDependenciesMapping = {
	"crypto-js": "CryptoJS",
	lodash: "_",
	"lodash-es": "_",
	"lodash-unified": "_",
};

export { peerDependencies, globalDependenciesMapping };
