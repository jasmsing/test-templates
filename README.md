# v2_template_format_invalid

This branch's [toolchain.yml](.bluemix/toolchain.yml) is syntactically valid YAML. However it is not a valid template due to its `header` field being an array rather than the expected string. We expect a readable error when trying to read a template from this branch.
