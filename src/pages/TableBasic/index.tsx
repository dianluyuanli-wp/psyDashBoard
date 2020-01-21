import React from "react";
import styles from "./index.less";
import { Table, Divider, Tag } from "antd";

const columns = [
  {
    title: "昵称",
    dataIndex: "name",
    key: "name",
    render: text => <a>{text}</a>
  },
  {
    title: "性别",
    dataIndex: "age",
    key: "age"
  },
  {
    title: "电话",
    dataIndex: "address",
    key: "address"
  },
  {
    title: "预约时段",
    key: "tags",
    dataIndex: "tags",
    render: tags => (
      <span>
        {tags.map(tag => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </span>
    )
  },
  {
    title: "操作",
    key: "action",
    render: (text, record) => (
      <span>
        <a>接受预约</a>
        <Divider type="vertical" />
        <a>驳回</a>
      </span>
    )
  }
];

const data = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"]
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"]
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    tags: ["cool", "teacher"]
  }
];

export default () => (
  <div className={styles.container}>
    <div id="components-table-demo-basic">
      <Table columns={columns} dataSource={data} />
    </div>
  </div>
);
