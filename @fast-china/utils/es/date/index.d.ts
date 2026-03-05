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
    dateTimeFix(date: number | string | Date | null | undefined): string;
    /**
     * 获取简单的日期时间
     * @returns xxxx-xx-xx 00:00:00
     */
    getSimpleTime(): Date;
    /**
     * 获取默认时间
     * @param isFuture 是否为未来时间
     * @returns [00:00:00, 23:59:59]
     */
    getDefaultTime(isFuture?: boolean): [Date, Date];
    /**
     * 获取简单的日期时间范围
     * @param isFuture 是否为未来时间
     */
    getSimpleShortcuts(isFuture?: boolean): {
        text: string;
        value: () => Date;
    }[];
    /**
     * 获取日期范围
     * @param isFuture 是否为未来时间
     */
    getShortcuts(isFuture?: boolean): {
        text: string;
        value: () => Date[];
    }[];
    /**
     * 判断传入的时间是否大于当前时间
     */
    getDisabledDate(time: Date): boolean;
};
