import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Space, message, Dropdown, App, Radio, Tag, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import {
  type StrategyItem,
  type StrategyListParams,
  getStrategyList,
  deleteStrategy,
  updateStrategyStatus,
} from "@/api/strategy/index";
import { GlobalStatus } from "@/api";
import dayjs from "dayjs";
import DetailForm from "./components/DetailForm";
import { useLocale } from "@/contexts/LocaleContext";
import PageContent from "@/components/layout/PageContent";
import type { StrategyGroupItem, StrategyGroupListParams } from "@/api/strategyGroup";
import {
  getStrategyGroupList,
  getStrategyGroupDetail,
  deleteStrategyGroup,
  updateStrategyGroupStatus,
} from "@/api/strategyGroup";
import StrategyGroupDetailForm from "@/pages/marksman/strategy-groups/components/DetailForm";
import StrategyGroupDetailView from "@/pages/marksman/strategy-groups/components/DetailView";

function getTypeLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === "") return "-";
  return t(`datasource.type.${value}`) || value;
}
function getDriverLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === "") return "-";
  return t(`datasource.driver.${value}`) || value;
}

/** 将接口返回的 status（字符串）规范为 GlobalStatus */
function normalizeStatus(status: string | undefined): GlobalStatus {
  if (status === GlobalStatus.ENABLED) return GlobalStatus.ENABLED;
  if (status === GlobalStatus.DISABLED) return GlobalStatus.DISABLED;
  return GlobalStatus.UNKNOWN;
}

/** 修改状态接口要求传 integer：1=启用 2=禁用 */
function globalStatusToNumber(status: GlobalStatus): number {
  return status === GlobalStatus.ENABLED ? 1 : 2;
}

const defaultSearchParams: StrategyListParams = {
  keyword: "",
  status: undefined,
};

export interface StrategyListContentProps {
  /** 左侧选中的策略组 UID，用于过滤右侧列表 */
  selectedStrategyGroupUID?: string | null;
}

export const StrategyListContent: React.FC<StrategyListContentProps> = ({ selectedStrategyGroupUID }) => {
  const { modal } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<StrategyItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState<StrategyListParams>(defaultSearchParams);
  const [tableHeight, setTableHeight] = useState<number>(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [detailFormMode, setDetailFormMode] = useState<"create" | "edit">("create");
  const [editingData, setEditingData] = useState<StrategyItem | null>(null);

  const fetchData = async (page?: number, pageSize?: number, paramsOverride?: Partial<StrategyListParams>) => {
    setLoading(true);
    try {
      const currentPage = page ?? pagination.current;
      const currentPageSize = pageSize ?? pagination.pageSize;
      const base = paramsOverride ?? searchParams;
      const params: StrategyListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: base.keyword || undefined,
        type: base.type,
        driver: base.driver,
        status: base.status,
        strategyGroupUID: selectedStrategyGroupUID ?? base.strategyGroupUID,
      };
      const response = await getStrategyList(params);
      const items = response?.items ?? [];
      const meta = response?.metadata;
      const total = parseInt(String(meta?.total ?? 0), 10);
      setDataSource(items);
      setPagination((prev) => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total,
      }));
    } catch (error) {
      console.error("获取策略列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize);
  };

  const handleReset = () => {
    setSearchParams(defaultSearchParams);
    setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
    fetchData(1, pagination.pageSize, defaultSearchParams);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize);
  };

  const emptyPlaceholder = (text: unknown) => (text == null || text === "" ? "-" : text);

  const columns: ColumnsType<StrategyItem> = [
    {
      title: t("strategy.table.uid"),
      dataIndex: "uid",
      key: "uid",
      width: 160,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t("strategy.table.name"),
      dataIndex: "name",
      key: "name",
      minWidth: 120,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t("strategy.table.remark"),
      dataIndex: "remark",
      key: "remark",
      minWidth: 120,
      ellipsis: true,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t("strategy.table.type"),
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (v: string) => getTypeLabel(v, t),
    },
    {
      title: t("strategy.table.driver"),
      dataIndex: "driver",
      key: "driver",
      width: 120,
      render: (v: string) => getDriverLabel(v, t),
    },
    {
      title: t("table.status"),
      dataIndex: "status",
      key: "status",
      width: 90,
      align: "center",
      render: (status: string | undefined) => {
        const s = normalizeStatus(status);
        const statusMap: Record<GlobalStatus, { text: string; color: string }> = {
          [GlobalStatus.UNKNOWN]: { text: t("table.unknown"), color: "default" },
          [GlobalStatus.ENABLED]: { text: t("table.enable"), color: "success" },
          [GlobalStatus.DISABLED]: { text: t("table.disable"), color: "error" },
        };
        const info = statusMap[s];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: t("strategy.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (text: string) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      title: t("strategy.table.updatedAt"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      render: (text: string) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      title: t("table.action"),
      key: "action",
      width: 140,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const isEnabled = normalizeStatus(record.status) === GlobalStatus.ENABLED;
        const handleStatusClick = () => {
          const action = isEnabled ? t("table.disable") : t("table.enable");
          modal.confirm({
            title: t("strategy.confirm.status.title", { action }),
            content: t("strategy.confirm.status.content", {
              action,
              name: record.name ?? record.uid ?? "",
            }),
            okText: t("common.ok"),
            cancelText: t("common.cancel"),
            onOk: () => handleStatusChange(record, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
          });
        };
        const menuItems: MenuProps["items"] = [
          {
            key: "edit",
            label: t("common.edit"),
            onClick: () => handleEdit(record),
          },
          {
            key: "status",
            label: isEnabled ? t("table.disable") : t("table.enable"),
            onClick: handleStatusClick,
          },
          {
            key: "delete",
            label: t("common.delete"),
            danger: true,
            onClick: () => {
              modal.confirm({
                title: t("strategy.confirm.delete.title"),
                content: t("strategy.confirm.delete.content", {
                  name: record.name ?? record.uid ?? "",
                }),
                okText: t("common.ok"),
                cancelText: t("common.cancel"),
                onOk: () => handleDelete(record),
              });
            },
          },
        ];
        return (
          <Space size="small">
            <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
              {t("common.detail")}
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button type="link" size="small">
                {t("common.more")}
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const handleAdd = () => {
    setDetailFormMode("create");
    setEditingData(null);
    setDetailFormOpen(true);
  };

  const handleViewDetail = (record: StrategyItem) => {
    if (!record.uid) return;
    navigate(`/strategies/${record.uid}`);
  };

  const handleEdit = (record: StrategyItem) => {
    setDetailFormMode("edit");
    setEditingData(record);
    setDetailFormOpen(true);
  };

  const handleDelete = async (record: StrategyItem) => {
    if (!record.uid) return;
    try {
      await deleteStrategy(record.uid);
      message.success(t("message.delete.success"));
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleStatusChange = async (record: StrategyItem, newStatus: GlobalStatus) => {
    if (!record.uid) return;
    try {
      await updateStrategyStatus(record.uid, globalStatusToNumber(newStatus));
      message.success(t("message.update.success"));
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("修改状态失败:", error);
    }
  };

  const handleFormSuccess = () => {
    setDetailFormOpen(false);
    fetchData(pagination.current, pagination.pageSize);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 左侧选中策略组变化时重新请求
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStrategyGroupUID]);

  // 状态筛选变更时自动请求列表
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status]);

  useEffect(() => {
    const calculateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const thead = tableWrapperRef.current.querySelector(".ant-table-thead");
        const paginationEl = tableWrapperRef.current.querySelector(".ant-pagination");
        const theadHeight = thead ? (thead as HTMLElement).offsetHeight : 0;
        const paginationHeight = paginationEl ? (paginationEl as HTMLElement).offsetHeight : 0;
        const tableBodyPadding = 16 * 2;
        const calculatedHeight = containerHeight - theadHeight - paginationHeight - tableBodyPadding;
        setTableHeight(Math.max(calculatedHeight, 100));
      }
    };
    calculateTableHeight();
    window.addEventListener("resize", calculateTableHeight);
    return () => window.removeEventListener("resize", calculateTableHeight);
  }, [dataSource]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Space size="middle" wrap>
          <span>{t("table.search.keyword")}:</span>
          <Input
            placeholder={t("table.search.placeholder")}
            value={searchParams.keyword ?? ""}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            className="w-full min-w-[120px] sm:w-48 md:w-52"
          />
          <span>{t("table.search.status")}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, status: e.target.value }))}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>{t("table.search.all")}</Radio.Button>
            <Radio.Button value={GlobalStatus.ENABLED}>{t("table.search.enabled")}</Radio.Button>
            <Radio.Button value={GlobalStatus.DISABLED}>{t("table.search.disabled")}</Radio.Button>
          </Radio.Group>
          <Button onClick={handleSearch} type="primary">
            {t("common.search")}
          </Button>
          <Button onClick={handleReset}>{t("common.reset")}</Button>
        </Space>
        <Button type="primary" onClick={handleAdd}>
          {t("common.add")}
        </Button>
      </div>
      <div ref={tableContainerRef} className="flex-1 flex overflow-hidden flex-col" style={{ minHeight: 0 }}>
        <div ref={tableWrapperRef} className="h-full flex flex-col">
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="uid"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t("table.total", { total }),
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
            scroll={{ y: tableHeight, x: "max-content" }}
            size="middle"
          />
        </div>
      </div>

      <DetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        defaultStrategyGroupUID={detailFormMode === "create" ? selectedStrategyGroupUID : undefined}
        onCancel={() => {
          setDetailFormOpen(false);
          setEditingData(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

/** 左侧策略组列表 */
const StrategyGroupSidebar: React.FC<{
  selectedUid: string | null;
  onSelect: (uid: string | null) => void;
  onRefresh?: () => void;
}> = ({ selectedUid, onSelect, onRefresh }) => {
  const { modal } = App.useApp();
  const { t } = useLocale();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dataSource, setDataSource] = useState<StrategyGroupItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [detailFormMode, setDetailFormMode] = useState<"create" | "edit">("create");
  const [editingData, setEditingData] = useState<StrategyGroupItem | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [viewingData, setViewingData] = useState<StrategyGroupItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const hasMore = dataSource.length < pagination.total && pagination.total > 0;

  const fetchData = useCallback(
    async (page: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params: StrategyGroupListParams = {
          page,
          pageSize: pagination.pageSize,
          keyword: keyword || undefined,
        };
        const response = await getStrategyGroupList(params);
        const items = response?.items ?? [];
        const total = parseInt(String(response?.total ?? "0"), 10);
        if (append) {
          setDataSource((prev) => [...prev, ...items]);
        } else {
          setDataSource(items);
          if (items.length > 0 && items[0].uid) {
            // onSelect(items[0].uid);
            setViewingData(null);
            setDetailLoading(true);
            getStrategyGroupDetail(items[0].uid)
              .then(setViewingData)
              .catch(() => {})
              .finally(() => setDetailLoading(false));
          } else {
            onSelect(null);
            setViewingData(null);
          }
        }
        setPagination((prev) => ({ ...prev, current: page, total }));
      } catch (error) {
        console.error("获取策略组列表失败:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [keyword, pagination.pageSize, onSelect],
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

  useEffect(() => {
    fetchData(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
    fetchData(1, false);
  };

  const handleAdd = () => {
    setDetailFormMode("create");
    setEditingData(null);
    setDetailFormOpen(true);
  };

  const handleSelectItem = async (record: StrategyGroupItem) => {
    if (!record.uid) return;
    onSelect(record.uid);
    setViewingData(null);
    setDetailLoading(true);
    try {
      const data = await getStrategyGroupDetail(record.uid);
      setViewingData(data);
    } catch (error) {
      console.error("获取策略组详情失败:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = (record: StrategyGroupItem) => {
    setDetailFormMode("edit");
    setEditingData(record);
    setDetailFormOpen(true);
  };

  const handleEditFromDetail = (data: StrategyGroupItem) => {
    setDetailFormMode("edit");
    setEditingData(data);
    setDetailFormOpen(true);
  };

  const handleViewDetail = (record: StrategyGroupItem) => {
    setViewingData(record);
    setDetailViewOpen(true);
  };

  const handleDelete = async (record: StrategyGroupItem) => {
    if (!record.uid) return;
    try {
      await deleteStrategyGroup(record.uid);
      message.success(t("message.delete.success"));
      if (selectedUid === record.uid) {
        onSelect(null);
        setViewingData(null);
      }
      fetchData(1, false);
      onRefresh?.();
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleStatusChange = async (record: StrategyGroupItem, newStatus: string) => {
    if (!record.uid) return;
    try {
      await updateStrategyGroupStatus(record.uid, newStatus);
      message.success(t("message.update.success"));
      fetchData(1, false);
      if (viewingData?.uid === record.uid) {
        setViewingData({ ...viewingData, status: newStatus });
      }
      onRefresh?.();
    } catch (error) {
      console.error("修改状态失败:", error);
    }
  };

  const handleDetailFormSuccess = (created?: StrategyGroupItem) => {
    setDetailFormOpen(false);
    fetchData(1, false);
    onRefresh?.();
    if (created?.uid) {
      onSelect(created.uid);
      setViewingData(null);
      setDetailLoading(true);
      getStrategyGroupDetail(created.uid)
        .then(setViewingData)
        .catch(() => {})
        .finally(() => setDetailLoading(false));
    }
  };

  function getStatusText(status: string | undefined) {
    const statusMap: Record<string, string> = {
      [GlobalStatus.UNKNOWN]: t("table.unknown"),
      [GlobalStatus.ENABLED]: t("table.enable"),
      [GlobalStatus.DISABLED]: t("table.disable"),
    };
    return (status && statusMap[status]) || statusMap[GlobalStatus.UNKNOWN];
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 h-14 py-2 shrink-0">
          <Input
            placeholder={t("table.search.placeholder")}
            allowClear
            className="flex-1 min-w-0"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
            {/* {t("common.add")} */}
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
                const isEnabled = item.status === GlobalStatus.ENABLED;
                const menuItems: MenuProps["items"] = [
                  { key: "edit", label: t("common.edit"), onClick: () => handleEdit(item) },
                  { key: "view", label: t("common.view"), onClick: () => handleViewDetail(item) },
                  {
                    key: "status",
                    label: isEnabled ? t("table.disable") : t("table.enable"),
                    onClick: () => {
                      const action = isEnabled ? t("table.disable") : t("table.enable");
                      modal.confirm({
                        title: t("strategyGroup.confirm.status.title", { action }),
                        content: t("strategyGroup.confirm.status.content", {
                          action,
                          name: item.name ?? item.uid ?? "",
                        }),
                        onOk: () => handleStatusChange(item, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
                        okText: t("common.ok"),
                        cancelText: t("common.cancel"),
                      });
                    },
                  },
                  {
                    key: "delete",
                    label: t("common.delete"),
                    danger: true,
                    onClick: () => {
                      modal.confirm({
                        title: t("strategyGroup.confirm.delete.title"),
                        content: t("strategyGroup.confirm.delete.content", {
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
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span
                        className="shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            item.status === GlobalStatus.ENABLED
                              ? "var(--ant-color-success)"
                              : item.status === GlobalStatus.DISABLED
                                ? "var(--ant-color-error)"
                                : "var(--ant-color-text-tertiary)",
                        }}
                        title={getStatusText(normalizeStatus(item.status))}
                      />
                      <div className="truncate min-w-0">{item.name || item.uid || "-"}</div>
                      {/* <div className="text-xs text-(--ant-color-text-secondary)">{getStatusText(item.status)}</div> */}
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
        </div>
      </div>

      <StrategyGroupDetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        onCancel={() => {
          setDetailFormOpen(false);
          setEditingData(null);
        }}
        onSuccess={handleDetailFormSuccess}
      />
      <StrategyGroupDetailView
        open={detailViewOpen}
        data={viewingData}
        loading={detailLoading}
        onCancel={() => setDetailViewOpen(false)}
        onEdit={handleEditFromDetail}
      />
    </>
  );
};

/** 策略列表页：左侧策略组，右侧策略列表（布局同数据源，无标题） */
function StrategyListPage() {
  const [selectedGroupUid, setSelectedGroupUid] = useState<string | null>(null);
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex min-h-0 gap-4">
        <PageContent>
        <StrategyGroupSidebar selectedUid={selectedGroupUid} onSelect={setSelectedGroupUid} />
        </PageContent>
        <PageContent className="flex-1">
          <StrategyListContent selectedStrategyGroupUID={selectedGroupUid} />
        </PageContent>
      </div>
    </div>
  );
}

export default function StrategyListWrapper() {
  return (
    <App className="h-full">
      <StrategyListPage />
    </App>
  );
}
