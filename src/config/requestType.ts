export type ResultTable = {
    success: boolean;
    message: string;
    code: number;
    data?: {
        /** 列表数据  */
        list: Array<any>;
        /** 总条目数 */
        total?: number;
        /** 每页显示条目个数 */
        current?: number;
        /** 当前页数 */
        size?: number;
    };
};

//普通接口返回对象内容
export type Result = {
    success: boolean;
    data?: any;
    message: string;
    code: number;
};

//普通接口返回list内容
export type ResultList = {
    success: boolean;
    data: Array<any>;
    message: string;
    code: number;
};
