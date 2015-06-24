ember-cli-rename
===

Blueprint rename command for ember-cli. Currently a WIP, use at your own risk!

## Usage

To install `ember-cli-rename` run the following from inside an ember-cli project:
`ember install ember-cli-rename`

Then from inside the project (preferably the project root), run the following:
`ember rename <blueprint> <source> <destination>`

If you have not added the files to git, you will be prompted to do so before the rename process can continue.

```
ember rename <blueprint> <source> <destination> <options...>
  Moves files in an ember-cli project and updates path references.
  aliases: re
  --dry-run (Boolean) (Default: false)
    aliases: -d
  --verbose (Boolean) (Default: false)
    aliases: -v
  --force (Boolean) (Default: false)
    aliases: -f
  --pod (Boolean) (Default: false)
    aliases: -p
  --dummy (Boolean) (Default: false)
    aliases: -dum, -id
  --in-repo-addon (String) (Default: null)
    aliases: -in-repo <value>, -ir <value>
```