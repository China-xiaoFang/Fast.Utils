import { defineConfig } from "tsdown";

export default defineConfig([
	{
		// 将每个源码模块作为入口，保留可被消费端独立裁剪的模块边界。
		entry: ["src/**/*.ts"],
		// 将全部发布文件写入仓库根目录的唯一 dist 目录。
		outDir: "dist",
		// 以 src 为构建根，统一解析入口及其内部模块。
		root: "src",
		// 仅输出未压缩 ESM，与 package.json 的 module 类型和 exports.import 保持一致。
		format: "esm",
		// 工具库面向浏览器、WebView 和 uni-app，不注入 Node.js 或浏览器垫片。
		platform: "neutral",
		// 以声明的最低应用运行时语法 ES2022 为转换目标。
		target: "es2022",
		// 固定生成 .mjs 和 .d.mts，与 package.json exports 的公开路径保持一致。
		fixedExtension: true,
		// 按入口分别打包，使 crypto-js 内联到 crypto 模块而不污染其他模块。
		unbundle: false,
		// 公共 API 只有根入口，类型声明也只从根入口生成。
		dts: { entry: ["src/index.ts"] },
		// 生成内嵌源码的 JavaScript Source Map，无需把 src 目录发布到 npm。
		sourcemap: true,
		// 每次构建前由 ESM 配置清空完整 dist，避免入口删除或重命名后残留陈旧产物。
		clean: true,
		// 移除未被公共入口引用的内部代码，减小发布产物体积。
		treeshake: true,
		// 控制依赖在 JavaScript 和声明构建中的内联与外部化行为。
		deps: {
			// 内联 crypto-js，避免 uni-app 等严格 ESM 工具链解析其 CommonJS 子路径。
			alwaysBundle: [/^crypto-js(?:\/|$)/],
			// Vue 是公共 Peer，继续由消费项目提供。
			neverBundle: ["vue"],
			// 除 crypto-js 外不额外内联第三方依赖。
			onlyBundle: [/^crypto-js(?:\/|$)/],
			// 声明生成不内联 Vue 类型，避免复制第三方声明并固定其具体版本。
			dts: { neverBundle: ["vue"] },
		},
		// 将构建警告视为失败，防止带有潜在问题的产物进入发布流程。
		failOnWarn: true,
	},
	{
		// CDN 与包管理器构建共用完整根入口，生成单独的压缩 IIFE 文件。
		entry: { "index.global.min": "src/index.ts" },
		// 与 ESM 产物写入同一个发布目录。
		outDir: "dist",
		// 输出可通过普通 script 标签加载的 IIFE。
		format: "iife",
		// 按浏览器运行时处理全局变量和依赖。
		platform: "browser",
		// 与 ESM 产物保持相同的 ES2022 语法基线。
		target: "es2022",
		// CDN 文件名由 outputOptions 明确控制，不使用 .mjs 固定扩展名。
		fixedExtension: false,
		// 类型声明已由 ESM 配置生成，IIFE 不重复输出。
		dts: false,
		// IIFE 是 CDN 直接分发文件，单独执行压缩。
		minify: true,
		// script 标签加载后通过 globalThis.FastUtils 访问公共 API。
		globalName: "FastUtils",
		// 固定 CDN 文件名，并把必需的 Vue Peer 映射到全局 Vue。
		outputOptions: {
			entryFileNames: "index.global.min.js",
			globals: { vue: "Vue" },
		},
		// 生成内嵌源码的 JavaScript Source Map，便于定位 CDN 运行时错误。
		sourcemap: true,
		// dist 已由 ESM 配置清理，避免第二个配置删除刚生成的产物。
		clean: false,
		// 移除根入口未引用的内部代码，减小 CDN 文件体积。
		treeshake: true,
		// CDN 内联 crypto-js 以便浏览器直接使用，Vue 仍由页面提供。
		deps: {
			alwaysBundle: [/^crypto-js(?:\/|$)/],
			neverBundle: ["vue"],
			onlyBundle: [/^crypto-js(?:\/|$)/],
		},
		// 将构建警告视为失败，防止带有潜在问题的产物进入发布流程。
		failOnWarn: true,
	},
]);
