export interface DingTalkTemplate {
  name: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any
}

// 定义钉钉消息的JSON Schema
export const dingTalkJsonSchema = {
  type: 'object',
  required: ['msg_type'],
  properties: {
    msg_type: {
      type: 'string',
      enum: ['text', 'markdown', 'link', 'actionCard', 'feedCard'],
      description: '消息类型'
    },
    at: {
      type: 'object',
      properties: {
        atMobiles: {
          type: 'array',
          items: { type: 'string' }
        },
        atUserIds: {
          type: 'array',
          items: { type: 'string' }
        },
        isAtAll: {
          type: 'boolean',
          description: '是否@所有人'
        }
      }
    }
  },
  allOf: [
    {
      if: {
        properties: { msg_type: { const: 'text' } },
        required: ['msg_type']
      },
      then: {
        required: ['text'],
        properties: {
          text: {
            type: 'object',
            required: ['content'],
            properties: {
              content: {
                type: 'string',
                description: '文本内容'
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msg_type: { const: 'link' } },
        required: ['msg_type']
      },
      then: {
        required: ['link'],
        properties: {
          link: {
            type: 'object',
            required: ['title', 'messageURL', 'text'],
            properties: {
              title: { type: 'string', description: '标题' },
              messageURL: { type: 'string', description: '消息链接' },
              text: { type: 'string', description: '消息内容。如果太长只会部分展示。' },
              picURL: { type: 'string', description: '图片链接' }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msg_type: { const: 'markdown' } },
        required: ['msg_type']
      },
      then: {
        required: ['markdown'],
        properties: {
          markdown: {
            type: 'object',
            required: ['title', 'text'],
            properties: {
              title: { type: 'string', description: '首屏会话透出的展示内容' },
              text: { type: 'string', description: 'markdown格式的消息。' }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msg_type: { const: 'actionCard' } },
        required: ['msg_type']
      },
      then: {
        required: ['actionCard'],
        properties: {
          actionCard: {
            type: 'object',
            required: ['title', 'text', 'singleTitle', 'singleURL'],
            properties: {
              title: { type: 'string', description: '首屏会话透出的展示内容' },
              text: { type: 'string', description: 'markdown格式的消息。' },
              singleTitle: { type: 'string', description: '单个按钮的方案。' },
              singleURL: { type: 'string', description: '点击按钮触发的URL' },
              btnOrientation: {
                type: 'string',
                enum: ['0', '1'],
                description: '按钮排列顺序。0：竖直排列 1：横向排列'
              },
              btns: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['title', 'actionURL'],
                  properties: {
                    title: { type: 'string', description: '按钮方案' },
                    actionURL: { type: 'string', description: '点击按钮触发的URL' }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msg_type: { const: 'feedCard' } },
        required: ['msg_type']
      },
      then: {
        required: ['feedCard'],
        properties: {
          feedCard: {
            type: 'object',
            required: ['links'],
            properties: {
              links: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['title', 'messageURL', 'picURL'],
                  properties: {
                    title: { type: 'string', description: '标题' },
                    messageURL: { type: 'string', description: '消息链接' },
                    picURL: { type: 'string', description: '图片链接' }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]
}

export const dingTalkTemplates: DingTalkTemplate[] = [
  {
    name: '文本消息',
    description: 'Simple text message',
    template: {
      msg_type: 'text',
      text: {
        content: '在这里输入文本消息'
      },
      at: {
        isAtAll: false,
        atMobiles: [],
        atUserIds: []
      }
    }
  },
  {
    name: '富文本消息',
    description: '富文本消息',
    template: {
      msg_type: 'markdown',
      markdown: {
        title: '在这里输入标题',
        text: '在这里输入富文本内容'
      },
      at: {
        isAtAll: false,
        atMobiles: [],
        atUserIds: []
      }
    }
  },
  {
    name: '链接消息',
    description: '链接消息',
    template: {
      msg_type: 'link',
      link: {
        title: '在这里输入标题',
        messageURL: '在这里输入消息链接',
        text: '在这里输入消息内容。如果太长只会部分展示。',
        picURL: '在这里输入图片链接'
      },
      at: {
        isAtAll: false,
        atMobiles: [],
        atUserIds: []
      }
    }
  },
  {
    name: '整体跳转 ActionCard 类型',
    description: '按钮独立跳转 ActionCard 类型消息',
    template: {
      msg_type: 'actionCard',
      actionCard: {
        title: '在这里输入标题',
        text: '在这里输入富文本内容',
        singleTitle: '在这里输入单个按钮的方案',
        singleURL: '在这里输入点击按钮触发的URL',
        btnOrientation: '0'
      }
    }
  },
  {
    name: '独立跳转 ActionCard 类型',
    description: '按钮独立跳转 ActionCard 类型消息',
    template: {
      msg_type: 'actionCard',
      actionCard: {
        title: '在这里输入标题',
        text: '在这里输入富文本内容',
        singleTitle: '在这里输入单个按钮的方案',
        singleURL: '在这里输入点击按钮触发的URL',
        btnOrientation: '1',
        btns: [
          { title: '在这里输入按钮方案', actionURL: '在这里输入点击按钮触发的URL' },
          { title: '在这里输入按钮方案', actionURL: '在这里输入点击按钮触发的URL' }
        ]
      }
    }
  },
  {
    name: '卡片消息',
    description: '卡片消息',
    template: {
      msg_type: 'feedCard',
      feedCard: {
        links: [
          {
            title: '在这里输入标题',
            messageURL: '在这里输入消息链接',
            picURL: '在这里输入图片链接',
            text: '在这里输入消息内容。如果太长只会部分展示。'
          }
        ]
      }
    }
  }
]
