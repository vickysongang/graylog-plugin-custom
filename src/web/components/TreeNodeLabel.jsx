import React from 'react';

const TreeNodeLabel = React.createClass({
    render() {
        const {nodeData} = this.props
        return (
            <div>
                <div><span style={{width: '180px', wordBreak: 'break-all', fontSize: '12px', color: '#000'}}>{nodeData.name}</span></div>
                {
                    Object.keys(nodeData.attributes).map((key) => {
                        return <div><span>{key}:{nodeData.attributes[key]}</span></div>;
                    })
                }
            </div>
        )
    }
});

export default TreeNodeLabel;