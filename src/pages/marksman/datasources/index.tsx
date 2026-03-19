import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, message, App, Dropdown, Spin, Tabs } from "antd";
import type { MenuProps } from "antd";
import {
  type DatasourceItem,
  type DatasourceListParams,
  getDatasourceList,
  getDatasourceDetail,
  deleteDatasource,
} from "@/api/marksman/datasource/index";
import DetailForm from "./components/DetailForm";
import DetailView from "./components/DetailView";
import MetadataView from "./components/MetadataView";
import { EllipsisOutlined } from "@ant-design/icons";
import { useLocale } from "@/contexts/LocaleContext";
import PageContent from "@/components/layout/PageContent";
import { getTypeLabel, getDriverLabel } from "@/utils/marksman";

const defaultSearchParams: DatasourceListParams = {
  keyword: "",
};

const DatasourceList: React.FC = () => {
  const { modal } = App.useApp();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DatasourceItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchParams, setSearchParams] = useState<DatasourceListParams>(defaultSearchParams);
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [detailFormMode, setDetailFormMode] = useState<"create" | "edit">("create");
  const [editingData, setEditingData] = useState<DatasourceItem | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [viewingData, setViewingData] = useState<DatasourceItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 20;
  const hasMore = dataSource.length < pagination.total && pagination.total > 0;

  const fetchData = useCallback(
    async (page: number, append: boolean, override?: Partial<DatasourceListParams>) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const effective = override ? { ...searchParams, ...override } : searchParams;
        const params: DatasourceListParams = {
          page,
          pageSize,
          keyword: effective.keyword || undefined,
          type: effective.type,
          driver: effective.driver,
          status: effective.status,
        };
        const response = await getDatasourceList(params);
        if (response) {
          const items = response.items ?? [];
          const total = parseInt(String(response.total ?? "0"), 10);
          if (append) {
            setDataSource((prev) => [...prev, ...items]);
          } else {
            setDataSource(items);
            if (items.length > 0 && items[0].uid) {
              setSelectedUid(items[0].uid);
              setViewingData(null);
              setDetailLoading(true);
              getDatasourceDetail(items[0].uid)
                .then(setViewingData)
                .catch(() => {})
                .finally(() => setDetailLoading(false));
            } else {
              setSelectedUid(null);
              setViewingData(null);
            }
          }
          setPagination((prev) => ({ ...prev, current: page, pageSize, total }));
        }
      } catch (error) {
        console.error("获取数据源列表失败:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchParams.keyword, searchParams.type, searchParams.driver, searchParams.status],
  );

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchData(pagination.current + 1, true);
  }, [loading, loadingMore, hasMore, pagination, fetchData]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const threshold = 80;
      if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
        loadMore();
      }
    },
    [loadMore],
  );

  const handleSearch = (override?: Partial<DatasourceListParams>) => {
    if (override) setSearchParams((prev) => ({ ...prev, ...override }));
    setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
    fetchData(1, false, override);
  };

  const handleAdd = () => {
    setDetailFormMode("create");
    setEditingData(null);
    setDetailFormOpen(true);
  };

  const handleSelectItem = async (record: DatasourceItem) => {
    if (!record.uid) return;
    setSelectedUid(record.uid);
    setViewingData(null);
    setDetailLoading(true);
    try {
      const data = await getDatasourceDetail(record.uid);
      setViewingData(data);
    } catch (error) {
      console.error("获取数据源详情失败:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = (record: DatasourceItem) => {
    setDetailFormMode("edit");
    setEditingData(record);
    setDetailFormOpen(true);
  };

  const handleEditFromDetail = (data: DatasourceItem) => {
    setDetailFormMode("edit");
    setEditingData(data);
    setDetailFormOpen(true);
  };

  const handleDelete = async (record: DatasourceItem) => {
    if (!record.uid) return;
    try {
      await deleteDatasource(record.uid);
      message.success(t("message.delete.success"));
      if (selectedUid === record.uid) {
        setSelectedUid(null);
        setViewingData(null);
      }
      fetchData(1, false);
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleDetailFormSuccess = () => {
    setDetailFormOpen(false);
    fetchData(1, false);
    if (viewingData?.uid) {
      getDatasourceDetail(viewingData.uid)
        .then(setViewingData)
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchData(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex min-h-0 gap-4">
        {/* 左侧：数据源列表 */}
        <PageContent className="h-full">
          <div className="flex items-center gap-2 px-3 h-14 py-2 border-b border-(--ant-color-border-secondary) shrink-0">
            <Input
              placeholder={t("table.search.placeholder")}
              allowClear
              className="flex-1 min-w-0"
              value={searchParams.keyword ?? ""}
              onChange={(e) =>
                setSearchParams((prev: DatasourceListParams) => ({ ...prev, keyword: e.target.value }))
              }
              onPressEnter={(e) =>
                handleSearch({ keyword: (e.target as HTMLInputElement).value })
              }
            />
            <Button type="primary" onClick={handleAdd}>
              {t("common.add")}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-2" onScroll={handleScroll}>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spin size="small" />
              </div>
            ) : (
              <>
                {dataSource.map((item) => {
                  const isSelected = selectedUid === item.uid;
                  const menuItems: MenuProps["items"] = [
                    {
                      key: "edit",
                      label: t("common.edit"),
                      onClick: () => handleEdit(item),
                    },
                    {
                      key: "delete",
                      label: t("common.delete"),
                      danger: true,
                      onClick: () => {
                        modal.confirm({
                          title: t("datasource.confirm.delete.title"),
                          content: t("datasource.confirm.delete.content", {
                            name: item.name ?? item.uid ?? "",
                          }),
                          okText: t("common.ok"),
                          cancelText: t("common.cancel"),
                          onOk: () => handleDelete(item),
                        });
                      },
                    },
                  ];
                  return (
                    <div
                      key={item.uid}
                      className={`
                        flex items-center justify-between gap-2 cursor-pointer px-3 py-2 border-b border-(--ant-color-border-secondary)
                        transition-colors rounded-(--ant-border-radius)
                        ${isSelected ? "bg-(--ant-color-primary-bg) text-(--ant-color-primary)" : "hover:bg-(--ant-color-fill-tertiary)"}
                      `}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{item.name || item.uid || "-"}</div>
                        <div className="text-xs text-(--ant-color-text-secondary)">
                          {getTypeLabel(item.type, t)} / {getDriverLabel(item.driver, t)}
                        </div>
                      </div>
                      <span onClick={(e) => e.stopPropagation()}>
                        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                          <Button type="text" size="small" icon={<EllipsisOutlined />} title={t("common.more")} />
                        </Dropdown>
                      </span>
                    </div>
                  );
                })}
              </>
            )}
            {loadingMore && (
              <div className="flex justify-center py-3">
                <Spin size="small" />
              </div>
            )}
            {!loading && hasMore && dataSource.length > 0 && !loadingMore && (
              <div className="text-center py-2 text-(--ant-color-text-tertiary) text-xs">
                {t("datasource.list.scrollToLoadMore")}
              </div>
            )}
          </div>
        </PageContent>
        {/* 右侧：详情 / 元数据 / 快捷查询 */}
        <PageContent className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          {selectedUid ? (
            <Tabs
              className="flex-1 min-h-0 flex flex-col [&_.ant-tabs-content]:flex-1 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:overflow-auto"
              style={{ height: "100%" }}
              items={[
                {
                  key: "detail",
                  label: t("datasource.tab.detail"),
                  children: (
                    <div className="h-full overflow-auto p-4">
                      <DetailView embedded data={viewingData} loading={detailLoading} onEdit={handleEditFromDetail} />
                    </div>
                  ),
                },
                {
                  key: "metadata",
                  label: t("datasource.tab.metadata"),
                  children: <MetadataView uid={selectedUid} />,
                },
                {
                  key: "quickQuery",
                  label: t("datasource.tab.quickQuery"),
                  children: (
                    <div className="p-4 h-full flex flex-col gap-3">
                      <Input.TextArea
                        placeholder={t("datasource.quickQuery.placeholder")}
                        rows={6}
                        className="font-mono text-sm"
                      />
                      <Button type="primary">{t("datasource.quickQuery.run")}</Button>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-(--ant-color-text-tertiary)">
              {t("datasource.detail.selectHint")}
            </div>
          )}
        </PageContent>
      </div>
      <DetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        onCancel={() => setDetailFormOpen(false)}
        onSuccess={handleDetailFormSuccess}
      />
    </div>
  );
};

export default function DatasourceListWrapper() {
  return (
    <App className="h-full">
      <DatasourceList />
    </App>
  );
}
