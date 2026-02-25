import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  AutoComplete,
  App,
  message,
  Row,
  Col,
} from "antd";
import {
  sendEmail,
  sendEmailWithTemplate,
  sendWebhook,
  sendWebhookWithTemplate,
} from "@/api/sender";
import { getEmailConfigSelectList } from "@/api/email";
import type { EmailItemSelect } from "@/api/email";
import { getWebhookConfigSelectList } from "@/api/webhook";
import type { WebhookItemSelect } from "@/api/webhook";
import { getTemplateSelectList } from "@/api/template";
import type { TemplateItemSelect } from "@/api/template";
import { MessageType } from "@/api/types";
import { useLocale } from "@/contexts/LocaleContext";

type SendType = "email" | "emailTemplate" | "webhook" | "webhookTemplate";

const SEND_TYPES: { value: SendType; labelKey: string }[] = [
  { value: "email", labelKey: "sender.type.email" },
  { value: "emailTemplate", labelKey: "sender.type.emailTemplate" },
  { value: "webhook", labelKey: "sender.type.webhook" },
  { value: "webhookTemplate", labelKey: "sender.type.webhookTemplate" },
];

/** Webhook 模板类型选项（用于发送 Webhook 模板时先选类型再选模板） */
const WEBHOOK_TEMPLATE_TYPES: MessageType[] = [
  MessageType.WEBHOOK_OTHER,
  MessageType.WEBHOOK_DINGTALK,
  MessageType.WEBHOOK_WECHAT,
  MessageType.WEBHOOK_FEISHU,
];

export default function SenderManagement() {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [sendType, setSendType] = useState<SendType>("email");
  const [submitting, setSubmitting] = useState(false);
  const [templateOptions, setTemplateOptions] = useState<TemplateItemSelect[]>(
    [],
  );
  const [templateLoading, setTemplateLoading] = useState(false);
  const [emailConfigOptions, setEmailConfigOptions] = useState<
    EmailItemSelect[]
  >([]);
  const [emailConfigLoading, setEmailConfigLoading] = useState(false);
  const [emailConfigKeyword, setEmailConfigKeyword] = useState("");
  const emailConfigSearchTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [webhookConfigOptions, setWebhookConfigOptions] = useState<
    WebhookItemSelect[]
  >([]);
  const [webhookConfigLoading, setWebhookConfigLoading] = useState(false);
  const [webhookConfigKeyword, setWebhookConfigKeyword] = useState("");
  const webhookConfigSearchTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [webhookTemplateType, setWebhookTemplateType] = useState<
    MessageType | undefined
  >(undefined);

  const needTemplate =
    sendType === "emailTemplate" || sendType === "webhookTemplate";
  const needEmailConfig = sendType === "email" || sendType === "emailTemplate";
  const needWebhookConfig =
    sendType === "webhook" || sendType === "webhookTemplate";

  useEffect(() => {
    if (sendType !== "webhookTemplate") setWebhookTemplateType(undefined);
  }, [sendType]);

  const handleEmailConfigSearch = useCallback((value: string) => {
    if (emailConfigSearchTimerRef.current)
      clearTimeout(emailConfigSearchTimerRef.current);
    emailConfigSearchTimerRef.current = setTimeout(() => {
      setEmailConfigKeyword(value);
    }, 300);
  }, []);

  const handleWebhookConfigSearch = useCallback((value: string) => {
    if (webhookConfigSearchTimerRef.current)
      clearTimeout(webhookConfigSearchTimerRef.current);
    webhookConfigSearchTimerRef.current = setTimeout(() => {
      setWebhookConfigKeyword(value);
    }, 300);
  }, []);

  const fetchWebhookConfigOptions = useCallback((keyword?: string) => {
    setWebhookConfigLoading(true);
    getWebhookConfigSelectList({
      keyword: keyword?.trim() || undefined,
      limit: 20,
    })
      .then((res) => setWebhookConfigOptions(res.items ?? []))
      .catch(() => setWebhookConfigOptions([]))
      .finally(() => setWebhookConfigLoading(false));
  }, []);

  useEffect(() => {
    if (!needWebhookConfig) return;
    fetchWebhookConfigOptions(webhookConfigKeyword);
  }, [needWebhookConfig, webhookConfigKeyword, fetchWebhookConfigOptions]);

  const handleWebhookTemplateTypeChange = useCallback(
    (value: MessageType | undefined) => {
      setWebhookTemplateType(value);
      form.setFieldValue("templateUID", undefined);
    },
    [form],
  );

  useEffect(() => {
    if (!needTemplate) return;
    if (sendType === "webhookTemplate" && !webhookTemplateType) {
      setTemplateOptions([]);
      return;
    }
    setTemplateLoading(true);
    const params =
      sendType === "emailTemplate"
        ? { limit: 20, messageType: MessageType.EMAIL }
        : { limit: 20, messageType: webhookTemplateType! };
    getTemplateSelectList(params)
      .then((res) => setTemplateOptions(res.items ?? []))
      .catch(() => setTemplateOptions([]))
      .finally(() => setTemplateLoading(false));
  }, [needTemplate, sendType, webhookTemplateType]);

  const fetchEmailConfigOptions = useCallback((keyword?: string) => {
    setEmailConfigLoading(true);
    getEmailConfigSelectList({
      keyword: keyword?.trim() || undefined,
      limit: 100,
    })
      .then((res) => setEmailConfigOptions(res.items ?? []))
      .catch(() => setEmailConfigOptions([]))
      .finally(() => setEmailConfigLoading(false));
  }, []);

  useEffect(() => {
    if (!needEmailConfig) return;
    fetchEmailConfigOptions(emailConfigKeyword);
  }, [needEmailConfig, emailConfigKeyword, fetchEmailConfigOptions]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const uid = values.uid?.trim();
      if (!uid) {
        message.warning(t("sender.form.uidPlaceholder"));
        return;
      }
      setSubmitting(true);
      switch (sendType) {
        case "email": {
          const toStr = values.to?.trim();
          const ccStr = values.cc?.trim();
          const headersList = (values.headers ?? []) as { key?: string; value?: string }[];
          const headers: Record<string, string> | undefined =
            headersList.length > 0
              ? Object.fromEntries(
                  headersList
                    .filter((h) => (h.key ?? "").trim())
                    .map((h) => [(h.key ?? "").trim(), (h.value ?? "").trim()]),
                )
              : undefined;
          await sendEmail(uid, {
            uid,
            subject: values.subject?.trim() ?? "",
            body: values.body?.trim() ?? "",
            contentType: values.contentType?.trim(),
            to: toStr
              ? toStr
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : undefined,
            cc: ccStr
              ? ccStr
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : undefined,
            headers,
          });
          break;
        }
        case "emailTemplate": {
          const toStr = values.to?.trim();
          const ccStr = values.cc?.trim();
          await sendEmailWithTemplate(uid, {
            templateUID: values.templateUID?.trim(),
            jsonData: values.jsonData?.trim(),
            to: toStr
              ? toStr
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : undefined,
            cc: ccStr
              ? ccStr
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : undefined,
          });
          break;
        }
        case "webhook":
          await sendWebhook(uid, { data: values.data?.trim() });
          break;
        case "webhookTemplate":
          await sendWebhookWithTemplate(uid, {
            templateUID: values.templateUID?.trim(),
            jsonData: values.jsonData?.trim(),
          });
          break;
        default:
          break;
      }
      message.success(t("sender.success"));
      form.resetFields();
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }
      console.error("发送失败:", error);
      message.error(t("sender.error"));
    } finally {
      setSubmitting(false);
    }
  };

  /** 四种发送方式各自的表单项渲染 */
  const renderUidEmail = () => (
    <Form.Item
      name="uid"
      label={t("sender.form.uidEmail")}
      rules={[
        { required: true, message: t("sender.form.uidEmailPlaceholder") },
      ]}
    >
      <Select
        placeholder={t("sender.form.uidEmailPlaceholder")}
        allowClear
        showSearch={{ onSearch: handleEmailConfigSearch }}
        loading={emailConfigLoading}
        options={emailConfigOptions
          .filter(
            (item) =>
              (item.value ?? (item as unknown as { uid?: string }).uid) != null,
          )
          .map((item) => {
            const value =
              item.value ?? (item as unknown as { uid?: string }).uid ?? "";
            const label =
              item.label ??
              (item as unknown as { name?: string }).name ??
              value;
            return {
              value,
              label,
              disabled: item.disabled,
              title: item.tooltip,
            };
          })}
      />
    </Form.Item>
  );

  const renderUidWebhook = () => (
    <Form.Item
      name="uid"
      label={t("sender.form.uidWebhook")}
      rules={[
        { required: true, message: t("sender.form.uidWebhookPlaceholder") },
      ]}
    >
      <Select
        placeholder={t("sender.form.uidWebhookPlaceholder")}
        allowClear
        showSearch={{ onSearch: handleWebhookConfigSearch }}
        loading={webhookConfigLoading}
        options={webhookConfigOptions
          .filter(
            (item) =>
              (item.value ?? (item as unknown as { uid?: string }).uid) != null,
          )
          .map((item) => {
            const value =
              item.value ?? (item as unknown as { uid?: string }).uid ?? "";
            const label =
              item.label ??
              (item as unknown as { name?: string }).name ??
              value;
            return {
              value,
              label,
              disabled: item.disabled,
              title: item.tooltip,
            };
          })}
      />
    </Form.Item>
  );

  return (
    <App className="h-full min-h-0 flex flex-col">
      <div className="flex flex-1 min-h-0 gap-4">
        {/* 左侧：发送方式 */}
        <Card
          className="w-48 shrink-0 overflow-auto"
          title={t("sender.sendType")}
          styles={{ body: { padding: "12px" } }}
        >
          <div className="flex flex-col gap-2">
            {SEND_TYPES.map(({ value, labelKey }) => (
              <div
                key={value}
                onClick={() => {
                  if (value !== sendType) {
                    setSendType(value);
                    form.resetFields();
                  }
                }}
                className={`
                  w-full text-left px-3 py-2.5 rounded-md transition-colors
                  ${
                    sendType === value
                      ? "bg-(--ant-color-primary-bg) text-(--ant-color-primary)"
                      : "bg-transparent hover:bg-(--ant-color-fill-tertiary)"
                  }
                `}
              >
                {t(labelKey)}
              </div>
            ))}
          </div>
        </Card>

        {/* 右侧：表单 */}
        <Card className="flex-1 min-w-0 min-h-0 overflow-auto">
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              loading={submitting}
              onClick={() => form.submit()}
            >
              {t("sender.submit")}
            </Button>
          </div>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* 1. 邮件 - 直接发送 */}
            {sendType === "email" && (
              <>
                <Row gutter={16}>
                  <Col span={12}>{renderUidEmail()}</Col>
                  <Col span={12}>
                    <Form.Item
                      name="subject"
                      label={t("sender.form.subject")}
                      rules={[
                        {
                          required: true,
                          message: t("sender.form.subjectPlaceholder"),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t("sender.form.subjectPlaceholder")}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="contentType"
                      label={t("sender.form.contentType")}
                    >
                      <AutoComplete
                        placeholder={t("sender.form.contentTypePlaceholder")}
                        allowClear
                        options={[
                          { value: "text/plain", label: "text/plain" },
                          { value: "text/html", label: "text/html" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item name="to" label={t("sender.form.to")}>
                      <Input
                        placeholder={t("sender.form.toPlaceholder")}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="cc" label={t("sender.form.cc")}>
                  <Input
                    placeholder={t("sender.form.ccPlaceholder")}
                    allowClear
                  />
                </Form.Item>
                <Form.Item label={t("sender.form.headers")}>
                  <Form.List name="headers">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...rest }) => (
                          <Row key={key} gutter={8} align="middle" className="mb-2">
                            <Col flex="1">
                              <Form.Item
                                {...rest}
                                name={[name, "key"]}
                                rules={[{ required: true, message: t("sender.form.headerKeyRequired") }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input
                                  placeholder={t("sender.form.headerKeyPlaceholder")}
                                  allowClear
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1">
                              <Form.Item
                                {...rest}
                                name={[name, "value"]}
                                style={{ marginBottom: 0 }}
                                rules={[{ required: true, message: t("sender.form.headerValueRequired") }]}
                              >
                                <Input
                                  placeholder={t("sender.form.headerValuePlaceholder")}
                                  allowClear
                                />
                              </Form.Item>
                            </Col>
                            <Col>
                              <Button
                                type="text"
                                danger
                                onClick={() => remove(name)}
                              >
                                {t("sender.form.headerRemove")}
                              </Button>
                            </Col>
                          </Row>
                        ))}
                        <Button type="dashed" onClick={() => add()} block>
                          {t("sender.form.headersAdd")}
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
                <Form.Item
                  name="body"
                  label={t("sender.form.body")}
                  rules={[
                    {
                      required: true,
                      message: t("sender.form.bodyPlaceholder"),
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder={t("sender.form.bodyPlaceholder")}
                    rows={8}
                    allowClear
                  />
                </Form.Item>
              </>
            )}

            {/* 2. 邮件 - 模板发送 */}
            {sendType === "emailTemplate" && (
              <>
                {renderUidEmail()}
                <Form.Item
                  name="templateUID"
                  label={t("sender.form.templateUID")}
                >
                  <Select
                    placeholder={t("sender.form.templateUIDPlaceholder")}
                    allowClear
                    showSearch
                    loading={templateLoading}
                    options={templateOptions
                      .filter((item) => item.value != null)
                      .map((item) => ({
                        value: item.value!,
                        label: item.label ?? item.value,
                        disabled: item.disabled,
                        title: item.tooltip,
                      }))}
                  />
                </Form.Item>
                <Form.Item name="jsonData" label={t("sender.form.jsonData")}>
                  <Input.TextArea
                    placeholder={t("sender.form.jsonDataPlaceholder")}
                    rows={8}
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="to" label={t("sender.form.to")}>
                  <Input
                    placeholder={t("sender.form.toPlaceholder")}
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="cc" label={t("sender.form.cc")}>
                  <Input
                    placeholder={t("sender.form.ccPlaceholder")}
                    allowClear
                  />
                </Form.Item>
              </>
            )}

            {/* 3. Webhook - 直接发送 */}
            {sendType === "webhook" && (
              <>
                {renderUidWebhook()}
                <Form.Item name="data" label={t("sender.form.data")}>
                  <Input.TextArea
                    placeholder={t("sender.form.dataPlaceholder")}
                    rows={8}
                    allowClear
                  />
                </Form.Item>
              </>
            )}

            {/* 4. Webhook - 模板发送 */}
            {sendType === "webhookTemplate" && (
              <>
                {renderUidWebhook()}
                <Form.Item label={t("sender.form.templateType")}>
                  <Select<MessageType>
                    placeholder={t("sender.form.templateTypePlaceholder")}
                    allowClear
                    value={webhookTemplateType}
                    onChange={handleWebhookTemplateTypeChange}
                    options={WEBHOOK_TEMPLATE_TYPES.map((type) => ({
                      value: type,
                      label: t(`messageType.${type}`),
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="templateUID"
                  label={t("sender.form.templateUID")}
                >
                  <Select
                    placeholder={t("sender.form.templateUIDPlaceholder")}
                    allowClear
                    showSearch
                    loading={templateLoading}
                    disabled={!webhookTemplateType}
                    options={templateOptions
                      .filter((item) => item.value != null)
                      .map((item) => ({
                        value: item.value!,
                        label: item.label ?? item.value,
                        disabled: item.disabled,
                        title: item.tooltip,
                      }))}
                  />
                </Form.Item>
                <Form.Item name="jsonData" label={t("sender.form.jsonData")}>
                  <Input.TextArea
                    placeholder={t("sender.form.jsonDataPlaceholder")}
                    rows={8}
                    allowClear
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </Card>
      </div>
    </App>
  );
}
