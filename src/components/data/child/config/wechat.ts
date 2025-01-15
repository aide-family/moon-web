export interface WechatTemplate {
  name: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any
}

// 定义微信消息的JSON Schema
export const wechatJsonSchema = {
  type: 'object',
  required: ['msg_type'],
  properties: {
    msgtype: {
      type: 'string',
      enum: ['text', 'markdown', 'image', 'news', 'file', 'voice', 'template_card'],
      description: '消息类型'
    }
  },
  allOf: [
    {
      if: {
        properties: { msgtype: { const: 'text' } },
        required: ['msgtype']
      },
      then: {
        required: ['text'],
        properties: {
          text: {
            type: 'object',
            required: ['content'],
            properties: {
              content: { type: 'string', description: '文本内容' },
              mentioned_list: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'userid的列表，提醒群中的指定成员(@某个成员)，@all表示提醒所有人，如果开发者获取不到userid，可以使用mentioned_mobile_list'
              },
              mentioned_mobile_list: {
                type: 'array',
                items: { type: 'string' },
                description: '手机号列表，提醒群中的指定成员(@某个成员)，@all表示提醒所有人'
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msgtype: { const: 'markdown' } },
        required: ['msgtype']
      },
      then: {
        required: ['markdown'],
        properties: {
          markdown: {
            type: 'object',
            required: ['content'],
            properties: {
              content: {
                type: 'string',
                description: 'markdown内容，最长不超过4096个字节，必须是utf8编码'
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msgtype: { const: 'image' } },
        required: ['msgtype']
      },
      then: {
        required: ['image'],
        properties: {
          image: {
            type: 'object',
            required: ['base64', 'md5'],
            properties: {
              base64: {
                type: 'string',
                description: '图片的base64编码,图片（base64编码前）最大不能超过2M，支持JPG,PNG格式'
              },
              md5: {
                type: 'string',
                description: '图片内容（base64编码前）的md5值'
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msgtype: { const: 'news' } },
        required: ['msgtype']
      },
      then: {
        required: ['news'],
        properties: {
          news: {
            type: 'object',
            required: ['articles'],
            properties: {
              articles: {
                type: 'array',
                description: '图文消息，一个图文消息支持1到8条图文',
                minItems: 1,
                items: {
                  type: 'object',
                  required: ['title', 'url'],
                  properties: {
                    title: { type: 'string', description: '图文消息标题' },
                    description: { type: 'string', description: '图文消息描述' },
                    url: { type: 'string', description: '点击后跳转的链接' },
                    picurl: {
                      type: 'string',
                      description: '图文消息的图片链接，支持JPG,PNG格式，较好的效果为大图 1068*455，小图150*150'
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
        properties: { msgtype: { const: 'file' } },
        required: ['msgtype']
      },
      then: {
        required: ['file'],
        properties: {
          file: {
            type: 'object',
            required: ['media_id'],
            properties: {
              media_id: {
                type: 'string',
                description: '文件id，通过下文的文件上传接口获取'
              }
            }
          }
        }
      }
    },
    {
      if: {
        properties: { msgtype: { const: 'voice' } },
        required: ['msgtype']
      },
      then: {
        required: ['voice'],
        properties: {
          voice: {
            type: 'object',
            required: ['media_id'],
            properties: { media_id: { type: 'string', description: '语音文件id，通过下文的文件上传接口获取' } }
          }
        }
      }
    },
    {
      if: {
        properties: { msgtype: { const: 'template_card' } },
        required: ['msgtype']
      },
      then: {
        required: ['template_card'],
        properties: {
          template_card: {
            type: 'object',
            required: ['card_type'],
            properties: {
              card_type: {
                type: 'string',
                enum: ['text_notice', 'news_notice', 'button_interaction', 'vote_interaction', 'multiple_interaction'],
                description: '卡片类型',
                default: 'text_notice'
              }
            },
            allOf: [
              {
                if: {
                  properties: { card_type: { const: 'text_notice' } },
                  required: ['card_type']
                },
                then: {
                  required: ['main_title', 'card_action'],
                  properties: {
                    source: {
                      type: 'object',
                      required: ['icon_url', 'desc'],
                      properties: {
                        icon_url: { type: 'string', description: '来源图片的url' },
                        desc: { type: 'string', description: '来源描述' },
                        desc_color: {
                          type: 'number',
                          enum: [0, 1],
                          description: '来源描述颜色，0代表蓝色，1代表灰色'
                        }
                      }
                    },
                    main_title: {
                      type: 'object',
                      required: ['title', 'desc'],
                      properties: {
                        title: { type: 'string', description: '主标题' },
                        desc: { type: 'string', description: '主标题描述' }
                      }
                    },
                    emphasis_content: {
                      type: 'object',
                      required: ['title', 'desc'],
                      properties: {
                        title: { type: 'string', description: '强调内容标题' },
                        desc: { type: 'string', description: '强调内容描述' }
                      }
                    },
                    quote_area: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'number',
                          enum: [0, 1],
                          description: '引用类型，0代表文本，1代表图片'
                        },
                        url: { type: 'string', description: '引用内容的url' },
                        appid: { type: 'string', description: '引用内容的appid' },
                        pagepath: { type: 'string', description: '引用内容的pagepath' },
                        title: { type: 'string', description: '引用内容的标题' },
                        quote_text: { type: 'string', description: '引用内容的文本' }
                      }
                    },
                    sub_title_text: {
                      type: 'string',
                      description: '二级标题文本，长度限制为100个字符以内'
                    },
                    horizontal_content_list: {
                      type: 'array',
                      items: { type: 'object' },
                      description: '横向内容列表，横向内容列表，长度限制为100个字符以内',
                      required: ['keyname'],
                      properties: {
                        keyname: { type: 'string', description: '横向内容列表的key' },
                        value: { type: 'string', description: '横向内容列表的value' }
                      }
                    },
                    jump_list: {
                      type: 'array',
                      items: { type: 'object' },
                      description: '跳转列表，跳转列表，长度限制为100个字符以内',
                      required: ['title'],
                      properties: {
                        type: { type: 'number', enum: [0, 1], description: '跳转类型，0代表网页，1代表小程序' },
                        url: { type: 'string', description: '跳转的url' },
                        appid: { type: 'string', description: '跳转的小程序appid' },
                        pagepath: { type: 'string', description: '跳转的小程序pagepath' },
                        title: { type: 'string', description: '跳转的标题' }
                      }
                    },
                    card_action: {
                      type: 'object',
                      required: ['type'],
                      properties: {
                        type: { type: 'number', enum: [0, 1], description: '跳转类型，0代表网页，1代表小程序' },
                        url: { type: 'string', description: '跳转的url' },
                        appid: { type: 'string', description: '跳转的小程序appid' },
                        pagepath: { type: 'string', description: '跳转的小程序pagepath' },
                        title: { type: 'string', description: '跳转的标题' }
                      }
                    }
                  }
                }
              },
              {
                if: {
                  properties: { card_type: { const: 'news_notice' } },
                  required: ['card_type']
                },
                then: {
                  required: ['card_image', 'card_image', 'card_action'],
                  properties: {
                    source: {
                      type: 'object',
                      required: ['icon_url', 'desc'],
                      properties: {
                        icon_url: { type: 'string', description: '来源图片的url' },
                        desc: { type: 'string', description: '来源描述' },
                        desc_color: {
                          type: 'number',
                          enum: [0, 1],
                          description: '来源描述颜色，0代表蓝色，1代表灰色'
                        }
                      }
                    },
                    main_title: {
                      type: 'object',
                      required: ['title'],
                      properties: {
                        title: { type: 'string', description: '主标题' },
                        desc: { type: 'string', description: '主标题描述' }
                      }
                    },
                    card_image: {
                      type: 'object',
                      required: ['url'],
                      properties: {
                        url: {
                          type: 'string',
                          description: '卡片图片，图片url，支持JPG,PNG格式，较好的效果为大图 1068*455，小图150*150'
                        },
                        aspect_ratio: {
                          type: 'number',
                          description: '图片的宽高比'
                        }
                      }
                    },
                    image_text_area: {
                      type: 'object',
                      required: ['image_url'],
                      properties: {
                        type: { type: 'number', description: '图片类型，0代表大图，1代表小图' },
                        url: { type: 'string', description: '图片url' },
                        title: { type: 'string', description: '图片标题' },
                        desc: { type: 'string', description: '图片描述' },
                        image_url: { type: 'string', description: '图片url' }
                      }
                    },
                    quote_area: {
                      type: 'object',
                      properties: {
                        type: { type: 'number', description: '引用类型，0代表文本，1代表图片' },
                        url: { type: 'string', description: '引用内容的url' },
                        appid: { type: 'string', description: '引用内容的小程序appid' },
                        pagepath: { type: 'string', description: '引用内容的小程序pagepath' },
                        title: { type: 'string', description: '引用内容的标题' },
                        quote_text: { type: 'string', description: '引用内容的文本' }
                      }
                    },
                    vertical_content_list: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['title'],
                        properties: {
                          title: { type: 'string', description: '竖向内容列表的标题' },
                          desc: { type: 'string', description: '竖向内容列表的描述' }
                        }
                      }
                    },
                    horizontal_content_list: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['keyname'],
                        properties: {
                          keyname: { type: 'string', description: '竖向内容列表的key' },
                          value: { type: 'string', description: '竖向内容列表的value' },
                          url: { type: 'string', description: '竖向内容列表的url' },
                          type: {
                            type: 'number',
                            enum: [0, 1],
                            description:
                              '模版卡片的二级标题信息内容支持的类型，1是url，2是文件附件，3 代表点击跳转成员详情'
                          },
                          media_id: { type: 'string', description: '文件附件的media_id' },
                          userid: { type: 'string', description: '点击跳转成员详情时，需要填入的成员userid' }
                        }
                      }
                    },
                    jump_list: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['title'],
                        properties: {
                          type: { type: 'number', enum: [0, 1], description: '跳转类型，0代表网页，1代表小程序' },
                          url: { type: 'string', description: '跳转的url' },
                          appid: { type: 'string', description: '跳转的小程序appid' },
                          pagepath: { type: 'string', description: '跳转的小程序pagepath' },
                          title: { type: 'string', description: '跳转的标题' }
                        }
                      }
                    },
                    card_action: {
                      type: 'object',
                      required: ['type'],
                      properties: {
                        type: { type: 'number', enum: [0, 1], description: '跳转类型，0代表网页，1代表小程序' },
                        url: { type: 'string', description: '跳转的url' },
                        appid: { type: 'string', description: '跳转的小程序appid' },
                        pagepath: { type: 'string', description: '跳转的小程序pagepath' },
                        title: { type: 'string', description: '跳转的标题' }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }
  ]
}

export const wechatTemplates: WechatTemplate[] = [
  {
    name: '文本消息',
    description: 'Simple text message',
    template: {
      msgtype: 'text',
      text: {
        content: '在这里输入文本消息',
        mentioned_list: ['@all'],
        mentioned_mobile_list: ['@all']
      }
    }
  },
  {
    name: '富文本消息',
    description: 'Rich text message',
    template: {
      msgtype: 'markdown',
      markdown: {
        content: '在这里输入富文本消息'
      }
    }
  },
  {
    name: '图片消息',
    description: 'Image message',
    template: {
      msgtype: 'image',
      image: { base64: 'base64编码的图片', md5: '图片的md5值' }
    }
  },
  {
    name: '图文消息',
    description: 'News message',
    template: {
      msgtype: 'news',
      news: {
        articles: [
          {
            title: '在这里输入标题',
            description: '在这里输入描述',
            url: '在这里输入url',
            picurl: '在这里输入图片url'
          }
        ]
      }
    }
  },
  {
    name: '文件消息',
    description: 'File message',
    template: { msgtype: 'file', file: { media_id: '文件的media_id' } }
  },
  {
    name: '语音消息',
    description: 'Voice message',
    template: { msgtype: 'voice', voice: { media_id: '语音的media_id' } }
  },
  {
    name: '文本模板卡片消息',
    description: 'Template card message',
    template: {
      msgtype: 'template_card',
      template_card: {
        card_type: 'text_notice',
        source: {
          icon_url: '来源图片的url',
          desc: '来源描述',
          desc_color: 0
        },
        main_title: {
          title: '主标题',
          desc: '主标题描述'
        },
        emphasis_content: {
          title: '强调内容标题',
          desc: '强调内容描述'
        },
        quote_area: {
          type: 0,
          url: '引用内容的url',
          appid: '引用内容的小程序appid',
          pagepath: '引用内容的小程序pagepath',
          title: '引用内容的标题',
          quote_text: '引用内容的文本'
        },
        sub_title_text: '二级标题文本',
        horizontal_content_list: [
          {
            keyname: '横向内容列表的key',
            value: '横向内容列表的value'
          }
        ],
        jump_list: [
          {
            type: 0,
            url: '跳转的url',
            appid: '跳转的小程序appid',
            pagepath: '跳转的小程序pagepath',
            title: '跳转的标题'
          }
        ],
        card_action: {
          type: 0,
          url: '跳转的url',
          appid: '跳转的小程序appid',
          pagepath: '跳转的小程序pagepath',
          title: '跳转的标题'
        }
      }
    }
  },
  {
    name: '图文展示模版卡片',
    description: 'News notice template card',
    template: {
      msgtype: 'template_card',
      template_card: {
        card_type: 'news_notice',
        source: {
          icon_url: '来源图片的url',
          desc: '来源描述',
          desc_color: 0
        },
        main_title: {
          title: '主标题',
          desc: '主标题描述'
        },
        card_image: {
          url: '卡片图片的url',
          aspect_ratio: 1.5
        },
        image_text_area: {
          type: 0,
          url: '图片的url',
          title: '图片的标题',
          desc: '图片的描述',
          image_url: '图片的url'
        },
        quote_area: {
          type: 0,
          url: '引用内容的url',
          appid: '引用内容的小程序appid',
          pagepath: '引用内容的小程序pagepath',
          title: '引用内容的标题',
          quote_text: '引用内容的文本'
        },
        vertical_content_list: [
          {
            title: '竖向内容列表的标题',
            desc: '竖向内容列表的描述'
          }
        ],
        horizontal_content_list: [
          {
            keyname: '横向内容列表的key',
            value: '横向内容列表的value'
          }
        ],
        jump_list: [
          {
            type: 0,
            url: '跳转的url',
            appid: '跳转的小程序appid',
            pagepath: '跳转的小程序pagepath',
            title: '跳转的标题'
          }
        ],
        card_action: {
          type: 0,
          url: '跳转的url',
          appid: '跳转的小程序appid',
          pagepath: '跳转的小程序pagepath',
          title: '跳转的标题'
        }
      }
    }
  }
]
