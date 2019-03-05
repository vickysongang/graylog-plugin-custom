import React from 'react';
import { Spinner } from 'components/common';
import { MonitorActions, MonitorStore } from 'stores/MonitorStore';
import { Table } from 'react-bootstrap';
import Reflux from 'reflux';

const MonitorTable = React.createClass({
    mixins: [Reflux.connect(MonitorStore)],

    componentDidMount() {
        this.loadDatas();
        this.timer = setInterval(() => {
            console.log("10s刷新数据...");
            this.loadDatas()
        }, 10000);
    },

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    },

    loadDatas() {
        const promise = MonitorActions.getMonitorDatas('relative', 'app_pod', '*');
        promise.catch(() => {
            console.log('load data error');
        });
    },

    render() {
        if (!this.state.monitorDatas) {
            return <Spinner/>;
        }
        let monitorDatas = this.state.monitorDatas;
        let datas = [];
        Object.keys(monitorDatas[0].terms).forEach((pod) => {
           datas.push({
               pod: pod,
               allCount: monitorDatas[0].terms[pod],
               timeoutCount: monitorDatas[1].terms[pod] || 0,
               failCount: monitorDatas[2].terms[pod] || 0,
               healthRate : ((monitorDatas[1].terms[pod] || 0) + (monitorDatas[2].terms[pod] || 0)) / monitorDatas[0].terms[pod]
           });
        })
        datas = datas.sort((data1, data2) => {
            return data1.healthRate < data2.healthRate ? 1 : -1;
        })
        return (
            <Table striped bordered hover size="sm" >
                <thead>
                <tr>
                    <th style={{textAlign:'center'}}>#</th>
                    <th style={{textAlign:'center'}}>应用</th>
                    <th style={{textAlign:'center'}}>总请求数</th>
                    <th style={{textAlign:'center'}}>超时请求数(>2s)</th>
                    <th style={{textAlign:'center'}}>超时率</th>
                    <th style={{textAlign:'center'}}>报错请求数(5xx)</th>
                    <th style={{textAlign:'center'}}>报错率</th>
                    <th style={{textAlign:'center'}}>健康度(（超时数+报错数）/ 总请求数)</th>
                </tr>
                </thead>
                <tbody>
                    {
                        datas.map((data, index) => {
                            let color = 'green';
                            if (data.healthRate <= 0.1) {
                                color = 'green';
                            } else if (data.healthRate <= 0.5) {
                                color = 'yellow';
                            } else {
                                color = 'red';
                            }
                            return (
                                <tr>
                                    <td style={{textAlign:'center'}}>{index + 1}</td>
                                    <td style={{textAlign:'center'}}>{data.pod}</td>
                                    <td style={{textAlign:'center'}}>{data.allCount}</td>
                                    <td style={{textAlign:'center'}}>{data.timeoutCount}</td>
                                    <td style={{textAlign:'center'}}>{((data.timeoutCount / data.allCount) * 100).toFixed(2) + '%'}</td>
                                    <td style={{textAlign:'center'}}>{data.failCount}</td>
                                    <td style={{textAlign:'center'}}>{((data.failCount / data.allCount) * 100).toFixed(2) + '%'}</td>
                                    <td style={{textAlign:'center'}}>
                                        <div style={{
                                            height: '20px',
                                            width: '20px',
                                            borderRadius: '50%',
                                            marginLeft: '48%',
                                            background: color,
                                        }}></div>
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </Table>
        );
    }
});

export default MonitorTable;