import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, App, Descriptions, Divider, Space, Spin, Tag } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { getStrategyDetail } from "@/api/strategy/index";
import type { StrategyItem } from "@/api/strategy/index";
import { GlobalStatus } from "@/api";
import { useLocale } from "@/contexts/LocaleContext";
import PageContent from "@/components/layout/PageContent";
import DetailForm from "./components/DetailForm";
import MetricsDetailContent from "./components/MetricsDetailContent";

const empty = (v: unknown) => (v == null || v === "" ? "-" : String(v));

function getTypeLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === "") return "-";
  return t(`datasource.type.${value}`) || value;
}
function getDriverLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === "") return "-";
  return t(`datasource.driver.${value}`) || value;
}

function normalizeStatus(status: string | undefined): GlobalStatus {
  if (status === GlobalStatus.ENABLED) return GlobalStatus.ENABLED;
  if (status === GlobalStatus.DISABLED) return GlobalStatus.DISABLED;
  return GlobalStatus.UNKNOWN;
}

const statusMap: Record<GlobalStatus, { text: string; color: string }> = {
  [GlobalStatus.UNKNOWN]: { text: "table.unknown", color: "default" },
  [GlobalStatus.ENABLED]: { text: "table.enable", color: "success" },
  [GlobalStatus.DISABLED]: { text: "table.disable", color: "error" },
};

const labelWidth = 140;

export default function StrategyDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  /** 类型从外部传入（如列表跳转时的 state.type），用于决定调用 getStrategyDetail 还是 getStrategyMetric */
  const typeFromOuter = (location.state as { type?: string } | null)?.type;

  const [data, setData] = useState<StrategyItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<StrategyItem | null>(null);

  useEffect(() => {
    if (!uid) {
      queueMicrotask(() => {
        setData(null);
        setLoading(false);
      });
      return;
    }
    // METRICS 类型由 MetricsDetailContent 内部拉取，页面不拉数
    if (typeFromOuter === "METRICS") {
      queueMicrotask(() => {
        setData(null);
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    if (typeFromOuter != null && typeFromOuter !== "METRICS") {
      // 类型从外部明确为非 METRICS：只调 getStrategyDetail
      getStrategyDetail(uid)
        .then((detailRes) => {
          if (cancelled) return;
          setData(detailRes);
        })
        .catch(() => {
          if (!cancelled) setData(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      // 类型未从外部传入（如直链）：先 getStrategyDetail，若为 METRICS 由子组件自己拉数
      getStrategyDetail(uid)
        .then((detailRes) => {
          if (cancelled) return;
          setData(detailRes);
        })
        .catch(() => {
          if (!cancelled) setData(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [uid, typeFromOuter]);

  const handleBack = () => {
    navigate("/strategies");
  };

  const handleEdit = (item: StrategyItem) => {
    setEditingData(item);
    setDetailFormOpen(true);
  };

  const handleFormSuccess = () => {
    setDetailFormOpen(false);
    setEditingData(null);
    if (uid) {
      setLoading(true);
      getStrategyDetail(uid)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      );
    }
    // METRICS 详情（数据 + 弹窗）在组件内部拉取与管理
    if (uid && (typeFromOuter === "METRICS" || data?.type === "METRICS")) {
      return <MetricsDetailContent strategyUID={uid} />;
    }
    if (!data) {
      return <div style={{ textAlign: "center", padding: "40px 0" }}>{t("common.noData")}</div>;
    }

    const s = normalizeStatus(data.status);
    const info = statusMap[s];

    return (
      <div className="space-y-6">
        {/* 非 METRICS：仅基础信息 */}
        <div>
          <Divider titlePlacement="left" orientationMargin={0}>
            <Space>
              <span className="text-sm font-medium">{t("strategy.detail.section.basic")}</span>
              <Button type="link" size="small" onClick={() => data && handleEdit(data)} icon={<EditOutlined />} />
            </Space>
          </Divider>
          <Descriptions
            column={2}
            bordered
            size="small"
            styles={{ label: { width: labelWidth, minWidth: labelWidth } }}
          >
            <Descriptions.Item label={t("strategy.detail.name")}>
              <Space>
                <span>{empty(data.name)}</span>
                <Tag color={info.color}>{t(info.text)}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("strategy.detail.type")}>{getTypeLabel(data.type, t)}</Descriptions.Item>
            <Descriptions.Item label={t("strategy.detail.remark")} span={2}>
              {empty(data.remark)}
            </Descriptions.Item>
            <Descriptions.Item label={t("strategy.detail.metadata")} span={2}>
              {data.metadata && Object.keys(data.metadata).length > 0 ? (
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(data.metadata, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t("strategy.detail.driver")}>{getDriverLabel(data.driver, t)}</Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    );
  };

  return (
    <App className="h-full">
      <PageContent>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 shrink-0">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
              {t("common.back")}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">{renderBody()}</div>
          </div>
        </div>

        <DetailForm
          open={detailFormOpen}
          mode="edit"
          initialData={editingData}
          onCancel={() => {
            setDetailFormOpen(false);
            setEditingData(null);
          }}
          onSuccess={handleFormSuccess}
        />
      </PageContent>
    </App>
  );
}
