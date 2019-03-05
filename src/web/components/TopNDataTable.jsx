import React from 'react';
import { Table, Panel } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import { MonitorActions, MonitorStore } from 'stores/MonitorStore';
import { Spinner } from 'components/common';

const TopNDataTable = React.createClass({
    mixins: [Reflux.connect(MonitorStore)],

    propTypes : {
        headerTitle: PropTypes.string,
        pod: PropTypes.string,
        keyword: PropTypes.string,
        N: PropTypes.number
    },

    componentDidMount() {
        this.loadDatas();
        this.timer = setInterval(() => {
            console.log("60s刷新数据...");
            this.loadDatas()
        }, 60000);
    },

    loadDatas() {
        let {  keyword, pod } = this.props
        keyword = keyword || '1 day ago';
        let uniqueKey = pod + "_" + keyword.replace(/ /g, "_") + "_request_topn_data";
        let query = "pod:" + pod;
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
        let { keyword, pod } = this.props
        keyword = keyword || '1 day ago';
        let uniqueKey = pod + "_" + keyword.replace(/ /g, "_") + "_request_topn_data";
        if (!monitorDatas[uniqueKey]) {
            return <Spinner/>;
        }
        let datas = [];
        Object.keys(monitorDatas[uniqueKey][0].terms).forEach((request) => {
            let allCount =  monitorDatas[uniqueKey][0].terms[request];
            let timeoutCount = monitorDatas[uniqueKey][1].terms[request] || 0;
            let errorCount = monitorDatas[uniqueKey][2].terms[request] || 0;
            datas.push({
                request: request,
                allCount: allCount,
                timeoutCount: timeoutCount,
                errorCount: errorCount,
                unnormalCount: (timeoutCount + errorCount)
            });
        })
        datas = datas.filter((data) => {
            return data.unnormalCount > 0
        }).sort((data1, data2) => {
            return data1.unnormalCount / (data1.allCount || 1) < data2.unnormalCount / (data2.allCount || 1) ? 1 : -1;
        }).slice(0, this.props.N || 10)
        return (
            <Panel style={{ width: '33%' }} header={this.props.headerTitle}>
                <Table striped bordered hover size="sm" >
                    <tr>
                        <th style={{textAlign:'center', width: '60%'}}>请求</th>
                        <th style={{textAlign:'center', width: '15%'}}>总量</th>
                        <th style={{textAlign:'center', width: '15%'}}>超时量</th>
                        <th style={{textAlign:'center', width: '15%'}}>错误量</th>
                        <th style={{textAlign:'center', width: '10%'}}>异常率</th>
                    </tr>
                    <tbody>
                        {
                            datas.map((data, index) => {
                                return (
                                    <tr key={'row' + index}>
                                        <td style={{wordBreak: 'break-all', width: '60%'}}>{data.request}</td>
                                        <td style={{textAlign:'center', width: '15%'}}>{data.allCount}</td>
                                        <td style={{textAlign:'center', width: '15%'}}>{data.timeoutCount}</td>
                                        <td style={{textAlign:'center', width: '15%'}}>{data.errorCount}</td>
                                        <td style={{textAlign:'center', width: '10%'}}>{((data.unnormalCount / data.allCount) * 100).toFixed(2) + '%'}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Panel>
        )
    }
});

export default  TopNDataTable;