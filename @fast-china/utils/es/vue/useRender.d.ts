import { VNode } from 'vue';
/**
 * 使用渲染
 * @description 为了解决使用 TSX 语法返回渲染函数，状态不会出现在 vue.js devtools 中
 */
export declare const useRender: (render: () => VNode) => void;
