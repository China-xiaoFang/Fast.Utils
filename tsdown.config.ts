import { defineConfig } from "tsdown";

export default defineConfig({
	// 只构建 package.json exports 承诺的唯一根入口。
	entry: { index: "src/index.ts" },
	// 将全部发布文件写入仓库根目录的唯一 dist 目录。
	outDir: "dist",
	// 以 src 为构建根，保持 dist/<module>/index.mjs 与源码目录结构一致。
	root: "src",
	// 仅输出 ESM，与 package.json 的 type、module 和 exports.import 保持一致。
	format: "esm",
	// 工具库面向浏览器、WebView 和 uni-app，不注入 Node.js 或浏览器垫片。
	platform: "neutral",
	// 以声明的最低应用运行时语法 ES2022 为转换目标。
	target: "es2022",
	// 固定生成 .mjs 和 .d.mts，与 package.json exports 的公开路径保持一致。
	fixedExtension: true,
	// 保留每个源码模块的独立产物，使精确子路径和 Source Map 可直接定位。
	unbundle: true,
	// 生成声明及声明映射，编辑器可跳转到带完整 TSDoc 的源码定义。
	dts: { sourcemap: true },
	// 生成 JavaScript Source Map，支持异常定位到随包发布的 TypeScript 源码。
	sourcemap: true,
	// 每次构建前清空完整 dist，避免入口删除或重命名后残留陈旧产物。
	clean: true,
	// 移除未被公共入口引用的内部代码，降低消费端基础体积。
	treeshake: true,
	// 控制运行时代码和声明生成时的依赖外部化边界。
	deps: {
		// crypto-js 是 Runtime Dependency，Vue 是 Optional Peer Dependency，均由消费项目解析。
		neverBundle: ["crypto-js", "vue"],
		// 声明文件不复制 Vue 类型，避免固定具体 Vue 版本并扩大包体积。
		dts: { neverBundle: ["vue"] },
	},
	// 将构建警告视为失败，防止带有潜在问题的产物进入发布流程。
	failOnWarn: true,
});
