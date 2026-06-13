source "https://rubygems.org"

gem "fastlane"

plugins_path = File.join(File.dirname(__file__), 'fastlane', 'Pluginfile')
eval_path = File.exist?(plugins_path) ? plugins_path : nil
eval(File.read(plugins_path), binding) if eval_path