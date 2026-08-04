import eslintJs from "@eslint/js";
import eslintMarkdown from "@eslint/markdown";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigFlatGitignore from "eslint-config-flat-gitignore";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginImportX from "eslint-plugin-import-x";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginRegexp from "eslint-plugin-regexp";
import globals from "globals";
import tseslint from "typescript-eslint";

// 统一维护 JavaScript/TypeScript 文件匹配，避免各配置段的扩展名范围逐渐漂移。
const codeFiles = ["**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}"];
const typeScriptFiles = ["**/*.{cts,mts,ts,tsx}"];

export default defineConfig(
	// 忽略依赖、构建产物、缓存、锁文件和压缩文件；源码、测试与文档仍参与检查。
	globalIgnores(
		[
			"**/node_modules/**",
			"**/{build,coverage,dist,output,temp,tmp}/**",
			"**/{.cache,.output,.pnpm-store,.vite,.vitest}/**",
			"**/__snapshots__/**",
			"**/*.min.*",
			"**/*.map",
			"**/{bun,deno,yarn}.lock",
			"**/package-lock.json",
			"**/pnpm-lock.yaml",
		],
		"fast-utils/ignores"
	),
	// 读取仓库根目录的 .gitignore，避免 ESLint 检查未纳入版本控制的本地文件。
	{
		name: "fast-utils/gitignore",
		...eslintConfigFlatGitignore({ strict: false }),
	},
	// 跨 JavaScript 与 TypeScript 生效的基础正确性和可维护性规则。
	{
		name: "fast-utils/common",
		files: codeFiles,
		linterOptions: {
			// 无效 eslint-disable 通常表示规则已变化，应及时删除过期抑制注释。
			reportUnusedDisableDirectives: "error",
		},
		rules: {
			// 数组回调必须在所有可到达分支返回值，避免静默产生 undefined。
			"array-callback-return": "error",
			// 要求严格相等，但保留 value == null 同时判断 null/undefined 的常用写法。
			eqeqeq: ["error", "always", { null: "ignore" }],
			// 浏览器弹窗不适合作为库行为；警告级别允许开发阶段及时发现。
			"no-alert": "warn",
			// case 不创建词法作用域，声明必须用花括号隔离。
			"no-case-declarations": "error",
			// 禁止反斜杠续行字符串，优先使用模板字符串。
			"no-multi-str": "error",
			// 允许 void promise 明确忽略 Promise，其他表达式不使用 void。
			"no-void": ["error", { allowAsStatement: true }],
			// with 在严格模式和 ESM 中不可用，并会破坏标识符解析。
			"no-with": "error",
			// 幂运算统一使用 **，避免 Math.pow 嵌套。
			"prefer-exponentiation-operator": "error",
			// 使用 Object.hasOwn，避免对象覆盖或缺少 hasOwnProperty。
			"prefer-object-has-own": "error",
			// 声明排序交给 import-x；这里只排序同一 import 的成员。
			"sort-imports": [
				"warn",
				{
					allowSeparatedGroups: false,
					ignoreCase: false,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
				},
			],
		},
	},
	// @eslint/js 提供 JavaScript 基础正确性规则，本段补充现代 ESM 代码风格。
	{
		name: "fast-utils/javascript",
		files: ["**/*.{cjs,js,jsx,mjs}"],
		extends: [eslintJs.configs.recommended],
		languageOptions: {
			ecmaVersion: "latest",
			globals: globals.node,
			parserOptions: { ecmaFeatures: { jsx: true } },
			sourceType: "module",
		},
		rules: {
			// 复合逻辑赋值减少重复求值；涉及 Getter/Proxy 时需人工复核。
			"logical-assignment-operators": ["error", "always", { enforceForIfStatements: true }],
			// 库代码只允许必要的 warn/error，普通日志必须走 Logger API。
			"no-console": ["warn", { allow: ["error", "warn"] }],
			// 允许带明确退出条件的 while (true)，其他恒定条件视为错误。
			"no-constant-condition": ["error", { checkLoops: false }],
			// 防止调试断点进入发布代码。
			"no-debugger": "error",
			// 空块必须说明意图；空 catch 仅在明确忽略可恢复错误时允许。
			"no-empty": ["error", { allowEmptyCatch: true }],
			// 拒绝肉眼难以识别、可能造成解析差异的非常规空白。
			"no-irregular-whitespace": "error",
			// 禁止同一作用域重复声明。
			"no-redeclare": "error",
			// 标签语句使控制流难以维护，不在库源码中使用。
			"no-restricted-syntax": ["error", "LabeledStatement"],
			// 变量和类先声明后使用，函数声明仍允许提升。
			"no-use-before-define": ["warn", { classes: true, functions: false, variables: true }],
			// 使用 let/const 代替 var，避免函数作用域与提升陷阱。
			"no-var": "error",
			// 属性和值同名时使用对象简写。
			"object-shorthand": ["error", "always", { avoidQuotes: true, ignoreConstructors: false }],
			// 回调优先箭头函数，同时保留需要动态 this 的合法场景。
			"prefer-arrow-callback": ["error", { allowNamedFunctions: false, allowUnboundThis: true }],
			// 不再重新赋值的绑定优先 const。
			"prefer-const": ["warn", { destructuring: "all", ignoreReadBeforeAssign: true }],
			// 合并对象优先展开语法，避免额外目标对象模板。
			"prefer-object-spread": "error",
			// 可变参数、可迭代参数和字符串插值使用现代语法。
			"prefer-rest-params": "error",
			"prefer-spread": "error",
			"prefer-template": "error",
		},
	},
	// TypeScript 使用类型感知的 strict 与 stylistic 预设，公共库错误尽量在发布前暴露。
	{
		name: "fast-utils/typescript",
		files: typeScriptFiles,
		extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
		languageOptions: {
			ecmaVersion: "latest",
			parserOptions: {
				// Project Service 自动选择根 tsconfig 与 tests/tsconfig，避免维护 ESLint 专用配置副本。
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
			sourceType: "module",
		},
		rules: {
			// 类型导出必须明确，避免运行时导出和仅类型导出混淆。
			"@typescript-eslint/consistent-type-exports": "error",
			// 类型依赖使用内联 type import，既保留副作用 import 语义，也便于自动修复。
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{ disallowTypeAnnotations: false, fixStyle: "inline-type-imports", prefer: "type-imports" },
			],
			// 公共函数和模块边界必须写明返回类型，保证 isolatedDeclarations 稳定生成声明。
			"@typescript-eslint/explicit-function-return-type": "error",
			"@typescript-eslint/explicit-module-boundary-types": "error",
			// 已弃用 API 在源码阶段直接拒绝，避免发布后继续扩大兼容负担。
			"@typescript-eslint/no-deprecated": "error",
			// any 会绕过类型检查，但第三方边界可能需要，因此保留警告而非关闭。
			"@typescript-eslint/no-explicit-any": "warn",
			// 删除 TypeScript 能明确推断的原始类型标注。
			"@typescript-eslint/no-inferrable-types": "error",
			// 声明文件和框架扩展仍可能需要 namespace。
			"@typescript-eslint/no-namespace": "off",
			// 非空断言可能隐藏边界缺陷，先以警告提示逐步消除。
			"@typescript-eslint/no-non-null-assertion": "warn",
			// 可选链之后的非空断言逻辑矛盾，直接视为错误。
			"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
			// 使用 TypeScript 版本避免核心规则误判声明合并和类型/值同名。
			"@typescript-eslint/no-redeclare": "error",
			// 项目采用纯 ESM，不允许 require 导入。
			"@typescript-eslint/no-require-imports": "error",
			// 某些公共泛型用于约束和推断，即使只出现一次也有契约价值。
			"@typescript-eslint/no-unnecessary-type-parameters": "off",
			// 允许常见短路和三元表达式调用模式。
			"@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
			// 下划线开头表示参数或变量被有意忽略，其余未使用符号均报错。
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					args: "after-used",
					argsIgnorePattern: "^_",
					caughtErrors: "all",
					caughtErrorsIgnorePattern: "^_",
					ignoreRestSiblings: true,
					varsIgnorePattern: "^_",
				},
			],
			// 模板表达式默认只允许字符串；数字是常见且语义明确的例外。
			"@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
			// 联合类型 switch 必须穷尽，新增分支不能静默落入默认行为。
			"@typescript-eslint/switch-exhaustiveness-check": "error",
		},
	},
	// 应用源码使用浏览器与 Web Platform 全局变量，但不因此支持 Node.js Runtime。
	{
		name: "fast-utils/browser-runtime",
		files: ["src/**/*.{ts,tsx}"],
		languageOptions: { globals: globals.browser },
	},
	// 构建配置和测试由 Node.js 执行；测试额外模拟浏览器 API，因此合并两类全局变量。
	{
		name: "fast-utils/node-tooling",
		files: ["tests/**/*.{ts,tsx}", "*.config.{cts,mts,ts}"],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	// import-x 负责模块导入正确性、分组和排序；项目别名解析交给 TypeScript。
	{
		name: "fast-utils/imports",
		files: codeFiles,
		extends: [eslintPluginImportX.flatConfigs.recommended],
		rules: {
			// 未配置专用 Resolver 时，导出分析容易误报，相关规则由类型检查替代。
			"import-x/default": "off",
			// 所有 import 必须位于执行语句之前。
			"import-x/first": "error",
			"import-x/named": "off",
			"import-x/namespace": "off",
			"import-x/no-duplicates": "error",
			"import-x/no-named-as-default": "off",
			"import-x/no-named-as-default-member": "off",
			"import-x/no-unresolved": "off",
			// 按来源分组并按字母排序；副作用 import 的移动必须人工确认执行顺序。
			"import-x/order": [
				"error",
				{
					alphabetize: { caseInsensitive: true, order: "asc" },
					groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type", "unknown"],
					"newlines-between": "always",
					warnOnUnassignedImports: true,
				},
			],
		},
	},
	// 检查无效、冗余或容易产生回溯问题的正则表达式。
	{
		...eslintPluginRegexp.configs["flat/recommended"],
		name: "fast-utils/regexp",
		files: codeFiles,
	},
	// 严格 JSON 使用 jsonc 官方推荐规则。
	{
		name: "fast-utils/json",
		files: ["**/*.json"],
		extends: [eslintPluginJsonc.configs["flat/recommended-with-json"]],
	},
	// tsconfig 与 VS Code 设置实际使用 JSONC，应应用带注释语法的推荐规则。
	{
		name: "fast-utils/jsonc",
		files: ["**/*.jsonc", "**/tsconfig.json", "**/tsconfig.*.json", "**/.vscode/settings.json"],
		extends: [eslintPluginJsonc.configs["flat/recommended-with-jsonc"]],
	},
	// VS Code settings.json 允许注释解释不直观的编辑器配置。
	{
		name: "fast-utils/vscode-jsonc",
		files: ["**/.vscode/settings.json"],
		rules: {
			"jsonc/no-comments": "off",
		},
	},
	// package.json 只排序不会改变解析语义的字段，避免触碰 exports 条件顺序。
	{
		name: "fast-utils/package-json",
		files: ["**/package.json"],
		rules: {
			// npm files 白名单按字母排序，数组顺序不会改变打包集合。
			"jsonc/sort-array-values": ["error", { order: { type: "asc" }, pathPattern: "^files$" }],
			// 根字段使用统一阅读顺序，依赖映射按包名排序。
			"jsonc/sort-keys": [
				"error",
				{
					order: [
						"name",
						"version",
						"private",
						"packageManager",
						"description",
						"type",
						"keywords",
						"license",
						"homepage",
						"bugs",
						"repository",
						"author",
						"contributors",
						"funding",
						"files",
						"main",
						"module",
						"types",
						"exports",
						"typesVersions",
						"sideEffects",
						"unpkg",
						"jsdelivr",
						"browser",
						"bin",
						"man",
						"directories",
						"publishConfig",
						"scripts",
						"peerDependencies",
						"peerDependenciesMeta",
						"optionalDependencies",
						"dependencies",
						"devDependencies",
						"engines",
						"config",
						"overrides",
						"pnpm",
					],
					pathPattern: "^$",
				},
				{ order: { type: "asc" }, pathPattern: "^(?:dev|peer|optional|bundled)?[Dd]ependencies(Meta)?$" },
			],
		},
	},
	// tsconfig 保留说明注释，仅约束顶层结构，不自动改写编译器选项值。
	{
		name: "fast-utils/tsconfig",
		files: ["**/tsconfig.json", "**/tsconfig.*.json"],
		rules: {
			// TypeScript 配置中的注释用于说明编译取舍，必须保留。
			"jsonc/no-comments": "off",
			// [高影响][可自动修复] 只调整顶层和 compilerOptions 的键顺序，不改写选项值或数组。
			"jsonc/sort-keys": [
				"error",
				// 顶层按继承、选项、项目引用和文件范围的阅读顺序排列。
				{
					order: ["extends", "compilerOptions", "references", "files", "include", "exclude"],
					pathPattern: "^$",
				},
				// compilerOptions 的顺序跟随 TypeScript 文档主题，便于检索和代码审查。
				{
					order: [
						/* Projects */
						"incremental",
						"composite",
						"tsBuildInfoFile",
						"disableSourceOfProjectReferenceRedirect",
						"disableSolutionSearching",
						"disableReferencedProjectLoad",
						/* Language and Environment */
						"target",
						"jsx",
						"jsxFactory",
						"jsxFragmentFactory",
						"jsxImportSource",
						"lib",
						"moduleDetection",
						"noLib",
						"reactNamespace",
						"useDefineForClassFields",
						"emitDecoratorMetadata",
						"experimentalDecorators",
						/* Modules */
						"baseUrl",
						"rootDir",
						"rootDirs",
						"customConditions",
						"module",
						"moduleResolution",
						"moduleSuffixes",
						"noResolve",
						"paths",
						"resolveJsonModule",
						"resolvePackageJsonExports",
						"resolvePackageJsonImports",
						"typeRoots",
						"types",
						"allowArbitraryExtensions",
						"allowImportingTsExtensions",
						"allowUmdGlobalAccess",
						/* JavaScript Support */
						"allowJs",
						"checkJs",
						"maxNodeModuleJsDepth",
						/* Type Checking */
						"strict",
						"strictBindCallApply",
						"strictFunctionTypes",
						"strictNullChecks",
						"strictPropertyInitialization",
						"allowUnreachableCode",
						"allowUnusedLabels",
						"alwaysStrict",
						"exactOptionalPropertyTypes",
						"noFallthroughCasesInSwitch",
						"noImplicitAny",
						"noImplicitOverride",
						"noImplicitReturns",
						"noImplicitThis",
						"noPropertyAccessFromIndexSignature",
						"noUncheckedIndexedAccess",
						"noUncheckedSideEffectImports",
						"noUnusedLocals",
						"noUnusedParameters",
						"useUnknownInCatchVariables",
						/* Emit */
						"declaration",
						"declarationDir",
						"declarationMap",
						"downlevelIteration",
						"emitBOM",
						"emitDeclarationOnly",
						"importHelpers",
						"importsNotUsedAsValues",
						"inlineSourceMap",
						"inlineSources",
						"isolatedDeclarations",
						"mapRoot",
						"newLine",
						"noEmit",
						"noEmitHelpers",
						"noEmitOnError",
						"outDir",
						"outFile",
						"preserveConstEnums",
						"preserveValueImports",
						"removeComments",
						"sourceMap",
						"sourceRoot",
						"stripInternal",
						/* Interop Constraints */
						"allowSyntheticDefaultImports",
						"esModuleInterop",
						"forceConsistentCasingInFileNames",
						"isolatedModules",
						"preserveSymlinks",
						"verbatimModuleSyntax",
						/* Completeness */
						"skipDefaultLibCheck",
						"skipLibCheck",
					],
					pathPattern: "^compilerOptions$",
				},
			],
		},
	},
	// Markdown 使用官方推荐规则，保证 README 与开发文档结构可被工具解析。
	{
		name: "fast-utils/markdown",
		files: ["**/*.md"],
		extends: [eslintMarkdown.configs.recommended],
	},
	// 该 API 明确允许保持任意 Promise 拒绝原因，不能强制包裹为 Error。
	{
		name: "fast-utils/async-rejection-identity",
		files: ["src/async/index.ts"],
		rules: { "@typescript-eslint/prefer-promise-reject-errors": "off" },
	},
	// node:test 的注册函数由测试运行器接管 Promise，声明为已知安全调用。
	{
		name: "fast-utils/node-test-registration",
		files: ["tests/**/*.test.ts"],
		rules: {
			"@typescript-eslint/no-floating-promises": [
				"error",
				{
					allowForKnownSafeCalls: [{ from: "package", name: ["afterEach", "describe", "it"], package: "node:test" }],
				},
			],
		},
	},
	// Logger 实现本身需要写入 Console；除此之外源码仍受 no-console 约束。
	{
		name: "fast-utils/intentional-console",
		files: ["src/logger/index.ts"],
		rules: { "no-console": "off" },
	},
	// Prettier 兼容层必须最后应用，只关闭与格式化器冲突的样式规则。
	{
		...eslintConfigPrettier,
		name: "fast-utils/prettier",
	}
);
