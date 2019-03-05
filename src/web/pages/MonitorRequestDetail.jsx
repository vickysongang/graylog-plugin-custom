import React from 'react';
import Reflux from 'reflux';
import { MonitorActions, MonitorStore } from 'stores/MonitorStore';
import { PageHeader } from 'components/common';
import { Spinner } from 'components/common';
import { Table } from 'react-bootstrap';

const MonitorRequestDetail = React.createClass({
    mixins: [Reflux.connect(MonitorStore)],

    componentDidMount() {
        this.loadDatas();
        this.timer = setInterval(() => {
            console.log("60s刷新数据...");
            this.loadDatas()
        }, 60000);
    },

    loadDatas() {
        let { keyword, pod, app_name } = this.props.location.query
        keyword = keyword || '1 day ago';
        let uniqueKey = pod + "_" + keyword.replace(/ /g, "_") + "_request_detail";
        let query = "pod:" + pod;
        if (app_name) {
            uniqueKey = pod + "_" + app_name + "_" + keyword.replace(/ /g, "_") + "_request_detail";
            query = "pod:" + pod + " AND app_name:" + app_name;
        }
        const promise = MonitorActions.getMonitorDatas('count', keyword, 'request', query, uniqueKey);
        promise.catch(() => {
            console.log('load data error');
        });
    },

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    },

    render() {
        let monitorDatas = this.state.monitorDatas;
        let { keyword, pod, app_name } = this.props.location.query
        keyword = keyword || '1 day ago';
        let uniqueKey = pod + "_" + keyword.replace(/ /g, "_") + "_request_detail";
        let headerTitle = 'pod:' + pod
        if (app_name) {
            uniqueKey = pod + "_" + app_name + "_" + keyword.replace(/ /g, "_") + "_request_detail";
            headerTitle = headerTitle + ',应用:' + app_name;
        }
        headerTitle = '服务请求情况(' + headerTitle + ')';
        if (!monitorDatas[uniqueKey]) {
            return <Spinner/>;
        }
        let datas = [];
        Object.keys(monitorDatas[uniqueKey][0].terms).forEach((request) => {
            datas.push({
                request: request,
                allCount: monitorDatas[uniqueKey][0].terms[request],
                timeoutCount: monitorDatas[uniqueKey][1].terms[request] || 0,
                failCount: monitorDatas[uniqueKey][2].terms[request] || 0
            });
        })
        datas = datas.filter(function (data) {
            return data.timeoutCount > 0 || data.failCount > 0
        })
        datas = datas.sort((data1, data2) => {
            return (data1.timeoutCount + data1.failCount) / data1.allCount < (data2.timeoutCount + data2.failCount) / data2.allCount  ? 1 : -1;
        })
        return (
            <PageHeader title={headerTitle}>
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th style={{textAlign:'center', width: '5%'}}>#</th>
                        <th style={{textAlign:'center', width: '45%'}}>请求路径</th>
                        <th style={{textAlign:'center', width: '10%'}}>总访问量</th>
                        <th style={{textAlign:'center', width: '10%'}}>超时总访问量(耗时>2s)</th>
                        <th style={{textAlign:'center', width: '10%'}}>超时率</th>
                        <th style={{textAlign:'center', width: '10%'}}>错误总访问量(响应code>=500)</th>
                        <th style={{textAlign:'center', width: '10%'}}>错误率</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        datas.map((data, index) => {
                            return (
                                <tr key={ 'row' +index}>
                                    <td style={{textAlign:'center', width: '5%'}}>{index + 1}</td>
                                    <td style={{width: '45%', wordBreak: 'break-all'}}>{data.request}</td>
                                    <td style={{textAlign:'center', width: '10%'}}>{data.allCount}</td>
                                    <td style={{textAlign:'center', width: '10%'}}>{data.timeoutCount}</td>
                                    <td style={{textAlign:'center', width: '10%'}}>{((data.timeoutCount / data.allCount) * 100).toFixed(2) + '%'}</td>
                                    <td style={{textAlign:'center', width: '10%'}}>{data.failCount}</td>
                                    <td style={{textAlign:'center', width: '10%'}}>{((data.failCount / data.allCount) * 100).toFixed(2) + '%'}</td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </Table>
            </PageHeader>
        )
    }
});

export default  MonitorRequestDetail;