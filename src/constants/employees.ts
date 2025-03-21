// 统一的员工数据源
export const employees = [
  '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
  '郑一', '王二', '李三', '赵四', '钱五', '孙六', '周七', '吴八',
  '郑九', '王十', '李十一', '赵十二', '钱十三', '孙十四', '周十五',
  '吴十六', '郑十七', '王十八', '李十九', '赵二十', '钱二十一', '孙二十二'
];

// 生成员工选项，用于下拉选择框
export const getEmployeeOptions = () => {
  return employees.map((name, index) => ({
    value: (index + 1).toString(),
    label: name
  }));
};

// 根据ID获取员工名称
export const getEmployeeNameById = (id: string) => {
  const index = parseInt(id) - 1;
  return index >= 0 && index < employees.length ? employees[index] : '未知员工';
};

// 根据名称获取员工ID
export const getEmployeeIdByName = (name: string) => {
  const index = employees.indexOf(name);
  return index >= 0 ? (index + 1).toString() : '';
};