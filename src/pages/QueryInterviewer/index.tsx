import React, { useEffect, useReducer, useState } from 'react';
import { connect } from 'umi';
import { ConnectState } from '@/models/connect';
import { queryInterviewerFreely } from '@/services/interviewee';
import { Table, Avatar, Card, Button, Form, Switch, DatePicker, Select } from 'antd';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RangeValue } from 'rc-picker/lib/interface';
import { SortOrder } from 'antd/lib/table/interface';
import styles from './index.less';
import { User, queryUser } from '@/services/user';
import { ActionText } from '@/components/smallCom/ActionText';
import { tableTitle, dealWithRes, listReducer } from '../TableBasic/index';
import { TableComProps, QueryObj, QueryAction, TableItem } from '../TableBasic/types';
import { usePageManager } from '@/utils/commonHooks';

const FItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

export const SINGLE_PAGE_SIZE = 10;

const TableCom: React.FC<TableComProps> = () => {
  //    列表状态
  const [tableData, setList] = useReducer(listReducer, []);
  //  咨询师列表
  const [userList, setUserList] = useState([] as Array<User>);

  //  控制页码
  const [pageObj, setPage] = usePageManager();

  //  筛选条件相关reducer
  function queryReducer(state: QueryObj, action: QueryAction): QueryObj {
    return { ...state, ...action };
  }
  const [queryObj, setQuery] = useReducer(queryReducer, {
    switchOn: true,
    period: [moment(), moment().add(7, 'days')],
    counselorId: '',
  } as QueryObj);

  function getQueryString(pageNum: number) {
    const queryJsonString = JSON.stringify(
      Object.assign(
        {},
        queryObj.switchOn
          ? {
              'formData.date': `_.gt('${queryObj.period?.[0]?.format(
                'YYYY-MM-DD',
              )}').and(_.lt('${queryObj.period?.[1]?.format('YYYY-MM-DD')}'))`,
            }
          : {},
        queryObj.counselorId ? { counselorId: `'${queryObj.counselorId}'` } : {},
      ),
    )
      .replace(/"/g, '')
      .replace('formData.date', '"formData.date"');
    //  这里要替换下，否则后台会理解为字符串而不是查询条件
    return `db.collection('interviewee').where(${queryJsonString}).skip(${(pageNum - 1) *
      SINGLE_PAGE_SIZE}).limit(${SINGLE_PAGE_SIZE}).orderBy('date','desc').get()`;
  }

  const getInterviewerList = async (page: number) => {
    const res = await queryInterviewerFreely({
      queryString: getQueryString(page),
    });
    const parsedList = dealWithRes(res);
    setList({ type: 'init', index: 0, list: parsedList });
    setPage({ total: res.pager.Total });
  };
  useEffect(() => {
    getInterviewerList(1);
    queryUser(setUserList);
  }, []);

  const columns = [
    {
      title: '咨询师id',
      dataIndex: 'counselorId',
      key: 'counselorId',
      render: (text: string) => <ActionText text={text} className={styles.action} />,
      sorter: (a: TableItem, b: TableItem) => (a.counselorId >= b.counselorId ? 1 : -1),
      sortDirections: ['descend', 'ascend'] as Array<SortOrder>,
    },
    ...tableTitle,
  ];

  function queryPeriod(momentArray: RangeValue<moment.Moment>) {
    setQuery({
      period: momentArray,
    });
  }

  function changeSwitch(checked: boolean) {
    setQuery({
      switchOn: checked,
    });
  }

  function changeSelect(value: string) {
    setQuery({
      counselorId: value,
    });
  }

  async function moreItem(pageNum: number) {
    getInterviewerList(pageNum);
    setPage({ current: pageNum });
  }

  async function buttonClick() {
    getInterviewerList(1);
  }

  const paginaConfig = {
    onChange: moreItem,
    total: pageObj.total,
    current: pageObj.current,
    pageSize: 10,
  };
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Card title="查询条件">
          <Form className={styles.range}>
            <FItem label="日期过滤">
              <Switch defaultChecked={queryObj.switchOn} onChange={changeSwitch} />
            </FItem>
            {queryObj.switchOn && (
              <FItem label="咨询日期">
                <RangePicker onChange={queryPeriod} size="small" defaultValue={queryObj.period} />
              </FItem>
            )}
            <FItem label="咨询师id">
              <Select
                showSearch
                optionFilterProp="children"
                onChange={changeSelect}
                style={{ width: 150 }}
                filterOption={(input, option) =>
                  option ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
                }
              >
                {userList.map(item => (
                  <Option value={item.name} key={item.name}>
                    {item.name}-{item.showName}
                  </Option>
                ))}
              </Select>
            </FItem>
            <Button className={styles.newRecord} onClick={buttonClick} type="primary">
              搜索
            </Button>
          </Form>
        </Card>
        <Table
          pagination={paginaConfig}
          columns={columns}
          expandedRowRender={record => (
            <div className={styles.detail}>
              <Avatar src={record.avatar} />
              <p className={styles.say}>我想对你说: {record.saySome}</p>
            </div>
          )}
          dataSource={tableData}
        />
      </div>
    </div>
  );
};

export default connect(
  ({ user, login }: ConnectState) =>
    ({
      currentUser: user.currentUser,
      accessToken: login.accessToken,
    } as TableComProps),
)(TableCom);
