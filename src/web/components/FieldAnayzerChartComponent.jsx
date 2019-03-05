import  React from 'react';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import { Spinner } from 'components/common';
import AddToDashboardMenu from 'components/dashboard/AddToDashboardMenu';
import { Button, DropdownButton, MenuItem } from 'react-bootstrap';
import EventHandlersThrottler from 'util/EventHandlersThrottler';
import StoreProvider from 'injection/StoreProvider';
import ChartVisualization from 'pages/ChartVisualization';
const RefreshStore = StoreProvider.getStore('Refresh');
import { ChartActions, ChartStore } from 'stores/ChartStore';

const FiledAnayzerChartComponent = React.createClass({
  propTypes : {
      stream: PropTypes.object,
      permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
      query: PropTypes.string.isRequired,
      page: PropTypes.number.isRequired,
      rangeType: PropTypes.string.isRequired,
      rangeParams: PropTypes.object.isRequired,
      forceFetch: PropTypes.bool,
  },

  mixins: [Reflux.connect(ChartStore), Reflux.listenTo(RefreshStore, '_setupTimer', '_setupTimer')],

  getInitialState() {
      return {
          field: undefined,
          width: this.DEFAULT_WIDTH,
          dropdownIsOpen: false,
          dimension: 'count',
      };
  },

  toggleDropdown() {
    this.setState({dropdownIsOpen: !this.state.dropdownIsOpen});
  },

  componentWillMount() {
    this.setState({dropdownIsOpen: false});
  },

  componentDidMount() {
     window.addEventListener('resize', this._onResize);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.query !== nextProps.query || this.props.rangeType !== nextProps.rangeType ||
    JSON.stringify(this.props.rangeParams) !== JSON.stringify(nextProps.rangeParams) ||
    this.props.stream !== nextProps.stream || nextProps.forceFetch) {
        this._loadData(nextProps);
    }
  },

  _setupTimer(refresh) {
    this._stopTimer();
    if (refresh.enabled) {
        this.timer = setInterval(() => {
            this._loadData(this.props);
        }, refresh.interval);
    }
  },

  _stopTimer() {
    if (this.timer) {
        clearInterval(this.timer);
    }
  },

  DEFAULT_WIDTH: 800,
  WIDGET_TYPE: 'org.graylog.plugins.custom.widget.strategy.ChartWidgetStrategy',
  eventThrottler: new EventHandlersThrottler(),

  addField(field) {
      this.setState({field: field}, () => {
          this._updateChartWidth();
          this._loadData(this.props);
      });
  },

  _onResize() {
      this.eventThrottler.throttle(() => {
         this._updateChartWidth();
      });
  },

  _updateChartWidth() {
      this.setState({
          width: (this.refs.chartContainer ? this.refs.chartContainer.clientWidth : this.DEFAULT_WIDTH),
      });
  },

  _getStreamId() {
    return this.props.stream ? this.props.stream.id : null;
  },

  _loadData(props) {
    if (this.state.field !== undefined) {
        const promise = ChartActions.getChartDatas(
            props.query,
            this.state.field,
            props.rangeType,
            props.rangeParams,
            this._getStreamId(),
            this.state.dimension || 'count'
        );
        promise.catch(() => this._resetStatus());
    }
  },

  _resetStatus() {
    this.setState(this.getInitialState());
  },

  _showVizOptions(type) {
      this.setState({
          dimension: type,
      }, () => {
          this._loadData(this.props);
      });
  },

  render() {
    let content;
    let inner;

    const menus = (
          <DropdownButton bsSize="small"
                          className="graph-settings"
                          title="Customize"
                          id="customize-field-graph-dropdown"
                          pullRight>
              <MenuItem onSelect={() => {this._showVizOptions('count')}}>访问量</MenuItem>
              <MenuItem onSelect={() => {this._showVizOptions('ratio')}}>指定访问量占比</MenuItem>
              <MenuItem onSelect={() => {this._showVizOptions('avgRespTime')}}>平均响应时间</MenuItem>
          </DropdownButton>
      );

    if (!this.state.chartDatas) {
      inner = <Spinner />;
    } else {
      inner = <ChartVisualization chartDatas={this.state.chartDatas}/>;
    }

    if (this.state.field !== undefined) {
      content = (
        <div className='content-col'>
          <div className='pull-right'>
            <AddToDashboardMenu title='Add to Dashboard'
                                widgetType={this.WIDGET_TYPE}
                                configuration={{
                                    query: this.props.query,
                                    field: this.state.field,
                                    rangeType: this.props.rangeType,
                                    rangeParams: this.props.rangeParams,
                                    streamId: this._getStreamId(),
                                    dimension: this.state.dimension || 'count'
                                }}
                                pullRight
                                permissions={this.props.permissions}
                                appendMenus={menus}
            >
                <Button bsSize='small' onClick={() => this._resetStatus()}>
                    <i className='fa fa-close'></i>
                </Button>
            </AddToDashboardMenu>
          </div>
          <h1>Chart for field: {this.state.field}</h1>
          <div ref='chartContainer' style={{maxHeight: 400, overflow: 'auto', marginTop: 10}}>
              {inner}
          </div>
        </div>
      );
    }
    return (
      <div id='field-quick-chart-values'>
          {content}
      </div>
    );
  },
});

export default FiledAnayzerChartComponent;
