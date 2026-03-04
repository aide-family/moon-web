import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Button, Space } from "antd";
import type {
  CreateNamespaceParams,
  UpdateNamespaceParams,
  NamespaceItem,
} from "@/api/namespace/index";
import { createNamespace, updateNamespace } from "@/api/namespace/index";
import { useLocale } from "@/contexts/LocaleContext";

interface DetailFormProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: NamespaceItem | null;
  onCancel: () => void;
  /** 成功回调；创建时传入新建的命名空间，便于调用方直接选中 */
  onSuccess: (created?: NamespaceItem) => void;
  /** 为 false 时不可关闭弹窗（无取消按钮、不可点遮罩或右上角关闭） */
  closable?: boolean;
}

const DetailForm: React.FC<DetailFormProps> = ({
  open,
  mode,
  initialData,
  onCancel,
  onSuccess,
  closable = true,
}) => {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 设置表单初始值
  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      form.setFieldsValue({
        name: initialData.name,
        remark: initialData.remark ?? "",
        logo: initialData.logo ?? "",
        metadata: initialData.metadata
          ? JSON.stringify(initialData.metadata, null, 2)
          : "",
        banners: (initialData.banners && initialData.banners.length > 0)
          ? initialData.banners.slice(0, 3).map((url) => ({ url }))
          : [{ url: "" }],
      });
    } else if (open && mode === "create") {
      form.resetFields();
      form.setFieldsValue({ banners: [{ url: "" }] });
    }
  }, [open, mode, initialData, form]);

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 解析元数据
      let metadata: Record<string, unknown> | undefined = undefined;
      if (values.metadata && values.metadata.trim()) {
        try {
          metadata = JSON.parse(values.metadata.trim());
          // 确保解析后是对象
          if (
            typeof metadata !== "object" ||
            metadata === null ||
            Array.isArray(metadata)
          ) {
            message.error(t("message.error"));
            setLoading(false);
            return;
          }
        } catch {
          setLoading(false);
          return;
        }
      }

      const banners: string[] = (values.banners ?? [])
        .map((item: { url?: string }) => item?.url?.trim())
        .filter(Boolean)
        .slice(0, 3);

      if (mode === "create") {
        const params: CreateNamespaceParams = {
          name: values.name,
          remark: values.remark?.trim() || undefined,
          logo: values.logo?.trim() || undefined,
          metadata,
          banners: banners.length > 0 ? banners : undefined,
        };
        const created = await createNamespace(params);
        message.success(t("message.create.success"));
        onSuccess(created);
      } else if (mode === "edit" && initialData) {
        const params: UpdateNamespaceParams = {
          name: values.name,
          remark: values.remark?.trim() || undefined,
          logo: values.logo?.trim() || undefined,
          metadata,
          banners: banners.length > 0 ? banners : undefined,
        };
        await updateNamespace(initialData.uid, params);
        message.success(t("message.update.success"));
        onSuccess();
      } else {
        onSuccess();
      }
      handleCancel();
    } catch (err) {
      console.error("提交失败:", err);
      // 错误信息已由 API 拦截器处理
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        mode === "create"
          ? t("namespace.modal.create.title")
          : t("namespace.modal.edit.title")
      }
      open={open}
      onOk={closable ? handleSubmit : undefined}
      onCancel={closable ? handleCancel : undefined}
      confirmLoading={loading}
      okText={t("common.ok")}
      cancelText={t("common.cancel")}
      width={600}
      destroyOnHidden
      closable={closable}
      maskClosable={closable}
      keyboard={closable}
      footer={
        closable ? undefined : (
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {t("common.ok")}
          </Button>
        )
      }
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label={t("namespace.form.name.label")}
          name="name"
          rules={[
            {
              required: true,
              message: t("namespace.form.name.required"),
            },
            {
              max: 100,
              message: t("namespace.form.name.maxLength"),
            },
          ]}
        >
          <Input placeholder={t("namespace.form.name.placeholder")} />
        </Form.Item>
        <Form.Item label={t("namespace.form.remark.label")} name="remark">
          <Input.TextArea placeholder={t("namespace.form.remark.placeholder")} rows={2} />
        </Form.Item>
        <Form.Item label={t("namespace.form.logo.label")} name="logo">
          <Input placeholder={t("namespace.form.logo.placeholder")} />
        </Form.Item>
        <Form.Item label={t("namespace.form.banners.label")} help={t("namespace.form.banners.help")}>
          <Form.List name="banners">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: "flex", marginBottom: 12 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "url"]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder={t("namespace.form.banners.placeholder")} />
                  </Form.Item>
                  <Button type="link" onClick={() => remove(name)}>
                    {t("common.delete")}
                  </Button>
                </div>
              ))}
              {fields.length < 3 && (
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    {t("namespace.form.banners.add")}
                  </Button>
                </Form.Item>
              )}
            </>
          )}
          </Form.List>
        </Form.Item>
        <Form.Item
          label={t("namespace.form.metadata.label")}
          name="metadata"
          help={t("namespace.form.metadata.help")}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.resolve();
                }
                try {
                  const parsed = JSON.parse(value.trim());
                  if (
                    typeof parsed !== "object" ||
                    parsed === null ||
                    Array.isArray(parsed)
                  ) {
                    return Promise.reject(
                      new Error(t("namespace.form.metadata.invalid")),
                    );
                  }
                  return Promise.resolve();
                } catch {
                  return Promise.reject(
                    new Error(t("namespace.form.metadata.invalid")),
                  );
                }
              },
            },
          ]}
        >
          <Input.TextArea
            placeholder={t("namespace.form.metadata.placeholder")}
            rows={6}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DetailForm;
