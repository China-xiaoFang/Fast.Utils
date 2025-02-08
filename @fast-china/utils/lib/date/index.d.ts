/**
 * Date工具类
 */
export declare const dateUtil: {
    /**
     * 根据当前时间生成问候语
     */
    getGreet(): string;
    /**
     * 时间处理翻译
     */
    dateTimeFix(date: string | Date | null | undefined): string;
    getDefaultTime(): Date[];
    getSimpleTime(): Date;
    getSimpleShortcuts(): {
        text: string;
        value: () => Date;
    }[];
    getShortcuts(): {
        text: string;
        value: () => Date[];
    }[];
    getDisabledDate(time: Date): boolean;
};
