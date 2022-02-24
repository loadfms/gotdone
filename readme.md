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

## Installation

`$ npm install @loadfms/gotdone -g`

## Configuration

You can set where data file should be stored. Just create a new file under ~/.config/gotdone/config and add the line:
`data_path = PATH_TO_DATA_FILE`

> Obs: If a path is not provided the default location will be used (HOME_DIRECTORY/config).

## Usage

### Add a done thing

`gotdone add [description]`

### Display a chart to show your progress over the time

`gotdone list`

### Display all done things and dates

`gotdone list -d`

### Display all done things dates and ids

`gotdone list -D`

### Remove a done thing

`gotdone remove [id]`

Made with :heart:
