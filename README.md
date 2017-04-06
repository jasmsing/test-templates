# v2_version_numeric

Makes a common mistake, which is giving a numeric `version` field rather than the expected `string`:

```yml
version: 2  # parses as a number
```
