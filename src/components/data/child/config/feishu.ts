export interface FeishuTemplate {
  name: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any
}

// 定义飞书消息的JSON Schema
export const feishuJsonSchema = {
  type: 'object',
  required: ['msg_type'],
  properties: {
    msg_type: {
      type: 'string',
      enum: ['text', 'post', 'interactive', 'share_chat', 'image'],
      description: '消息类型'
    }
  },
  allOf: [
    {
      if: {
        properties: { msg_type: { const: 'text' } },
        required: ['msg_type']
      },
      then: {
        required: ['content'],
        properties: {
          content: {
            type: 'object',
            required: ['text'],
            properties: {
              text: {
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
        properties: { msg_type: { const: 'post' } },
        required: ['msg_type']
      },
      then: {
        required: ['content'],
        properties: {
          content: {
            type: 'object',
            required: ['post'],
            properties: {
              post: {
                type: 'object',
                required: ['zh_cn'],
                properties: {
                  zh_cn: {
                    type: 'object',
                    required: ['title', 'content'],
                    properties: {
                      title: {
                        type: 'string',
                        description: '富文本标题'
                      },
                      content: {
                        type: 'array',
                        description: '富文本内容',
                        items: {
                          type: 'array',
                          items: {
                            type: 'object',
                            required: ['tag', 'text'],
                            properties: {
                              tag: {
                                type: 'string',
                                enum: ['text', 'a', 'at', 'img'],
                                description: '内容类型'
                              },
                              text: {
                                type: 'string',
                                description: '文本内容'
                              },
                              href: {
                                type: 'string',
                                description: '链接地址 (仅在 tag 为 "a" 时有效)'
                              },
                              user_id: {
                                type: 'string',
                                description: '用户 ID (仅在 tag 为 "at" 时有效)'
                              },
                              image_key: {
                                type: 'string',
                                description: '图片 key (仅在 tag 为 "img" 时有效)'
                              }
                            }
                          }
                        }
                      }
                    }
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
        properties: { msg_type: { const: 'interactive' } },
        required: ['msg_type']
      },
      then: {
        required: ['card'],
        properties: {
          card: {
            type: 'object',
            required: ['config', 'header', 'elements'],
            properties: {
              config: {
                type: 'object',
                properties: {
                  wide_screen_mode: {
                    type: 'boolean',
                    description: '是否使用宽屏模式'
                  },
                  enable_forward: {
                    type: 'boolean',
                    description: '是否允许转发'
                  }
                }
              },
              header: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: {
                    type: 'object',
                    required: ['tag', 'content'],
                    properties: {
                      tag: {
                        type: 'string',
                        enum: ['plain_text', 'lark_md'],
                        description: '标题类型'
                      },
                      content: {
                        type: 'string',
                        description: '标题内容'
                      }
                    }
                  }
                }
              },
              elements: {
                type: 'array',
                description: '卡片元素列表',
                items: {
                  type: 'object',
                  required: ['tag'],
                  properties: {
                    tag: {
                      type: 'string',
                      enum: ['div', 'markdown', 'hr', 'action'],
                      description: '元素类型'
                    }
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
        properties: { msg_type: { const: 'image' } },
        required: ['msg_type']
      },
      then: {
        required: ['content'],
        properties: {
          content: {
            type: 'object',
            required: ['image_key'],
            properties: {
              image_key: {
                type: 'string',
                description: '图片资源标识'
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msg_type: { const: 'share_chat' } },
        required: ['msg_type']
      },
      then: {
        required: ['content'],
        properties: {
          content: {
            type: 'object',
            required: ['chat_id'],
            properties: {
              chat_id: {
                type: 'string',
                description: '群组 ID'
              }
            }
          }
        }
      }
    }
  ]
}

export const feishuTemplates: FeishuTemplate[] = [
  {
    name: 'Text Message',
    description: 'Simple text message',
    template: {
      msg_type: 'text',
      content: {
        text: 'Hello World'
      }
    }
  },
  {
    name: 'Rich Text',
    description: 'Message with rich text formatting',
    template: {
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title: 'Title',
            content: [
              [
                {
                  tag: 'text',
                  text: 'Content'
                }
              ]
            ]
          }
        }
      }
    }
  },
  {
    name: 'Interactive Card',
    description: 'Interactive message card',
    template: {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true
        },
        header: {
          title: {
            tag: 'plain_text',
            content: 'Header'
          }
        },
        elements: []
      }
    }
  }
]
