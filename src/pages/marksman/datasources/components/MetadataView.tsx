import React, { useState, useEffect } from "react";
import { Table, Spin } from "antd";
import { type MetricSummaryItem, getDatasourceMetrics } from "@/api/marksman/datasource/index";
import { useLocale } from "@/contexts/LocaleContext";

interface MetadataViewProps {
  /** 数据源 uid，为空时不请求 */
  uid: string | null;
}

const MetadataView: React.FC<MetadataViewProps> = ({ uid }) => {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MetricSummaryItem[]>([]);

  useEffect(() => {
    if (!uid) {
      setData([]);
      return;
    }
    setLoading(true);
    getDatasourceMetrics(uid)
      .then((res) => setData(res.metrics ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) {
    return (
      <div className="p-4 h-full overflow-auto">
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 h-full overflow-auto">
        <div className="text-(--ant-color-text-tertiary) py-4">{t("datasource.metadata.empty")}</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <Table<MetricSummaryItem>
        size="small"
        rowKey={(r) => r.name ?? String(Math.random())}
        dataSource={data}
        columns={[
          { title: t("datasource.metrics.name"), dataIndex: "name", key: "name", ellipsis: true },
          {
            title: t("datasource.metrics.description"),
            dataIndex: "description",
            key: "description",
            ellipsis: true,
          },
          { title: t("datasource.metrics.unit"), dataIndex: "unit", key: "unit", width: 100 },
          { title: t("datasource.metrics.type"), dataIndex: "type", key: "type", width: 120 },
        ]}
        pagination={false}
        scroll={{ y: "calc(100vh - 300px)", x: "800px" }}
      />
    </div>
  );
};

export default MetadataView;
