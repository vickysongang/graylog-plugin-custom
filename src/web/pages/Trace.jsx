import React from 'react';
import { TraceActions, TraceStore } from 'stores/TraceStore';
import Reflux from 'reflux';
import { Spinner } from 'components/common';
import { PageHeader } from 'components/common';
import Tree from 'react-d3-tree';
import TreeNodeLabel from 'components/TreeNodeLabel';

const Trace = React.createClass({
    mixins: [Reflux.connect(TraceStore)],

    componentDidMount() {
        const promise = TraceActions.getTraceDatas(this.props.location.query.ecid);
        promise.catch(() => {
            console.log('load data error');
        });
    },

    transferTraceDatas(traceDatas, parentId) {
        let result = [], temp;
        for (let i = 0; i < traceDatas.length; i++) {
            if (traceDatas[i].parentId == parentId) {
                let obj = {
                    name: (i+1)+ ':' + traceDatas[i].request,
                    id: traceDatas[i].id,
                    attributes: {
                        '耗时': traceDatas[i]['time-taken'],
                        '节点': traceDatas[i].collector_node_id,
                    }
                };
                temp = this.transferTraceDatas(traceDatas, traceDatas[i].id);
                if (temp.length > 0) {
                    obj.children = temp;
                }
                result.push(obj);
            }
        }
        return result;
    },

    render() {
        if (!this.state.traceDatas) {
            return <Spinner/>;
        }
        let treeDatas = this.transferTraceDatas(this.state.traceDatas, undefined);
        return (
            <PageHeader title="Trace">
                <div id="treeWrapper" style={{width: '100em', height: '40em'}}>
                    <Tree data={treeDatas} translate={{x: 100, y: 200}} useCollapseData={true}
                          depthFactor={200}
                          allowForeignObjects
                          nodeLabelComponent={{
                              render: <TreeNodeLabel/>,
                              foreignObjectWrapper: {
                                  width: 180,
                                  height: 140,
                                  y: 14
                              }
                          }}
                    />
                </div>
            </PageHeader>
        );
    }
});

export default Trace;
