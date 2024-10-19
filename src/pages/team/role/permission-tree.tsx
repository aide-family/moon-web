import { DomainType, Status } from '@/api/enum'
import { DomainTypeData, ModuleTypeData } from '@/api/global'
import { ResourceItem } from '@/api/model-types'
import { Space, Tag, Tree, TreeDataNode, TreeProps } from 'antd'
import React, { useEffect, useState } from 'react'

export interface PermissionTreeProps extends TreeProps {
  items: ResourceItem[]
  onChange?: (checkedKeys: number[]) => void
  value?: number[]
  defalutValue?: number[]
  disabled?: boolean
}

const PermissionTree: React.FC<PermissionTreeProps> = (props) => {
  const { items, onChange, value = props.defalutValue, disabled, autoExpandParent = true } = props
  const [expandedKeys, setExpandedKeys] = useState<number[]>(value || [])
  const [checkedKeys, setCheckedKeys] = useState<number[]>(value || [])
  const [selectedKeys, setSelectedKeys] = useState<number[]>(value || [])
  const [autoExpandParentX, setAutoExpandParentX] = useState(autoExpandParent)

  function convertToTreeData(resourceItems: ResourceItem[]): TreeDataNode[] {
    const domainMap = new Map<DomainType, TreeDataNode>()

    resourceItems.forEach((resource) => {
      // 1. 如果 domain 不存在，先创建 Domain 节点
      if (!domainMap.has(resource.domain)) {
        domainMap.set(resource.domain, {
          title: DomainTypeData[resource.domain],
          key: resource.domain + '_domain', // 使用 Map 大小作为唯一 key
          children: []
        })
      }

      // 2. 获取 domain 节点
      const domainNode = domainMap.get(resource.domain)!

      // 3. 在 domain 下查找或创建 module 节点
      let moduleNode = domainNode.children!.find((child) => child.key === resource.module + '_module')

      if (!moduleNode) {
        moduleNode = {
          title: ModuleTypeData[resource.module],
          key: resource.module + '_module',
          children: []
        }
        domainNode.children!.push(moduleNode)
      }

      // 4. 在 module 下添加 resource 节点
      moduleNode.children!.push({
        title: (
          <Space>
            <Tag style={{ width: 120, textAlign: 'center' }}>{resource.name}</Tag>
            {resource.remark}
          </Space>
        ),
        disabled: resource.status !== Status.StatusEnable,
        key: resource.id
      })
    })

    // 将 Map 转换为数组返回
    return Array.from(domainMap.values())
  }

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue as number[])
    setAutoExpandParentX(false)
  }

  const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
    setCheckedKeys(
      (checkedKeysValue as any[]).filter((key) => {
        // 移除不是数字的key
        return typeof key === 'number'
      })
    )
  }

  const onSelect: TreeProps['onSelect'] = (selectedKeysValue) => {
    setSelectedKeys(selectedKeysValue as any[])
  }

  useEffect(() => {
    onChange && onChange(checkedKeys)
  }, [checkedKeys])

  return (
    <Tree
      style={{ height: 400, overflow: 'auto' }}
      disabled={disabled}
      checkable
      showLine
      blockNode
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParentX}
      onCheck={onCheck}
      checkedKeys={value}
      onSelect={onSelect}
      selectedKeys={selectedKeys}
      treeData={convertToTreeData(items)}
    />
  )
}

export default PermissionTree
