import {
  AppstoreOutlined,
  FileTextOutlined,
  MailOutlined,
  ApiOutlined,
  MessageOutlined,
  SendOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  HddOutlined,
  BellOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  HistoryOutlined,
  ClusterOutlined,
} from '@ant-design/icons'
import type { AppConfigItem } from '@/apps/main/config'
import { getSystemManagementMenuItems } from '@/config/systemManagementMenu'
import TemplateManagement from '@/pages/rabbit/templates'
import EmailManagement from '@/pages/rabbit/emails'
import WebhookManagement from '@/pages/rabbit/webhooks'
import MessageManagement from '@/pages/rabbit/messages'
import SenderManagement from '@/pages/rabbit/sender'
import RecipientGroupsPage from '@/pages/rabbit/recipient-groups'
import AlertSubscriptionsPage from '@/pages/rabbit/alert-subscriptions'
import DatasourceListWrapper from '@/pages/marksman/datasources'
import StrategyListWrapper from '@/pages/marksman/strategies'
import LevelListWrapper from '@/pages/marksman/levels'
import RealtimeAlertListWrapper from '@/pages/marksman/realtime-alerts'
import HistoryAlertListWrapper from '@/pages/marksman/history-alerts'
import SSHCommandsPage from '@/pages/jade_tree/ssh-commands'
import AuditsPage from '@/pages/jade_tree/audits'
import ProbeTasksPage from '@/pages/jade_tree/probe-tasks'
import MachinesPage from '@/pages/jade_tree/machines'

/**
 * 主应用集成模式菜单配置：直接渲染本地页面组件，不通过微前端
 */
export function getIntegratedAppConfig(
  t: (key: string) => string,
): AppConfigItem[] {
  return [
    {
      key: 'goddess',
      icon: <AppstoreOutlined />,
      label: t('menu.goddess'),
      path: '/goddess',
      children: [...getSystemManagementMenuItems(t)],
    },
    {
      key: 'rabbit',
      icon: <MessageOutlined />,
      label: t('menu.rabbit'),
      path: '/rabbit',
      children: [
        {
          key: 'rabbit-templates',
          icon: <FileTextOutlined />,
          label: t('menu.rabbitTemplates'),
          path: '/rabbit/templates',
          element: <TemplateManagement />,
        },
        {
          key: 'rabbit-emails',
          icon: <MailOutlined />,
          label: t('menu.rabbitEmails'),
          path: '/rabbit/emails',
          element: <EmailManagement />,
        },
        {
          key: 'rabbit-webhooks',
          icon: <ApiOutlined />,
          label: t('menu.rabbitWebhooks'),
          path: '/rabbit/webhooks',
          element: <WebhookManagement />,
        },
        {
          key: 'rabbit-recipient-groups',
          icon: <TeamOutlined />,
          label: t('menu.rabbitRecipientGroups'),
          path: '/rabbit/recipient-groups',
          element: <RecipientGroupsPage />,
        },
        {
          key: 'rabbit-alert-subscriptions',
          icon: <BellOutlined />,
          label: t('menu.rabbitAlertSubscriptions'),
          path: '/rabbit/alert-subscriptions',
          element: <AlertSubscriptionsPage />,
        },
        {
          key: 'rabbit-sender',
          icon: <SendOutlined />,
          label: t('menu.rabbitSender'),
          path: '/rabbit/sender',
          element: <SenderManagement />,
        },
        {
          key: 'rabbit-messages',
          icon: <HistoryOutlined />,
          label: t('menu.rabbitMessages'),
          path: '/rabbit/messages',
          element: <MessageManagement />,
        },
      ],
    },
    {
      key: 'marksman',
      icon: <SafetyCertificateOutlined />,
      label: t('menu.marksman'),
      path: '/marksman',
      children: [
        {
          key: 'marksman-realtime-alerts',
          icon: <AlertOutlined />,
          label: t('menu.realtimeAlerts'),
          path: '/marksman/realtime-alerts',
          element: <RealtimeAlertListWrapper />,
        },
        {
          key: 'marksman-history-alerts',
          icon: <HistoryOutlined />,
          label: t('menu.historyAlerts'),
          path: '/marksman/history-alerts',
          element: <HistoryAlertListWrapper />,
        },
        {
          key: 'marksman-datasources',
          icon: <HddOutlined />,
          label: t('menu.datasources'),
          path: '/marksman/datasources',
          element: <DatasourceListWrapper />,
        },
        {
          key: 'marksman-strategies',
          icon: <ThunderboltOutlined />,
          label: t('menu.strategies'),
          path: '/marksman/strategies',
          element: <StrategyListWrapper />,
        },
        {
          key: 'marksman-levels',
          icon: <BellOutlined />,
          label: t('menu.levels'),
          path: '/marksman/levels',
          element: <LevelListWrapper />,
        },
      ],
    },
    {
      key: 'jade-tree',
      icon: <ClusterOutlined />,
      label: t('menu.jadeTree'),
      path: '/jade-tree',
      children: [
        {
          key: 'jade-tree-ssh-commands',
          icon: <ClusterOutlined />,
          label: t('menu.jadeTreeCommands'),
          path: '/jade-tree/ssh-commands',
          element: <SSHCommandsPage />,
        },
        {
          key: 'jade-tree-audits',
          icon: <HistoryOutlined />,
          label: t('menu.jadeTreeAudits'),
          path: '/jade-tree/audits',
          element: <AuditsPage />,
        },
        {
          key: 'jade-tree-probe-tasks',
          icon: <ApiOutlined />,
          label: t('menu.jadeTreeProbes'),
          path: '/jade-tree/probe-tasks',
          element: <ProbeTasksPage />,
        },
        {
          key: 'jade-tree-machines',
          icon: <ClusterOutlined />,
          label: t('menu.jadeTreeMachines'),
          path: '/jade-tree/machines',
          element: <MachinesPage />,
        },
      ],
    },
  ]
}
