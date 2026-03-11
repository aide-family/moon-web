import React, { useState, useEffect } from "react";
import { Avatar, Spin, Tag, Typography, theme } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { useLocale } from "@/contexts/LocaleContext";
import PageContent from "@/components/layout/PageContent";
import { getSelfInfo } from "@/api/self";
import type { SelfInfo } from "@/api/self/types";
import { parseUserStatus } from "@/api/user";

const { Title, Text } = Typography;

const STATUS_TEXT_KEYS: Record<string, string> = {
  UserStatus_UNKNOWN: "user.status.UserStatus_UNKNOWN",
  ACTIVE: "user.status.ACTIVE",
  BANNED: "user.status.BANNED",
};
const STATUS_COLORS: Record<string, string> = {
  UserStatus_UNKNOWN: "default",
  ACTIVE: "success",
  BANNED: "error",
};
const DEFAULT_STATUS_KEY = "user.status.UserStatus_UNKNOWN";

const ProfilePage: React.FC = () => {
  const { t } = useLocale();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SelfInfo | null>(null);

  useEffect(() => {
    getSelfInfo()
      .then((data) => setInfo(data ?? null))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContent>
        <div className="flex items-center justify-center min-h-[320px] w-full">
          <Spin size="large" tip={t("common.loading")} />
        </div>
      </PageContent>
    );
  }

  const displayName = info?.nickname || info?.name || "-";
  const statusRaw = info?.status != null ? String(info.status) : undefined;
  const parsedStatus = parseUserStatus(statusRaw);
  const statusTextKey = STATUS_TEXT_KEYS[parsedStatus] ?? DEFAULT_STATUS_KEY;
  const statusDisplay = info?.status != null ? t(statusTextKey) : undefined;

  const statusColor = STATUS_COLORS[parsedStatus] ?? "default";
  const emptyPlaceholder = "-";
  const fill = (v: string | undefined) => (v !== undefined && v !== "" ? v : emptyPlaceholder);
  const allItems: { key: string; label: string; value: string; tagColor?: string }[] = [
    { key: "name", label: t("profile.name"), value: fill(info?.name) },
    { key: "nickname", label: t("profile.nickname"), value: fill(info?.nickname) },
    { key: "email", label: t("self.email"), value: fill(info?.email) },
    { key: "phone", label: t("profile.phone"), value: fill(info?.phone) },
    { key: "status", label: t("profile.status"), value: fill(statusDisplay), tagColor: statusColor },
    { key: "createdAt", label: t("profile.createdAt"), value: fill(info?.createdAt) },
    { key: "updatedAt", label: t("profile.updatedAt"), value: fill(info?.updatedAt) },
    { key: "remark", label: t("profile.remark"), value: fill(info?.remark) },
  ];

  const renderRows = (items: { key: string; label: string; value: string; tagColor?: string }[]) =>
    items.map(({ key, label, value, tagColor }) => (
      <div key={key} className="flex py-2.5">
        <span className="w-28 shrink-0 text-gray-500 dark:text-gray-400">{label}</span>
        <span className="min-w-0">
          {tagColor ? <Tag color={tagColor}>{value}</Tag> : value}
        </span>
      </div>
    ));

  return (
    <PageContent>
    <div className="w-full min-h-full p-6 md:p-8 box-border">
      {/* 头像 + 姓名 */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
        <Avatar
          size={96}
          icon={<UserOutlined />}
          src={info?.avatar}
          className="shrink-0"
        />
        <div className="flex-1 text-center sm:text-left min-w-0">
          <Title level={4} className="mb-1! font-semibold!">
            {displayName}
          </Title>
          {info?.email && (
            <Text type="secondary" className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <MailOutlined />
              {info.email}
            </Text>
          )}
        </div>
      </div>

      {/* 基本信息 + 账户信息 */}
      <section>
        <div
          className="rounded-lg px-4 py-2"
          style={{ background: token.colorFillTertiary }}
        >
          {renderRows(allItems)}
        </div>
      </section>
    </div>
    </PageContent>
  );
};

export default ProfilePage;
