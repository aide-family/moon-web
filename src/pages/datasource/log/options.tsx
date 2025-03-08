/* eslint-disable prettier/prettier */
import { Status, StorageType } from '@/api/enum'
import type { DataFromItem } from '@/components/data/form'
import { AliYunSLS, Elasticsearch, Loki } from '@/components/icon'
import { Space } from 'antd'

/**
 * 基础信息表单配置
 * @returns DataFromItem[]
 */
export function basicFormOptions(): (DataFromItem | DataFromItem[])[] {
    return [
        [
            {
                label: '名称',
                name: 'name',
                type: 'input',
                formProps: {
                    rules: [{ required: true, message: '请输入名称' }]
                },
                props: { placeholder: '请输入名称' }
            },
            {
                label: '状态',
                name: 'status',
                type: 'radio-group',
                formProps: {
                    rules: [{ required: true, message: '请选择状态' }]
                },
                props: {
                    options: [
                        { label: '启用', value: Status.StatusEnable },
                        { label: '禁用', value: Status.StatusDisable }
                    ]
                }
            }
        ],
        {
            label: '存储器类型',
            name: 'storageType',
            type: 'radio-group',
            formProps: {
                rules: [{ required: true, message: '请选择类型' }]
            },
            props: {
                optionType: 'button',
                options: [
                    {
                        label: (
                            <Space>
                                <Elasticsearch width={15} height={15} />
                                Elasticsearch
                            </Space>
                        ),
                        value: StorageType.StorageTypeElasticsearch
                    },
                    {
                        label: (
                            <Space>
                                <Loki width={15} height={15} />
                                Loki
                            </Space>
                        ),
                        value: StorageType.StorageTypeLoki
                    },
                    {
                        label: (
                            <Space>
                                <AliYunSLS width={15} height={15} />
                                AliYunSLS
                            </Space>
                        ),
                        value: StorageType.StorageAliYunSLS
                    }
                ]
            }
        },
        [
            {
                label: '端点',
                name: 'endpoints',
                type: 'select',
                formProps: {
                    rules: [
                        {
                            required: true,
                            message: '请输入端点',
                            type: 'regexp',
                            pattern: /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/
                        }
                    ],
                    tooltip: 'endpoints'
                },
                props: {
                    placeholder: '请输入端点',
                    mode: 'tags',
                    tokenSeparators: [',', ' ']
                }
            }
        ],
        [
            {
                label: '备注',
                name: 'remark',
                type: 'textarea',
                props: { placeholder: '请输入备注', showCount: true, maxLength: 200 }
            }
        ]
    ]
}

/**
 * elasticsearch 数据源表单配置
 * @returns DataFromItem[]
 */
export function elasticsearchFormOptions(): (DataFromItem | DataFromItem[])[] {
    return [
        [
            {
                label: '索引库',
                name: 'searchIndex',
                type: 'input',
                props: { placeholder: '请输入索引库' }
            },
            {
                label: 'apiKey',
                name: 'apiKey',
                type: 'input',
                props: { placeholder: '请输入apiKey' }
            },
        ],
        [
            {
                label: '服务token',
                name: 'serviceToken',
                type: 'input',
                props: { placeholder: '请输入服务token' }
            },
            {
                label: 'CloudId',
                name: 'cloudId',
                type: 'input',
                props: { placeholder: '请输入CloudId' }
            }
        ],
        [
            {
                label: '用户名',
                name: 'username',
                type: 'input',
                props: { placeholder: '请输入用户名', autoComplete: 'off' }
            },
            {
                label: '密码(password)',
                name: 'password',
                type: 'input',
                props: { placeholder: '请输入密码', autoComplete: 'off' }
            }
        ]
    ]
}

/**
 * loki 数据源表单配置
 * @returns DataFromItem[]
 */
export function lokiFormOptions(): (DataFromItem | DataFromItem[])[] {
    return [
        [
            {
                label: '用户名',
                name: 'username',
                type: 'input',
                formProps: {
                    tooltip: 'username'
                },
                props: { placeholder: '请输入组名', autoComplete: 'off' }
            },
            {
                label: '密码',
                name: 'password',
                type: 'input',
                formProps: {
                    tooltip: 'password'
                },
                props: { placeholder: '请输入密码', autoComplete: 'off' }
            },
            {
                label: '条数',
                name: 'limit',
                type: 'input',
                formProps: {
                    tooltip: 'limit'
                },
                props: { placeholder: '请输入条数', autoComplete: 'off', type: "number" }
            },
        ]
    ]
}


/**
 * aliYun 数据源表单配置
 * @returns DataFromItem[]
 */
export function aliYunFormOptions(): (DataFromItem | DataFromItem[])[] {
    return [
        [
            {
                label: '密钥',
                name: 'accessKey',
                type: 'input',
                props: { placeholder: '请输入密钥' }
            },
            {
                label: '证书',
                name: 'accessSecret',
                type: 'input',
                props: { placeholder: '请输入证书' }
            }
        ],
        [
            {
                label: 'Token',
                name: 'securityToken',
                type: 'input',
                props: { placeholder: '请输入Token' }
            },
            {
                label: '过期时间',
                name: 'expireTime',
                type: 'input',
                props: { placeholder: '请输入过期时间', type: "number" }
            }
        ],
        [
            {
                label: '项目',
                name: 'project',
                type: 'input',
                props: { placeholder: '请输入项目' }
            },
            {
                label: '存储名称',
                name: 'store',
                type: 'input',
                props: { placeholder: '请输入存储名称' }
            }
        ]
    ]
}
