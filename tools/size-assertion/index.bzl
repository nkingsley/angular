# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""This test verifies that a set of top level symbols from a javascript file match a gold file.
"""

# This does a deep import under //internal because of not wanting the wrapper macro
# because it introduces an extra target_bin target.
load("@build_bazel_rules_nodejs//internal/node:node.bzl", "nodejs_binary", "nodejs_test")

def js_size_assertion_test(name, src, golden, data = [], **kwargs):
    """This test verifies that amount of minified bytes coming from each file does not exceed the golder file.
    """
    all_data = data + [
        src,
        golden,
        Label("//tools/size-assertion:lib"),
        Label("@bazel_tools//tools/bash/runfiles"),
        "@npm//tslib",
        "@npm//shelljs",
        # "@npm//source-map-explorer",
    ]
    entry_point = "angular/tools/size-assertion/cli.js"

    nodejs_test(
        name = name,
        data = all_data,
        entry_point = entry_point,
        templated_args = ["$(location %s)" % src, "$(location %s)" % golden],
        configuration_env_vars = ["compile"],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        configuration_env_vars = ["compile"],
        templated_args = ["$(location %s)" % src, "$(location %s)" % golden, "--accept"],
        **kwargs
    )
