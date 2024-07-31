/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react'
import type {
  InputProps,
  SelectProps,
  RadioProps,
  RadioGroupProps,
  SegmentedProps,
  CheckboxProps,
  DatePickerProps,
  ColorPickerProps
} from 'antd'
import { Select, Radio, Checkbox, DatePicker, Input, ColorPicker, Segmented } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import { PasswordProps, TextAreaProps } from 'antd/es/input'
import { AnnotationsEditorProps, AnnotationsEditor } from './annotation-editor'
import { DingTemplateEditorProps, DingTemplateEditor } from './ding-template-editor'
import { EmailTemplateEditorProps, EmailTemplateEditor } from './eamil-template-editor'
import { FeishuTemplateEditorProps, FeishuTemplateEditor } from './feishu-template-editor'
import FetchSelect, { FetchSelectProps } from './fetch-select'
import { JsonTemplateEditorProps, JsonTemplateEditor } from './json-template-editor'
import { TimeUintInputProps, TimeUintInput } from './time-value'
import { WechatTemplateEditorProps, WechatTemplateEditor } from './wechat-template-editor'
import { JsonInputEditor, JsonInputEditorProps } from './json-input'

export type DataInputProps = {
  value?: any
  onChange?: (value: any) => void
  defaultValue?: any
} & (
  | {
      type: 'input'
      props?: InputProps
    }
  | {
      type: 'time-range'
      props?: RangePickerProps
    }
  | {
      type: 'password'
      props?: PasswordProps
    }
  | {
      type: 'select'
      props?: SelectProps
    }
  | {
      type: 'select-fetch'
      props?: FetchSelectProps
    }
  | {
      type: 'radio'
      props?: RadioProps
    }
  | {
      type: 'radio-group'
      props?: RadioGroupProps
    }
  | {
      type: 'segmented'
      props: SegmentedProps & React.RefAttributes<HTMLDivElement>
    }
  | {
      type: 'checkbox'
      props?: CheckboxProps
    }
  | {
      type: 'date'
      props?: DatePickerProps
    }
  | {
      type: 'time-value'
      props: TimeUintInputProps
    }
  | {
      type: 'textarea'
      props?: TextAreaProps
    }
  | {
      type: 'color'
      props?: ColorPickerProps
    }
  | {
      type: 'email-template-editor'
      props?: EmailTemplateEditorProps
    }
  | {
      type: 'wechat-template-editor'
      props?: WechatTemplateEditorProps
    }
  | {
      type: 'json-template-editor'
      props?: JsonTemplateEditorProps
    }
  | {
      type: 'json-input'
      props?: JsonInputEditorProps
    }
  | {
      type: 'feishu-template-editor'
      props?: FeishuTemplateEditorProps
    }
  | {
      type: 'ding-template-editor'
      props?: DingTemplateEditorProps
    }
  | {
      type: 'annotation-template-editor'
      props?: AnnotationsEditorProps
    }
)

export const DataInput: FC<DataInputProps> = (props) => {
  const { type, value, onChange, defaultValue } = props

  const renderInput = () => {
    switch (type) {
      case 'select':
        return <Select {...props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'select-fetch':
        return <FetchSelect {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'radio':
        return <Radio {...props.props} value={value} defaultChecked={defaultValue} onChange={onChange} />
      case 'checkbox':
        return <Checkbox {...props.props} value={value} defaultChecked={defaultValue} onChange={onChange} />
      case 'date':
        return <DatePicker {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'time-value':
        // TODO 处理数据绑定
        return <TimeUintInput {...props.props} />
      case 'radio-group':
        return <Radio.Group {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'password':
        return (
          <Input.Password
            autoComplete='off'
            allowClear
            {...props.props}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
          />
        )
      case 'textarea':
        return (
          <Input.TextArea
            autoComplete='off'
            {...props.props}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
          />
        )
      case 'color':
        return <ColorPicker allowClear {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'time-range':
        return <DatePicker.RangePicker {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'segmented':
        return <Segmented {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'email-template-editor':
        return <EmailTemplateEditor {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'wechat-template-editor':
        return <WechatTemplateEditor {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'json-template-editor':
        return <JsonTemplateEditor {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'feishu-template-editor':
        return <FeishuTemplateEditor {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'ding-template-editor':
        return <DingTemplateEditor {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      case 'annotation-template-editor':
        return <AnnotationsEditor {...props.props} value={value} onChange={onChange} />
      case 'json-input':
        return <JsonInputEditor {...props.props} value={value} defaultValue={defaultValue} onChange={onChange} />
      default:
        return (
          <Input
            autoComplete='off'
            allowClear
            {...props.props}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
          />
        )
    }
  }

  return <>{renderInput()}</>
}
