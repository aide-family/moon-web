import { FC } from "react"
import type {
  InputProps,
  SelectProps,
  RadioProps,
  RadioGroupProps,
  SegmentedProps,
  CheckboxProps,
  DatePickerProps,
  ColorPickerProps,
} from "antd"
import {
  Select,
  Radio,
  Checkbox,
  DatePicker,
  Input,
  ColorPicker,
  Segmented,
} from "antd"
import { RangePickerProps } from "antd/es/date-picker"
import { PasswordProps, TextAreaProps } from "antd/es/input"
import { AnnotationEditorProps, AnnotationEditor } from "./annotation-editor"
import {
  DingTemplateEditorProps,
  DingTemplateEditor,
} from "./ding-template-editor"
import {
  EmailTemplateEditorProps,
  EmailTemplateEditor,
} from "./eamil-template-editor"
import {
  FeishuTemplateEditorProps,
  FeishuTemplateEditor,
} from "./feishu-template-editor"
import FetchSelect, { FetchSelectProps } from "./fetch-select"
import {
  JsonTemplateEditorProps,
  JsonTemplateEditor,
} from "./json-template-editor"
import { TimeUintInputProps, TimeUintInput } from "./time-value"
import {
  WechatTemplateEditorProps,
  WechatTemplateEditor,
} from "./wechat-template-editor"

export type DataInputProps =
  | {
      type: "input"
      props?: InputProps
    }
  | {
      type: "time-range"
      props?: RangePickerProps
    }
  | {
      type: "password"
      props?: PasswordProps
    }
  | {
      type: "select"
      props?: SelectProps
    }
  | {
      type: "select-fetch"
      props?: FetchSelectProps
    }
  | {
      type: "radio"
      props?: RadioProps
    }
  | {
      type: "radio-group"
      props?: RadioGroupProps
    }
  | {
      type: "segmented"
      props: SegmentedProps & React.RefAttributes<HTMLDivElement>
    }
  | {
      type: "checkbox"
      props?: CheckboxProps
    }
  | {
      type: "date"
      props?: DatePickerProps
    }
  | {
      type: "time-value"
      props: TimeUintInputProps
    }
  | {
      type: "textarea"
      props?: TextAreaProps
    }
  | {
      type: "color"
      props?: ColorPickerProps
    }
  | {
      type: "email-template-editor"
      props?: EmailTemplateEditorProps
    }
  | {
      type: "wechat-template-editor"
      props?: WechatTemplateEditorProps
    }
  | {
      type: "json-template-editor"
      props?: JsonTemplateEditorProps
    }
  | {
      type: "feishu-template-editor"
      props?: FeishuTemplateEditorProps
    }
  | {
      type: "ding-template-editor"
      props?: DingTemplateEditorProps
    }
  | {
      type: "annotation-template-editor"
      props?: AnnotationEditorProps
    }

export const DataInput: FC<DataInputProps> = (props) => {
  const { type } = props

  const renderInput = () => {
    switch (type) {
      case "select":
        return <Select {...props.props} />
      case "select-fetch":
        return <FetchSelect {...props.props} />
      case "radio":
        return <Radio {...props.props} />
      case "checkbox":
        return <Checkbox {...props.props} />
      case "date":
        return <DatePicker {...props.props} />
      case "time-value":
        return <TimeUintInput {...props.props} />
      case "radio-group":
        return <Radio.Group {...props.props} />
      case "password":
        return <Input.Password autoComplete='off' allowClear {...props.props} />
      case "textarea":
        return <Input.TextArea autoComplete='off' {...props.props} />
      case "color":
        return <ColorPicker allowClear {...props.props} />
      case "time-range":
        return <DatePicker.RangePicker {...props.props} />
      case "segmented":
        return <Segmented {...props.props} />
      case "email-template-editor":
        return <EmailTemplateEditor {...props.props} />
      case "wechat-template-editor":
        return <WechatTemplateEditor {...props.props} />
      case "json-template-editor":
        return <JsonTemplateEditor {...props.props} />
      case "feishu-template-editor":
        return <FeishuTemplateEditor {...props.props} />
      case "ding-template-editor":
        return <DingTemplateEditor {...props.props} />
      case "annotation-template-editor":
        return <AnnotationEditor {...props.props} />
      default:
        return <Input autoComplete='off' allowClear {...props.props} />
    }
  }

  return <>{renderInput()}</>
}
