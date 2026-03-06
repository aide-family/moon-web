import React, { useState, useRef, useEffect } from "react";
import { Table, Input, Button, Space, message, App, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  type DatasourceItem,
  type DatasourceListParams,
  getDatasourceList,
  getDatasourceDetail,
  deleteDatasource,
} from "@/api/datasource/index";
import dayjs from "dayjs";
import DetailForm from "./components/DetailForm";
import DetailView from "./components/DetailView";
import { useLocale } from "@/contexts/LocaleContext";

function getTypeLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === "") return "-";
  return t(`datasource.type.${value}`) || value;
}

function getDriverLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === "") return "-";
  return t(`datasource.driver.${value}`) || value;
}

const defaultSearchParams: DatasourceListParams = {
  keyword: "",
};

const DatasourceList: React.FC = () => {
  const { modal } = App.useApp();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DatasourceItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchParams, setSearchParams] = useState<DatasourceListParams>(defaultSearchParams);
  const [detailFormOpen, setDetailFormOpen] = useState(false);
  const [detailFormMode, setDetailFormMode] = useState<"create" | "edit">("create");
  const [editingData, setEditingData] = useState<DatasourceItem | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [viewingData, setViewingData] = useState<DatasourceItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(400);

  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true);
    try {
      const currentPage = page ?? pagination.current;
      const currentPageSize = pageSize ?? pagination.pageSize;
      const params: DatasourceListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: searchParams.keyword || undefined,
        type: searchParams.type,
        driver: searchParams.driver,
        status: searchParams.status,
      };
      const response = await getDatasourceList(params);
      if (response) {
        setDataSource(response.items ?? []);
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(String(response.total ?? "0"), 10),
        }));
      }
    } catch (error) {
      console.error("获取数据源列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData();
  };

  const handleReset = () => {
    setSearchParams(defaultSearchParams);
    setPagination({ current: 1, pageSize: 10, total: 0 });
    fetchData();
  };

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize);
  };

  const emptyPlaceholder = (text: unknown) => (text == null || text === "" ? "-" : String(text));

  const handleAdd = () => {
    setDetailFormMode("create");
    setEditingData(null);
    setDetailFormOpen(true);
  };

  const handleViewDetail = async (record: DatasourceItem) => {
    if (!record.uid) return;
    setDetailViewOpen(true);
    setViewingData(null);
    setDetailLoading(true);
    try {
      const data = await getDatasourceDetail(record.uid);
      setViewingData(data);
    } catch (error) {
      console.error("获取数据源详情失败:", error);
      setDetailViewOpen(false);
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
    setDetailViewOpen(false);
    setDetailFormMode("edit");
    setEditingData(data);
    setDetailFormOpen(true);
  };

  const handleDelete = async (record: DatasourceItem) => {
    if (!record.uid) return;
    try {
      await deleteDatasource(record.uid);
      message.success(t("message.delete.success"));
      fetchData();
      if (detailViewOpen && viewingData?.uid === record.uid) setDetailViewOpen(false);
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleDetailFormSuccess = () => {
    setDetailFormOpen(false);
    fetchData();
    if (detailViewOpen && viewingData) {
      getDatasourceDetail(viewingData.uid!)
        .then(setViewingData)
        .catch(() => {});
    }
  };

  const columns: ColumnsType<DatasourceItem> = [
    {
      title: t("datasource.table.uid"),
      dataIndex: "uid",
      key: "uid",
      width: 160,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t("datasource.table.name"),
      dataIndex: "name",
      key: "name",
      width: 140,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t("datasource.table.type"),
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (v: string) => getTypeLabel(v, t),
    },
    {
      title: t("datasource.table.driver"),
      dataIndex: "driver",
      key: "driver",
      width: 140,
      render: (v: string) => getDriverLabel(v, t),
    },
    {
      title: t("datasource.table.status"),
      dataIndex: "status",
      key: "status",
      width: 80,
      align: "center",
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t("datasource.table.url"),
      dataIndex: "url",
      key: "url",
      width: 300,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t("datasource.table.remark"),
      dataIndex: "remark",
      key: "remark",
      width: 120,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t("datasource.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      title: t("datasource.table.updatedAt"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      title: t("table.action"),
      key: "action",
      width: 140,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "edit",
            label: t("common.edit"),
            onClick: () => handleEdit(record),
          },
          {
            key: "delete",
            label: t("common.delete"),
            danger: true,
            onClick: () => {
              modal.confirm({
                title: t("datasource.confirm.delete.title"),
                content: t("datasource.confirm.delete.content", { name: record.name ?? record.uid ?? "" }),
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight;
        const theadEl = tableWrapperRef.current.querySelector(".ant-table-thead");
        const paginationEl = tableWrapperRef.current.querySelector(".ant-pagination");
        let theadHeight = 0;
        let paginationHeight = 0;
        if (theadEl) theadHeight = (theadEl as HTMLElement).getBoundingClientRect().height;
        if (paginationEl) paginationHeight = (paginationEl as HTMLElement).getBoundingClientRect().height + 16;
        setTableHeight(Math.max(containerHeight - theadHeight - paginationHeight - 24, 100));
      }
    };
    const timer = setTimeout(updateTableHeight, 100);
    window.addEventListener("resize", updateTableHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTableHeight);
    };
  }, [dataSource, pagination]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-start shrink-0">
        <Space size="middle" wrap>
          <Input
            placeholder={t("table.search.placeholder")}
            allowClear
            className="w-48"
            value={searchParams.keyword ?? ""}
            onChange={(e) => setSearchParams((prev: DatasourceListParams) => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
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
        <div ref={tableWrapperRef} className="h-full flex flex-col flex-1">
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="uid"
            loading={loading}
            size="small"
            scroll={{ y: tableHeight, x: '100%' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => t("table.total", { total }),
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
          />
        </div>
      </div>
      <DetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        onCancel={() => setDetailFormOpen(false)}
        onSuccess={handleDetailFormSuccess}
      />
      <DetailView
        open={detailViewOpen}
        data={viewingData}
        loading={detailLoading}
        onCancel={() => setDetailViewOpen(false)}
        onEdit={handleEditFromDetail}
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
