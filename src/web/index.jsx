// eslint-disable-next-line no-unused-vars
import webpackEntry from 'webpack-entry';

import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import packageJson from '../../package.json';

import Trace from 'pages/Trace';
import Monitor from 'pages/Monitor';
import FiledAnayzerChartComponent from 'components/FieldAnayzerChartComponent';
import ChartVisualization from 'pages/ChartVisualization';

const manifest = new PluginManifest(packageJson, {
  /* This is the place where you define which entities you are providing to the web interface.
     Right now you can add routes and navigation elements to it.

     Examples: */

  // Adding a route to /sample, rendering YourReactComponent when called:
  widgets: [
     {
        type: 'org.graylog.plugins.custom.widget.strategy.ChartWidgetStrategy',
        displayName: 'Custom Chart',
        defaultHeight: 2,
        defaultWidth: 2,
        visualizationComponent: ChartVisualization,
     },
  ],

  fieldAnalyzers: [
     {
        refId: 'fieldAnalyzerChartComponent',
        displayName: 'Custom Chart',
        component: FiledAnayzerChartComponent,
        displayPriority: 100,
     },
  ],
  routes: [
   { path: '/trace', component: Trace},
   { path: '/monitor', component: Monitor},
  ],

  // Adding an element to the top navigation pointing to /sample named "Sample":

  navigation: [
   { path: '/monitor', description: 'Monitor' },
  ]
});

PluginStore.register(manifest);

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => PluginStore.unregister(manifest));
}
