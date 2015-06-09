# ember rename
The `ember rename` command is similar to the `ember mv` command, but instead of paths, takes an additional `blueprint` argument that provides context to generate the source and destination paths. The `ember rename` command leverages the `ember mv` command, generating paths for the source and dest, then calling the command. The rename command will update all files that would normally be generated from a blueprint.

### Usage
ember rename [r]: `ember r <blueprint> <source> <dest> [options]...`

The arguments; blueprint, source, and dest should be strings with no extension, as it is derived from the files associated with the defined blueprint argument.

#### Arguments
| name | description |
| ---- | ----------- |
| blueprint | name of the blueprint to use as context |
| source | name of existing generated blueprint |
| dest | path to generate destination |

#### Options
| name | description |
| ---- | ----------- |
| dry-run | run and log output without actually executing |
| verbose | log all actions |
| force | overwrite any existing destination files |
| structure | structure to use as context for looking up path (pod, type, addon) |

### Examples:
Given the following app structure:
```
app
├── components
│   └── foo-bar.js
│   └── bar
│       └── foo-baz.js
├── routes
├── templates
│   └── components
│       └── foo-bar.js
│       └── bar
│           └── foo-baz.js
...
```
```
ember r component foo-bar bar-foo
```
 
### Process

1. `ember r <blueprint> <source> <dest> [options]...`
2. pre-process:
  1. generate paths
    * lookup BLUEPRINT
    * get fileInfos for any files that would be generated
    * construct paths for source and dest
  2. pre-verify:
    * SOURCE path exists 
    * DEST path does not already exist
  4. beforeMove hook
  5. prompt user
3. process:
  1. create dest dir(s) they don't already exist
  2. loop through file list and run `ember mv <source> <dest> <options>`
4. post-process:
  1. afterMove hook