package org.graylog.plugins.custom;

import org.graylog2.plugin.Plugin;
import org.graylog2.plugin.PluginMetaData;
import org.graylog2.plugin.PluginModule;

import java.util.Collection;
import java.util.Collections;

/**
 * Implement the Plugin interface here.
 */
public class CustomPlugin implements Plugin {
    @Override
    public PluginMetaData metadata() {
        return new CustomMetaData();
    }

    @Override
    public Collection<PluginModule> modules () {
        return Collections.<PluginModule>singletonList(new CustomModule());
    }
}
