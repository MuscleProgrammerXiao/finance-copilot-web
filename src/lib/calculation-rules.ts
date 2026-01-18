export interface CalculationRule {
    target: string;
    formula: Array<{
        operator: '+' | '-';
        source: string;
    }>;
}

export const CALCULATION_RULES: CalculationRule[] = [
    {
        target: "应收账款",
        formula: [{ operator: '+', source: "应收账款账面价值合计" }]
    },
    {
        target: "应收账款账面价值合计",
        formula: [
            { operator: '+', source: "应收账款账面余额合计" },
            { operator: '-', source: "应收账款坏账准备" }
        ]
    },
    {
        target: "应收账款账面余额合计",
        formula: [
            { operator: '+', source: "1年以内（含1年）" },
            { operator: '+', source: "1年至2年（含2年）" },
            { operator: '+', source: "2年至3年（含3年）" },
            { operator: '+', source: "3年以上" }
        ]
    },
    {
        target: "存货",
        formula: [
            { operator: '+', source: "存货账面余额" },
            { operator: '-', source: "存货跌价准备" }
        ]
    },
    {
        target: "【流动资产合计】",
        formula: [
            { operator: '+', source: "货币资金" },
            { operator: '+', source: "以公允价值计量且其变动计入当期损益的金融资产" },
            { operator: '+', source: "衍生金融资产" },
            { operator: '+', source: "应收票据" },
            { operator: '+', source: "应收账款" },
            { operator: '+', source: "预付款项" },
            { operator: '+', source: "其他应收款" },
            { operator: '+', source: "存货" },
            { operator: '+', source: "持有待售资产" },
            { operator: '+', source: "一年内到期的非流动资产" },
            { operator: '+', source: "其他流动资产" }
        ]
    },
    {
        target: "投资性房地产",
        formula: [
            { operator: '+', source: "投资性房地产账面价值合计：" },
            { operator: '+', source: "投资性房地产公允价值合计：" }
        ]
    },
    {
        target: "投资性房地产账面价值合计：",
        formula: [
            { operator: '+', source: "房屋、建筑物帐面价值（成本模式）" },
            { operator: '+', source: "土地使用权账面价值（成本模式）" }
        ]
    },
    {
        target: "投资性房地产公允价值合计：",
        formula: [
            { operator: '+', source: "房屋、建筑物公允价值（公允价值模式）" },
            { operator: '+', source: "土地使用权公允价值（公允价值模式）" }
        ]
    },
    {
        target: "固定资产",
        formula: [{ operator: '+', source: "固定资产账面价值合计：" }]
    },
    {
        target: "固定资产账面价值合计：",
        formula: [
            { operator: '+', source: "固定资产一原值" },
            { operator: '-', source: "固定资产累计折旧" },
            { operator: '-', source: "固定资产减值准备合计" }
        ]
    },
    {
        target: "【非流动资产合计】",
        formula: [
            { operator: '+', source: "可供出售金融资产" },
            { operator: '+', source: "持有至到期投资" },
            { operator: '+', source: "长期应收款" },
            { operator: '+', source: "长期股权投资" },
            { operator: '+', source: "投资性房地产" },
            { operator: '+', source: "固定资产" },
            { operator: '+', source: "在建工程" },
            { operator: '+', source: "生产性生物资产" },
            { operator: '+', source: "油气资产" },
            { operator: '+', source: "无形资产" },
            { operator: '+', source: "开发支出" },
            { operator: '+', source: "商誉" },
            { operator: '+', source: "长期待摊费用" },
            { operator: '+', source: "递延所得税资产" },
            { operator: '+', source: "其他非流动资产" }
        ]
    },
    {
        target: "【资产总计】",
        formula: [
            { operator: '+', source: "【流动资产合计】" },
            { operator: '+', source: "【非流动资产合计】" }
        ]
    },
    {
        target: "短期借款合计：",
        formula: [
            { operator: '+', source: "信用借款（短期）" },
            { operator: '+', source: "抵押贷款（短期）" },
            { operator: '+', source: "质押贷款（短期）" },
            { operator: '+', source: "保证贷款（短期）" }
        ]
    },
    {
        target: "短期借款",
        formula: [{ operator: '+', source: "短期借款合计：" }]
    },
    {
        target: "【流动负债合计】",
        formula: [
            { operator: '+', source: "短期借款" },
            { operator: '+', source: "以公允价值计量且其变动计入当期损益的金融负债" },
            { operator: '+', source: "衍生金融负债" },
            { operator: '+', source: "应付票据" },
            { operator: '+', source: "应付账款" },
            { operator: '+', source: "预收款项" },
            { operator: '+', source: "应付职工薪酬" },
            { operator: '+', source: "应交税费" },
            { operator: '+', source: "其他应付款" },
            { operator: '+', source: "持有待售负债" },
            { operator: '+', source: "一年内到期的非流动负债" },
            { operator: '+', source: "其他流动负债" }
        ]
    },
    {
        target: "长期借款合计：",
        formula: [
            { operator: '+', source: "信用借款（长期）" },
            { operator: '+', source: "抵押贷款（长期）" },
            { operator: '+', source: "质押贷款（长期）" },
            { operator: '+', source: "保证贷款（长期）" }
        ]
    },
    {
        target: "长期借款",
        formula: [{ operator: '+', source: "长期借款合计：" }]
    },
    {
        target: "【非流动负债合计】",
        formula: [
            { operator: '+', source: "长期借款" },
            { operator: '+', source: "应付债券" },
            { operator: '+', source: "长期应付款" },
            { operator: '+', source: "预计负债" },
            { operator: '+', source: "递延收益" },
            { operator: '+', source: "递延所得税负债" },
            { operator: '+', source: "其他非流动负债" }
        ]
    },
    {
        target: "【负债合计】",
        formula: [
            { operator: '+', source: "【流动负债合计】" },
            { operator: '+', source: "【非流动负债合计】" }
        ]
    },
    {
        target: "【归属于母公司所有者权益合计】",
        formula: [
            { operator: '+', source: "实收资本（或股本）" },
            { operator: '+', source: "其他权益工具" },
            { operator: '+', source: "资本公积" },
            { operator: '-', source: "减：库存股" },
            { operator: '+', source: "其他综合收益" },
            { operator: '+', source: "专项存储" },
            { operator: '+', source: "盈余公积" },
            { operator: '+', source: "未分配利润" }
        ]
    },
    {
        target: "【所有者权益（或股东权益）合计】",
        formula: [
            { operator: '+', source: "【归属于母公司所有者权益合计】" },
            { operator: '+', source: "少数股东权益" }
        ]
    },
    {
        target: "【负债和所有者权益（或股东权益）总计】",
        formula: [
            { operator: '+', source: "【负债合计】" },
            { operator: '+', source: "【所有者权益（或股东权益）合计】" }
        ]
    },
    {
        target: "借款合计：",
        formula: [
            { operator: '+', source: "短期借款合计：" },
            { operator: '+', source: "长期借款合计：" }
        ]
    },
    {
        target: "资产减值准备合计：",
        formula: [
            { operator: '+', source: "坏账准备" },
            { operator: '+', source: "存货跌价准备" },
            { operator: '+', source: "可供出售金融资产减值准备" },
            { operator: '+', source: "持有至到期投资减值准备" },
            { operator: '+', source: "长期股权投资减值准备" },
            { operator: '+', source: "投资性房地产减值准备" },
            { operator: '+', source: "固定资产减值准备" },
            { operator: '+', source: "工程物资减值准备" },
            { operator: '+', source: "在建工程减值准备" },
            { operator: '+', source: "生产性生物资产减值准备" },
            { operator: '+', source: "油气资产减值准备" },
            { operator: '+', source: "无形资产减值准备" },
            { operator: '+', source: "商誉减值准备" },
            { operator: '+', source: "其他" }
        ]
    }
];
