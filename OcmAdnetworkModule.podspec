require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "OcmAdnetworkModule"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/PredragJ/react-native-ocm-adnetwork-module.git",
                     :tag => s.version.to_s }

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  s.private_header_files = "ios/**/*.h"
  s.static_framework = true
  s.requires_arc  = true
  s.swift_version = "5.9"

  s.dependency "React-Core"
  s.dependency "React-RCTAppDelegate"
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly"
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"
  s.dependency 'OCMAdNetworkIOS', '~> 1.1.1'

  s.pod_target_xcconfig = {
    "OTHER_LDFLAGS" => "-lc++"
  }
end