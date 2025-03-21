declare module 'tdesign-vue-next' {
  // 导出所有组件
  import { App } from 'vue';

  // 定义组件库的插件接口
  export const install: (app: App) => void;

  // 导出常用组件
  export const Button: any;
  export const Input: any;
  export const Form: any;
  export const FormItem: any;
  export const Table: any;
  export const Dialog: any;
  export const Menu: any;
  export const Tabs: any;
  export const TabPanel: any;
  export const Select: any;
  export const Option: any;
  export const Pagination: any;
  export const DatePicker: any;
  export const TimePicker: any;
  export const Switch: any;
  export const Checkbox: any;
  export const Radio: any;
  export const MessagePlugin: any;
  export const NotificationPlugin: any;
  export const Loading: any;
  export const Drawer: any;
  export const Dropdown: any;
  export const Tooltip: any;
  export const Popover: any;
  export const Card: any;
  export const Layout: any;
  export const Header: any;
  export const Content: any;
  export const Footer: any;
  export const Sider: any;
  export const Row: any;
  export const Col: any;
  export const Space: any;
  export const Divider: any;
  export const Icon: any;
  export const Avatar: any;
  export const Badge: any;
  export const Alert: any;
  export const Progress: any;
  export const Upload: any;
  export const Tree: any;
  export const TreeSelect: any;
  export const Cascader: any;
  export const ColorPicker: any;
  export const Transfer: any;
  export const Slider: any;
  export const Rate: any;
  export const Tag: any;
  export const Steps: any;
  export const Step: any;
  export const Breadcrumb: any;
  export const BreadcrumbItem: any;
  export const List: any;
  export const ListItem: any;
  export const Calendar: any;
  export const Collapse: any;
  export const CollapsePanel: any;
  export const Timeline: any;
  export const TimelineItem: any;
  export const Skeleton: any;
  export const Anchor: any;
  export const AnchorLink: any;
  export const BackTop: any;
  export const Affix: any;
  export const ConfigProvider: any;

  // 导出类型
  export type TdButtonProps = any;
  export type TdInputProps = any;
  export type TdFormProps = any;
  export type TdFormItemProps = any;
  export type TdTableProps = any;
  export type TdDialogProps = any;
  export type TdMenuProps = any;
  export type TdTabsProps = any;
  export type TdSelectProps = any;
  export type TdPaginationProps = any;
  export type TdDatePickerProps = any;
  export type TdTimePickerProps = any;
  export type TdSwitchProps = any;
  export type TdCheckboxProps = any;
  export type TdRadioProps = any;
}