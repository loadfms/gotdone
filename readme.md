```
 ██████╗  ██████╗ ████████╗    ██████╗  ██████╗ ███╗   ██╗███████╗██╗
██╔════╝ ██╔═══██╗╚══██╔══╝    ██╔══██╗██╔═══██╗████╗  ██║██╔════╝██║
██║  ███╗██║   ██║   ██║       ██║  ██║██║   ██║██╔██╗ ██║█████╗  ██║
██║   ██║██║   ██║   ██║       ██║  ██║██║   ██║██║╚██╗██║██╔══╝  ╚═╝
╚██████╔╝╚██████╔╝   ██║       ██████╔╝╚██████╔╝██║ ╚████║███████╗██╗
 ╚═════╝  ╚═════╝    ╚═╝       ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝
```

This is a vanilla cli tool that provides a different way to track your achievements.
Instead of creating a stressful todo-lists, how about create a joyful done
list?

## Install

```sh
$ npm i @loadfms/gotdone -g
```

## Configuration

You can set where data file should be stored. Just create a new file under ~/.config/gotdone/config and add the line:
`data_path = PATH_TO_DATA_FILE`

> Obs: If a path is not provided the default location will be used (HOME_DIRECTORY/config).

## Usage

```sh
$ gotdone --help
```

Help output:

```
gotdone [command]

Commands:
  gotdone add     Add thing done
  gotdone list    List all tasks done
  gotdone remove  Remove item

Options:
  --help     Show help  [boolean]
  --version  Show version number  [boolean]
```

## Available commands

- [add](#add)
- [list](#list)
- [remove](#remove)

### add

```sh
$ gotdone add --help
```

Help output:

```
gotdone add

Add thing done

Options:
      --help         Show help  [boolean]
  -d, --description  Task description  [string] [required]
  -p, --points       Task points  [number] [required]
  -t, --tag          Task tag  [string] [required]
```

### list

```sh
$ gotdone list --help
```

Help output:

```
gotdone list

List all tasks done

Options:
      --help         Show help  [boolean]
  -d, --details      List all tasks details  [boolean]
  -D, --all-details  List all tasks details  [boolean]
```

### remove

```sh
$ gotdone remove --help
```

Help output:

```
gotdone remove

Remove item

Options:
  --help     Show help  [boolean]
  --id       Task id  [string] [required]
```

## License

MIT.
