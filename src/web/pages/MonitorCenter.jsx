import React from 'react';
import MonitorTable from '../components/MonitorTable'
import MonitorBarChart from '../components/MonitorBarChart'
import MonitorRateBarChart from '../components/MonitorRateBarChart'
import TopNDataTable from '../components/TopNDataTable'
import { PageHeader } from 'components/common';

const  MonitorCenter = React.createClass({

    render() {
        return (
            <PageHeader title="">
                <div>
                    <div style={styles.containerItem}>
                        <MonitorRateBarChart key="CON-POD-24-RATE"
                                             text="CON-POD"
                                             subtext="24h内应用异常请求占比（耗时>2s或者响应code>=500）"
                                             width="33%" pod="CON"/>
                        <MonitorRateBarChart key="ADV-POD-24-RATE"
                                             text="ADV-POD"
                                             subtext="24h内应用异常请求占比（耗时>2s或者响应code>=500）"
                                             width="33%" pod="ADV"/>
                        <MonitorRateBarChart key="BAT-POD-24-RATE"
                                             text="BAT-POD"
                                             subtext="24h内应用异常请求占比（耗时>2s或者响应code>=500）"
                                             width="33%" pod="BAT"/>
                        <MonitorRateBarChart key="CON-POD-48-RATE"
                                             text="CON-POD"
                                             keyword="2 days ago to 1 day ago"
                                             subtext="24h-48h间应用异常请求占比（耗时>2s或者响应code>=500）"
                                             width="33%" pod="CON"/>
                        <MonitorRateBarChart key="ADV-POD-48-RATE"
                                             text="ADV-POD"
                                             keyword="2 days ago to 1 day ago"
                                             subtext="24h-48h间应用异常请求占比（耗时>2s或者响应code>=500）"
                                             width="33%" pod="ADV"/>
                        <MonitorRateBarChart key="BAT-POD-48-RATE"
                                             text="BAT-POD"
                                             keyword="2 days ago to 1 day ago"
                                             subtext="24h-48h间应用异常请求占比（耗时>2s或者响应code>=500）"
                                             width="33%" pod="BAT"/>
                        {/*<MonitorBarChart key="CON-POD-24" text="CON-POD" subtext="24h内应用服务访问情况" width="50%" pod="CON"/>*/}
                        {/*<MonitorBarChart key="CON-POD-48" text="CON-POD" subtext="24h-48h间应用服务访问情况" width="50%" pod="CON" keyword="2 days ago to 1 day ago"/>*/}
                        {/*<MonitorBarChart key="ADV-POD-24" text="ADV-POD" subtext="24h内应用服务访问情况" width="50%"pod="ADV" />*/}
                        {/*<MonitorBarChart key="ADV-POD-48" text="ADV-POD" subtext="24h-48h间应用服务访问情况" width="50%"pod="ADV" keyword="2 days ago to 1 day ago"/>*/}
                    </div>
                    <div style={styles.containerItem}>
                        <TopNDataTable key="TopN1"
                                       pod="CON"
                                       headerTitle="CON-POD异常访问请求Top10"/>
                        <TopNDataTable key="TopN2"
                                       pod="ADV"
                                       headerTitle="ADV-POD异常访问请求Top10"/>
                        <TopNDataTable key="TopN3"
                                       pod="BAT"
                                       headerTitle="BAT-POD异常访问请求Top10"/>
                    </div>
                </div>
            </PageHeader>
        );
    }
});

const styles = {
    containerItem: {
        width: '100%',
        display: 'flex',
        flexDirection:'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    }
}

export default MonitorCenter;