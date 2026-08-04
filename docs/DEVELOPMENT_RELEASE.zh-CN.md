# Fast.Utils 开发与发布

## 基线

- Node.js：`^22.18.0 || ^24.18.0`。
- pnpm：`^11.0.0`，不固定补丁版本。
- TypeScript 6、tsdown、ESLint 10 Flat Config、Prettier 3。
- 发布格式：纯 ESM、ES2022、`.mjs`、`.d.mts` 和 Source Map。
- 根目录是唯一 npm 发布单元，根 `dist/` 是唯一产物目录。

应用环境包括现代浏览器、WebView、Vue 2.7/3 和 uni-app。

## 安装与命令

```bash
corepack enable
pnpm install --frozen-lockfile
```

| 命令                | 用途                                                                   |
| ------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`          | 使用 tsdown 监听源码并增量构建                                         |
| `pnpm build`        | 使用 tsdown 构建统一公开入口与内部模块                                 |
| `pnpm typecheck`    | 检查源码与构建配置类型                                                 |
| `pnpm lint`         | 运行零警告 ESLint                                                      |
| `pnpm format:check` | 检查 Prettier                                                          |
| `pnpm test:types`   | 验证公开消费者类型                                                     |
| `pnpm test:runtime` | 运行单元、平台与 Vue Runtime 测试                                      |
| `pnpm test:package` | 验证 Tarball、公开入口、声明、Source Map、Tree Shaking、体积与 Publint |
| `pnpm check`        | 运行统一质量门禁                                                       |

## 修改公共模块

新增公共模块时必须同步：

1. 在 `src/<module>/index.ts` 定义具名 API 和 TSDoc。
2. 在 `src/index.ts` 统一重新导出公共 API。
3. 不为模块增加 `package.json#exports` 子路径或独立构建入口。
4. 增加源码类型、消费者类型、单元和真实包测试。
5. 更新双语 README、API 和 Changelog。

禁止在导入阶段访问浏览器或 uni-app 全局对象。平台能力应在调用阶段解析；`configureStorage` 在调用时自动检测全局 `uni`。

## 依赖与锁文件

- Runtime Dependency 必须证明无法由平台能力或小型实现替代。
- Vue 保持 Optional Peer Dependency，不得打包进发布产物。
- 依赖升级后使用当前 pnpm 11 更新 Lockfile，并通过 Frozen Lockfile 安装验证。
- 不混用 npm、Yarn 或不同 pnpm 主版本改写 Lockfile。

## CI

CI 在 Node 22 与 24 上运行，使用 Frozen Lockfile，并执行 `pnpm check` 与 Pack Dry Run。不得通过关闭类型、Lint、测试或包验证来修复门禁。

## 发布

仓库只采用人工发布流程，不声明或配置 OIDC Trusted Publishing：

1. 更新 SemVer 与 `CHANGELOG.md` 日期。
2. 执行 `pnpm install --frozen-lockfile`。
3. 执行 `pnpm check`。
4. 人工检查 `pnpm --config.ignore-scripts=true pack --dry-run` 清单。
5. 由维护者在可信环境执行 npm Publish，并创建对应 `v<version>` Tag。

未经明确授权，不执行 Publish、Push、Tag 或 Release。npm 已发布版本不可覆盖；发布后缺陷必须通过新 Patch 或 Pre-release 修复。
