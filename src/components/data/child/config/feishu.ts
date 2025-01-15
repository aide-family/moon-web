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
                required: ['zh_cn', 'en_us'],
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
                            allOf: [
                              {
                                if: {
                                  properties: { tag: { const: 'text' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: {
                                    text: {
                                      type: 'string',
                                      description: '文本内容'
                                    },
                                    un_escape: {
                                      type: 'boolean',
                                      default: false,
                                      description: '是否转义 (仅在 tag 为 "text" 时有效)'
                                    }
                                  }
                                }
                              },
                              {
                                if: {
                                  properties: { tag: { const: 'a' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: { href: { type: 'string', description: '链接地址' } }
                                }
                              },
                              {
                                if: {
                                  properties: { tag: { const: 'at' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: {
                                    user_id: { type: 'string', description: '用户 ID' },
                                    user_name: { type: 'string', description: '用户名称' }
                                  }
                                }
                              },
                              {
                                if: {
                                  properties: { tag: { const: 'img' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: { image_key: { type: 'string', description: '图片资源标识' } }
                                }
                              }
                            ]
                          }
                        }
                      }
                    }
                  },
                  en_us: {
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
                            allOf: [
                              {
                                if: {
                                  properties: { tag: { const: 'text' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: {
                                    text: {
                                      type: 'string',
                                      description: '文本内容'
                                    },
                                    un_escape: {
                                      type: 'boolean',
                                      default: false,
                                      description: '是否转义 (仅在 tag 为 "text" 时有效)'
                                    }
                                  }
                                }
                              },
                              {
                                if: {
                                  properties: { tag: { const: 'a' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: { href: { type: 'string', description: '链接地址' } }
                                }
                              },
                              {
                                if: {
                                  properties: { tag: { const: 'at' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: {
                                    user_id: { type: 'string', description: '用户 ID' },
                                    user_name: { type: 'string', description: '用户名称' }
                                  }
                                }
                              },
                              {
                                if: {
                                  properties: { tag: { const: 'img' } },
                                  required: ['tag']
                                },
                                then: {
                                  properties: { image_key: { type: 'string', description: '图片资源标识' } }
                                }
                              }
                            ]
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
                  streaming_mode: {
                    type: 'boolean',
                    description: ' 卡片是否处于流式更新模式，默认值为 false。灰度中'
                  },
                  streaming_config: {
                    type: 'object',
                    properties: {
                      print_frequency_ms: {
                        type: 'object',
                        description: '流式更新频率，单位：ms',
                        properties: {
                          default: { type: 'number', description: '默认流式更新频率，单位：ms' },
                          android: { type: 'number', description: '安卓流式更新频率，单位：ms' },
                          ios: { type: 'number', description: 'ios流式更新频率，单位：ms' },
                          pc: { type: 'number', description: 'pc流式更新频率，单位：ms' }
                        }
                      },
                      print_step: {
                        type: 'object',
                        description: '流式更新步长，单位：字符数',
                        properties: {
                          default: { type: 'number', description: '默认流式更新步长，单位：字符数' },
                          android: { type: 'number', description: '安卓流式更新步长，单位：字符数' },
                          ios: { type: 'number', description: 'ios流式更新步长，单位：字符数' },
                          pc: { type: 'number', description: 'pc流式更新步长，单位：字符数' }
                        }
                      },
                      print_strategy: {
                        type: 'string',
                        description: '流式更新策略',
                        enum: ['fast', 'delay'],
                        default: 'fast'
                      }
                    }
                  },
                  summary: {
                    type: 'object',
                    description: '卡片摘要',
                    properties: {
                      content: { type: 'string', description: '卡片内容' },
                      i18n_content: {
                        type: 'object',
                        description: '摘要信息的多语言配置。了解支持的所有语种。参考配置卡片多语言文档',
                        properties: {
                          zh_cn: { type: 'string', description: '中文内容' },
                          en_us: { type: 'string', description: '英文内容' },
                          ja_jp: { type: 'string', description: '日文内容' }
                        }
                      }
                    }
                  },
                  locales: {
                    type: 'array',
                    description: '卡片支持的语言列表',
                    items: {
                      type: 'string',
                      description: '语言',
                      enum: ['zh_cn', 'en_us', 'ja_jp']
                    }
                  },
                  enable_forward: {
                    type: 'boolean',
                    description: '是否支持转发卡片。默认值为 true。',
                    default: true
                  },
                  update_multi: {
                    type: 'boolean',
                    description:
                      '是否为共享卡片。默认值为 true，JSON 2.0 暂时仅支持设为 true，即更新卡片的内容对所有收到这张卡片的人员可见。',
                    default: true
                  },
                  width_mode: {
                    type: 'string',
                    description:
                      '卡片宽度模式。支持 "compact"（紧凑宽度 400px）模式 或 "fill"（撑满聊天窗口宽度）模式。默认不填时的宽度为 600px。',
                    enum: ['compact', 'fill'],
                    default: 'compact'
                  },
                  use_custom_translation: {
                    type: 'boolean',
                    description: '是否使用自定义翻译。默认值为 false。',
                    default: false
                  },
                  enable_forward_interaction: {
                    type: 'boolean',
                    description: '是否支持转发卡片时，点击卡片中的按钮。默认值为 false。',
                    default: false
                  },
                  style: {
                    type: 'object',
                    description: '卡片样式',
                    properties: {
                      text_size: {
                        type: 'object',
                        description: '卡片文本大小',
                        properties: {
                          default: { type: 'string', description: '默认文本大小', enum: ['small', 'medium', 'large'] },
                          mobile: { type: 'string', description: '移动端文本大小', enum: ['small', 'medium', 'large'] },
                          pc: { type: 'string', description: 'pc端文本大小', enum: ['small', 'medium', 'large'] }
                        }
                      },
                      color: {
                        type: 'object',
                        description:
                          ' 分别为飞书客户端浅色主题和深色主题添加 RGBA 语法。用于在组件 JSON 中设置颜色属性。支持添加多个自定义颜色对象。'
                      }
                    }
                  }
                }
              },
              card_link: {
                type: 'object',
                description: '卡片链接',
                properties: {
                  url: { type: 'string', description: '链接地址' },
                  android_url: { type: 'string', description: '安卓链接地址' },
                  ios_url: { type: 'string', description: 'ios链接地址' },
                  pc_url: { type: 'string', description: 'pc链接地址' }
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
                        enum: ['plain_text'],
                        description: '标题类型',
                        default: 'plain_text'
                      },
                      content: {
                        type: 'string',
                        description: '标题内容'
                      },
                      i18n: {
                        type: 'object',
                        description: '标题的多语言配置',
                        properties: {
                          zh_cn: { type: 'string', description: '中文标题' },
                          en_us: { type: 'string', description: '英文标题' },
                          ja_jp: { type: 'string', description: '日文标题' }
                        }
                      }
                    }
                  },
                  subtitle: {
                    type: 'object',
                    description: '副标题',
                    properties: {
                      tag: { type: 'string', description: '副标题类型', enum: ['plain_text'] },
                      content: { type: 'string', description: '副标题内容' },
                      i18n: {
                        type: 'object',
                        description: '副标题的多语言配置',
                        properties: {
                          zh_cn: { type: 'string', description: '中文副标题' },
                          en_us: { type: 'string', description: '英文副标题' },
                          ja_jp: { type: 'string', description: '日文副标题' }
                        }
                      }
                    }
                  },
                  text_tag_list: {
                    type: 'object',
                    description: '文本标签列表',
                    properties: {
                      tag: { type: 'string', description: '文本标签' },
                      text: {
                        type: 'object',
                        description: '文本内容',
                        properties: {
                          tag: { type: 'string', description: '文本标签' },
                          content: { type: 'string', description: '文本内容' }
                        }
                      },
                      color: { type: 'string', description: '文本颜色' }
                    }
                  },
                  i18n_text_tag_list: {
                    type: 'object',
                    description: '文本标签的多语言配置',
                    properties: {
                      zh_cn: { type: 'array', description: '中文文本标签' },
                      en_us: { type: 'array', description: '英文文本标签' },
                      ja_jp: { type: 'array', description: '日文文本标签' }
                    }
                  },
                  template: {
                    type: 'string',
                    description: '模板',
                    default: 'default',
                    // 标题主题颜色。支持 "blue"|"wathet"|"tuiquoise"|"green"|"yellow"|"orange"|"red"|"carmine"|"violet"|"purple"|"indigo"|"grey"|"default"。默认值 default。
                    enum: [
                      'blue',
                      'wathet',
                      'tuiquoise',
                      'green',
                      'yellow',
                      'orange',
                      'red',
                      'carmine',
                      'violet',
                      'purple',
                      'indigo',
                      'grey',
                      'default'
                    ]
                  },
                  icon: {
                    type: 'object',
                    description: '图标',
                    properties: {
                      image_key: { type: 'string', description: '图片资源标识' }
                    }
                  },
                  ud_icon: {
                    type: 'object',
                    description: '用户头像',
                    properties: {
                      token: { type: 'string', description: '用户token' },
                      style: {
                        type: 'object',
                        description: '用户头像样式',
                        properties: {
                          color: {
                            type: 'string',
                            description: '用户头像颜色',
                            enum: [
                              'blue',
                              'wathet',
                              'tuiquoise',
                              'green',
                              'yellow',
                              'orange',
                              'red',
                              'carmine',
                              'violet',
                              'purple',
                              'indigo',
                              'grey',
                              'default'
                            ]
                          }
                        }
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
                      description: '元素类型'
                    },
                    element_id: {
                      type: 'string',
                      description: '元素ID'
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
            required: ['share_chat_id'],
            properties: {
              share_chat_id: {
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
    name: '文本消息',
    description: 'Simple text message',
    template: {
      msg_type: 'text',
      content: {
        text: '在这里输入文本消息'
      }
    }
  },
  {
    name: '富文本消息',
    description: '富文本消息',
    template: {
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title: '在这里输入标题',
            content: [
              [
                {
                  tag: 'text',
                  text: '在这里输入富文本内容'
                }
              ]
            ]
          },
          en_us: {
            title: 'Here is the title',
            content: [
              [
                {
                  tag: 'text',
                  text: 'Here is the content'
                }
              ]
            ]
          }
        }
      }
    }
  },
  {
    name: '交互卡片',
    description: '交互卡片',
    template: {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true,
          locales: ['zh_cn', 'en_us', 'ja_jp'],
          summary: {
            content: '在这里输入卡片摘要'
          },
          i18n_summary: {
            zh_cn: '在这里输入中文卡片摘要',
            en_us: '在这里输入英文卡片摘要',
            ja_jp: '在这里输入日文卡片摘要'
          },
          enable_forward: true,
          update_multi: true,
          width_mode: 'compact',
          use_custom_translation: false,
          enable_forward_interaction: false
        },
        header: {
          title: {
            tag: 'plain_text',
            content: '在这里输入标题'
          },
          subtitle: {
            tag: 'plain_text',
            content: '在这里输入副标题'
          }
        },
        elements: [
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: '在这里输入按钮文本'
            }
          }
        ]
      }
    }
  }
]
